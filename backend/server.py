from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Response, Request
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import httpx
from io import BytesIO
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'atsforge_jwt_secret_key_2024')
JWT_ALGORITHM = "HS256"
OPENROUTER_KEY = os.environ.get('OPENROUTER_KEY')

app = FastAPI(title="ATSForge API")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ========================
# HEALTH CHECK
# ========================

@api_router.get("/")
async def health_check():
    return {"message": "ATSForge API is running", "status": "healthy"}

# ========================
# MODELS
# ========================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    onboarding_completed: bool = False
    created_at: datetime

class OnboardingData(BaseModel):
    experience_level: str
    industry: str
    target_roles: List[str]
    country: str
    resume_style: str

class ResumeCreate(BaseModel):
    title: str
    content: Optional[Dict[str, Any]] = None

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[Dict[str, Any]] = None

class Resume(BaseModel):
    resume_id: str
    user_id: str
    title: str
    content: Dict[str, Any]
    ats_score: Optional[int] = None
    version: int = 1
    created_at: datetime
    updated_at: datetime

class ChatMessage(BaseModel):
    role: str
    content: str

class ResumeGenerateRequest(BaseModel):
    messages: List[ChatMessage]
    resume_id: Optional[str] = None
    section: Optional[str] = None

class CoverLetterCreate(BaseModel):
    title: str
    job_description: str
    resume_id: Optional[str] = None
    tone: str = "professional"
    company_name: Optional[str] = None
    position: Optional[str] = None

class CoverLetter(BaseModel):
    cover_letter_id: str
    user_id: str
    title: str
    content: str
    job_description: str
    tone: str
    created_at: datetime
    updated_at: datetime

class ATSOptimizeRequest(BaseModel):
    resume_content: Dict[str, Any]
    job_description: Optional[str] = None

class ATSScoreResponse(BaseModel):
    score: int
    issues: List[Dict[str, str]]
    suggestions: List[str]
    keyword_matches: List[str]
    missing_keywords: List[str]

# ========================
# AUTH HELPERS
# ========================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> User:
    # Check cookie first
    token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if it's a session token (from Google OAuth)
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if session:
        expires_at = session.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        
        user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
        if not user_doc:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user_doc)
    
    # Check if it's a JWT token (from email/password auth)
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if not user_doc:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user_doc)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ========================
# AUTH ENDPOINTS
# ========================

@api_router.post("/auth/register")
async def register(user_data: UserCreate, response: Response):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    hashed_pw = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": hashed_pw,
        "picture": None,
        "onboarding_completed": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id)
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "token": token,
        "onboarding_completed": False
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user_doc["user_id"])
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {
        "user_id": user_doc["user_id"],
        "email": user_doc["email"],
        "name": user_doc["name"],
        "picture": user_doc.get("picture"),
        "token": token,
        "onboarding_completed": user_doc.get("onboarding_completed", False)
    }

@api_router.post("/auth/session")
async def process_google_session(request: Request, response: Response):
    """Process session_id from Emergent Google OAuth"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Fetch session data from Emergent Auth
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if resp.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            session_data = resp.json()
        except Exception as e:
            logger.error(f"Error fetching session data: {e}")
            raise HTTPException(status_code=500, detail="Auth service error")
    
    email = session_data.get("email")
    name = session_data.get("name")
    picture = session_data.get("picture")
    session_token = session_data.get("session_token")
    
    # Find or create user
    user_doc = await db.users.find_one({"email": email}, {"_id": 0})
    
    if user_doc:
        user_id = user_doc["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
        onboarding_completed = user_doc.get("onboarding_completed", False)
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "onboarding_completed": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        onboarding_completed = False
    
    # Store session
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": picture,
        "onboarding_completed": onboarding_completed
    }

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "onboarding_completed": user.onboarding_completed
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ========================
# ONBOARDING ENDPOINTS
# ========================

@api_router.post("/users/onboarding")
async def save_onboarding(data: OnboardingData, user: User = Depends(get_current_user)):
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "onboarding": data.model_dump(),
            "onboarding_completed": True
        }}
    )
    return {"message": "Onboarding completed", "onboarding_completed": True}

@api_router.get("/users/onboarding")
async def get_onboarding(user: User = Depends(get_current_user)):
    user_doc = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return {"onboarding": user_doc.get("onboarding"), "onboarding_completed": user_doc.get("onboarding_completed", False)}

# ========================
# RESUME ENDPOINTS
# ========================

@api_router.post("/resumes", response_model=Resume)
async def create_resume(resume_data: ResumeCreate, user: User = Depends(get_current_user)):
    resume_id = f"resume_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    
    resume_doc = {
        "resume_id": resume_id,
        "user_id": user.user_id,
        "title": resume_data.title,
        "content": resume_data.content or {
            "personalInfo": {"name": "", "email": "", "phone": "", "location": "", "linkedin": ""},
            "summary": "",
            "experience": [],
            "education": [],
            "skills": [],
            "certifications": []
        },
        "ats_score": None,
        "version": 1,
        "created_at": now,
        "updated_at": now
    }
    
    await db.resumes.insert_one(resume_doc)
    resume_doc.pop("_id", None)
    
    return Resume(**{**resume_doc, "created_at": datetime.fromisoformat(now), "updated_at": datetime.fromisoformat(now)})

@api_router.get("/resumes", response_model=List[Resume])
async def get_resumes(user: User = Depends(get_current_user)):
    resumes = await db.resumes.find({"user_id": user.user_id}, {"_id": 0}).sort("updated_at", -1).to_list(100)
    result = []
    for r in resumes:
        if isinstance(r["created_at"], str):
            r["created_at"] = datetime.fromisoformat(r["created_at"])
        if isinstance(r["updated_at"], str):
            r["updated_at"] = datetime.fromisoformat(r["updated_at"])
        result.append(Resume(**r))
    return result

@api_router.get("/resumes/{resume_id}", response_model=Resume)
async def get_resume(resume_id: str, user: User = Depends(get_current_user)):
    resume = await db.resumes.find_one({"resume_id": resume_id, "user_id": user.user_id}, {"_id": 0})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    if isinstance(resume["created_at"], str):
        resume["created_at"] = datetime.fromisoformat(resume["created_at"])
    if isinstance(resume["updated_at"], str):
        resume["updated_at"] = datetime.fromisoformat(resume["updated_at"])
    
    return Resume(**resume)

@api_router.put("/resumes/{resume_id}", response_model=Resume)
async def update_resume(resume_id: str, update_data: ResumeUpdate, user: User = Depends(get_current_user)):
    resume = await db.resumes.find_one({"resume_id": resume_id, "user_id": user.user_id}, {"_id": 0})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    update_fields = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if update_data.title:
        update_fields["title"] = update_data.title
    if update_data.content:
        update_fields["content"] = update_data.content
    
    update_fields["version"] = resume.get("version", 1) + 1
    
    await db.resumes.update_one({"resume_id": resume_id}, {"$set": update_fields})
    
    updated = await db.resumes.find_one({"resume_id": resume_id}, {"_id": 0})
    if isinstance(updated["created_at"], str):
        updated["created_at"] = datetime.fromisoformat(updated["created_at"])
    if isinstance(updated["updated_at"], str):
        updated["updated_at"] = datetime.fromisoformat(updated["updated_at"])
    
    return Resume(**updated)

@api_router.delete("/resumes/{resume_id}")
async def delete_resume(resume_id: str, user: User = Depends(get_current_user)):
    result = await db.resumes.delete_one({"resume_id": resume_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {"message": "Resume deleted"}

@api_router.post("/resumes/{resume_id}/duplicate", response_model=Resume)
async def duplicate_resume(resume_id: str, user: User = Depends(get_current_user)):
    original = await db.resumes.find_one({"resume_id": resume_id, "user_id": user.user_id}, {"_id": 0})
    if not original:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    new_id = f"resume_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    
    new_resume = {
        **original,
        "resume_id": new_id,
        "title": f"{original['title']} (Copy)",
        "version": 1,
        "created_at": now,
        "updated_at": now
    }
    
    await db.resumes.insert_one(new_resume)
    new_resume.pop("_id", None)
    new_resume["created_at"] = datetime.fromisoformat(now)
    new_resume["updated_at"] = datetime.fromisoformat(now)
    
    return Resume(**new_resume)

# ========================
# AI GENERATION ENDPOINTS
# ========================

@api_router.post("/resumes/generate")
async def generate_resume_content(request: ResumeGenerateRequest, user: User = Depends(get_current_user)):
    """Generate or improve resume content using AI"""
    
    system_prompt = """You are an expert ATS-friendly resume writer. Your task is to help create professional, ATS-optimized resumes.

RULES:
1. Never fabricate experience or skills - only work with what the user provides
2. Use strong action verbs (Led, Developed, Implemented, Achieved, etc.)
3. Include quantified achievements when possible (%, $, numbers)
4. Keep formatting simple - no tables, columns, or graphics
5. Use clear section headers
6. Keep bullet points concise (1-2 lines each)
7. Maintain professional tone
8. Focus on relevant keywords for the target role

When generating content, output in JSON format with the following structure:
{
  "personalInfo": {"name": "", "email": "", "phone": "", "location": "", "linkedin": ""},
  "summary": "Professional summary (2-3 sentences)",
  "experience": [{"company": "", "title": "", "location": "", "startDate": "", "endDate": "", "bullets": []}],
  "education": [{"school": "", "degree": "", "field": "", "graduationDate": "", "gpa": ""}],
  "skills": ["skill1", "skill2"],
  "certifications": [{"name": "", "issuer": "", "date": ""}]
}

If the user asks for improvements to a specific section, only return that section.
If generating the full resume, return the complete JSON structure."""

    messages_for_api = [{"role": "system", "content": system_prompt}]
    for msg in request.messages:
        messages_for_api.append({"role": msg.role, "content": msg.content})
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as http_client:
            response = await http_client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "anthropic/claude-3.5-sonnet",
                    "messages": messages_for_api,
                    "max_tokens": 4000
                }
            )
            
            if response.status_code != 200:
                logger.error(f"OpenRouter error: {response.text}")
                raise HTTPException(status_code=500, detail="AI service error")
            
            result = response.json()
            ai_content = result["choices"][0]["message"]["content"]
            
            return {"content": ai_content, "message": "Content generated successfully"}
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI service timeout")
    except Exception as e:
        logger.error(f"AI generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/resumes/optimize", response_model=ATSScoreResponse)
async def optimize_resume(request: ATSOptimizeRequest, user: User = Depends(get_current_user)):
    """Analyze resume for ATS compatibility and provide optimization suggestions"""
    
    resume_text = json.dumps(request.resume_content, indent=2)
    job_desc = request.job_description or "General professional position"
    
    system_prompt = """You are an ATS (Applicant Tracking System) expert. Analyze the resume and provide:
1. An ATS score from 0-100
2. List of issues found (with severity: high, medium, low)
3. Specific suggestions for improvement
4. Keywords that match the job description
5. Important keywords that are missing

Return your analysis as JSON:
{
  "score": 85,
  "issues": [{"severity": "high", "issue": "Missing quantified achievements", "section": "experience"}],
  "suggestions": ["Add specific metrics to your achievements", "Include more industry keywords"],
  "keyword_matches": ["Python", "Leadership", "Project Management"],
  "missing_keywords": ["Agile", "Scrum", "Data Analysis"]
}"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Resume:\n{resume_text}\n\nJob Description:\n{job_desc}\n\nAnalyze this resume for ATS optimization."}
    ]
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as http_client:
            response = await http_client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "anthropic/claude-3.5-sonnet",
                    "messages": messages,
                    "max_tokens": 2000
                }
            )
            
            if response.status_code != 200:
                logger.error(f"OpenRouter error: {response.text}")
                raise HTTPException(status_code=500, detail="AI service error")
            
            result = response.json()
            ai_content = result["choices"][0]["message"]["content"]
            
            # Parse the JSON response
            try:
                # Extract JSON from the response
                import re
                json_match = re.search(r'\{[\s\S]*\}', ai_content)
                if json_match:
                    analysis = json.loads(json_match.group())
                else:
                    analysis = json.loads(ai_content)
            except json.JSONDecodeError:
                analysis = {
                    "score": 70,
                    "issues": [{"severity": "medium", "issue": "Could not fully analyze", "section": "general"}],
                    "suggestions": ["Review resume formatting", "Add more keywords"],
                    "keyword_matches": [],
                    "missing_keywords": []
                }
            
            return ATSScoreResponse(
                score=analysis.get("score", 70),
                issues=analysis.get("issues", []),
                suggestions=analysis.get("suggestions", []),
                keyword_matches=analysis.get("keyword_matches", []),
                missing_keywords=analysis.get("missing_keywords", [])
            )
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI service timeout")
    except Exception as e:
        logger.error(f"ATS analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# COVER LETTER ENDPOINTS
# ========================

@api_router.post("/cover-letters", response_model=CoverLetter)
async def create_cover_letter(data: CoverLetterCreate, user: User = Depends(get_current_user)):
    """Generate a cover letter using AI"""
    
    # Get resume content if provided
    resume_content = ""
    if data.resume_id:
        resume = await db.resumes.find_one({"resume_id": data.resume_id, "user_id": user.user_id}, {"_id": 0})
        if resume:
            resume_content = json.dumps(resume.get("content", {}), indent=2)
    
    tone_instructions = {
        "professional": "Use a formal, professional tone appropriate for corporate environments.",
        "friendly": "Use a warm, approachable tone while remaining professional.",
        "confident": "Use a confident, assertive tone that highlights achievements.",
        "enthusiastic": "Use an enthusiastic, energetic tone showing passion for the role."
    }
    
    system_prompt = f"""You are an expert cover letter writer. Create a compelling, ATS-friendly cover letter.

RULES:
1. Never fabricate experience - only reference what's in the resume
2. {tone_instructions.get(data.tone, tone_instructions['professional'])}
3. Keep it to 3-4 paragraphs
4. Address specific requirements from the job description
5. Include relevant keywords naturally
6. Start with a strong opening that grabs attention
7. End with a clear call to action
8. Do not use generic phrases like "I am writing to apply"

Generate the cover letter as plain text, ready to send."""

    user_prompt = f"""Create a cover letter for:
Company: {data.company_name or 'the company'}
Position: {data.position or 'the position'}

Job Description:
{data.job_description}

{"Resume/Background:" + resume_content if resume_content else ""}

Write a compelling cover letter that matches this job description."""

    try:
        async with httpx.AsyncClient(timeout=60.0) as http_client:
            response = await http_client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "anthropic/claude-3.5-sonnet",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "max_tokens": 2000
                }
            )
            
            if response.status_code != 200:
                logger.error(f"OpenRouter error: {response.text}")
                raise HTTPException(status_code=500, detail="AI service error")
            
            result = response.json()
            cover_letter_content = result["choices"][0]["message"]["content"]
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI service timeout")
    except Exception as e:
        logger.error(f"Cover letter generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    cover_letter_id = f"cl_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    
    cl_doc = {
        "cover_letter_id": cover_letter_id,
        "user_id": user.user_id,
        "title": data.title,
        "content": cover_letter_content,
        "job_description": data.job_description,
        "tone": data.tone,
        "created_at": now,
        "updated_at": now
    }
    
    await db.cover_letters.insert_one(cl_doc)
    cl_doc.pop("_id", None)
    
    return CoverLetter(**{**cl_doc, "created_at": datetime.fromisoformat(now), "updated_at": datetime.fromisoformat(now)})

@api_router.get("/cover-letters", response_model=List[CoverLetter])
async def get_cover_letters(user: User = Depends(get_current_user)):
    letters = await db.cover_letters.find({"user_id": user.user_id}, {"_id": 0}).sort("updated_at", -1).to_list(100)
    result = []
    for cl in letters:
        if isinstance(cl["created_at"], str):
            cl["created_at"] = datetime.fromisoformat(cl["created_at"])
        if isinstance(cl["updated_at"], str):
            cl["updated_at"] = datetime.fromisoformat(cl["updated_at"])
        result.append(CoverLetter(**cl))
    return result

@api_router.get("/cover-letters/{cover_letter_id}", response_model=CoverLetter)
async def get_cover_letter(cover_letter_id: str, user: User = Depends(get_current_user)):
    cl = await db.cover_letters.find_one({"cover_letter_id": cover_letter_id, "user_id": user.user_id}, {"_id": 0})
    if not cl:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    
    if isinstance(cl["created_at"], str):
        cl["created_at"] = datetime.fromisoformat(cl["created_at"])
    if isinstance(cl["updated_at"], str):
        cl["updated_at"] = datetime.fromisoformat(cl["updated_at"])
    
    return CoverLetter(**cl)

@api_router.put("/cover-letters/{cover_letter_id}")
async def update_cover_letter(cover_letter_id: str, content: str, user: User = Depends(get_current_user)):
    result = await db.cover_letters.update_one(
        {"cover_letter_id": cover_letter_id, "user_id": user.user_id},
        {"$set": {"content": content, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    return {"message": "Updated"}

@api_router.delete("/cover-letters/{cover_letter_id}")
async def delete_cover_letter(cover_letter_id: str, user: User = Depends(get_current_user)):
    result = await db.cover_letters.delete_one({"cover_letter_id": cover_letter_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    return {"message": "Deleted"}

# ========================
# EXPORT ENDPOINTS
# ========================

@api_router.post("/export/pdf/{resume_id}")
async def export_resume_pdf(resume_id: str, user: User = Depends(get_current_user)):
    """Export resume as PDF"""
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_LEFT
    
    resume = await db.resumes.find_one({"resume_id": resume_id, "user_id": user.user_id}, {"_id": 0})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    content = resume.get("content", {})
    buffer = BytesIO()
    
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=18, spaceAfter=6)
    heading_style = ParagraphStyle('Heading', parent=styles['Heading2'], fontSize=12, spaceBefore=12, spaceAfter=6)
    normal_style = ParagraphStyle('Normal', parent=styles['Normal'], fontSize=10, spaceAfter=4)
    bullet_style = ParagraphStyle('Bullet', parent=styles['Normal'], fontSize=10, leftIndent=20, spaceAfter=2)
    
    story = []
    
    # Personal Info
    personal = content.get("personalInfo", {})
    if personal.get("name"):
        story.append(Paragraph(personal["name"], title_style))
    
    contact_parts = []
    if personal.get("email"):
        contact_parts.append(personal["email"])
    if personal.get("phone"):
        contact_parts.append(personal["phone"])
    if personal.get("location"):
        contact_parts.append(personal["location"])
    if contact_parts:
        story.append(Paragraph(" | ".join(contact_parts), normal_style))
    
    if personal.get("linkedin"):
        story.append(Paragraph(personal["linkedin"], normal_style))
    
    story.append(Spacer(1, 12))
    
    # Summary
    if content.get("summary"):
        story.append(Paragraph("PROFESSIONAL SUMMARY", heading_style))
        story.append(Paragraph(content["summary"], normal_style))
    
    # Experience
    if content.get("experience"):
        story.append(Paragraph("EXPERIENCE", heading_style))
        for exp in content["experience"]:
            title_line = f"<b>{exp.get('title', '')}</b> at {exp.get('company', '')}"
            if exp.get('location'):
                title_line += f" - {exp['location']}"
            story.append(Paragraph(title_line, normal_style))
            
            dates = f"{exp.get('startDate', '')} - {exp.get('endDate', 'Present')}"
            story.append(Paragraph(dates, normal_style))
            
            for bullet in exp.get("bullets", []):
                story.append(Paragraph(f"• {bullet}", bullet_style))
    
    # Education
    if content.get("education"):
        story.append(Paragraph("EDUCATION", heading_style))
        for edu in content["education"]:
            edu_line = f"<b>{edu.get('degree', '')}</b> in {edu.get('field', '')} - {edu.get('school', '')}"
            story.append(Paragraph(edu_line, normal_style))
            if edu.get("graduationDate"):
                story.append(Paragraph(f"Graduated: {edu['graduationDate']}", normal_style))
    
    # Skills
    if content.get("skills"):
        story.append(Paragraph("SKILLS", heading_style))
        skills_text = ", ".join(content["skills"])
        story.append(Paragraph(skills_text, normal_style))
    
    # Certifications
    if content.get("certifications"):
        story.append(Paragraph("CERTIFICATIONS", heading_style))
        for cert in content["certifications"]:
            cert_line = f"{cert.get('name', '')} - {cert.get('issuer', '')}"
            if cert.get('date'):
                cert_line += f" ({cert['date']})"
            story.append(Paragraph(cert_line, normal_style))
    
    doc.build(story)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={resume['title']}.pdf"}
    )

@api_router.post("/export/docx/{resume_id}")
async def export_resume_docx(resume_id: str, user: User = Depends(get_current_user)):
    """Export resume as DOCX"""
    from docx import Document
    from docx.shared import Inches, Pt
    from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
    
    resume = await db.resumes.find_one({"resume_id": resume_id, "user_id": user.user_id}, {"_id": 0})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    content = resume.get("content", {})
    
    doc = Document()
    
    # Set margins
    for section in doc.sections:
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
    
    # Personal Info
    personal = content.get("personalInfo", {})
    if personal.get("name"):
        name_para = doc.add_paragraph()
        name_run = name_para.add_run(personal["name"])
        name_run.font.size = Pt(18)
        name_run.bold = True
        name_para.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
    
    contact_parts = []
    if personal.get("email"):
        contact_parts.append(personal["email"])
    if personal.get("phone"):
        contact_parts.append(personal["phone"])
    if personal.get("location"):
        contact_parts.append(personal["location"])
    if contact_parts:
        contact_para = doc.add_paragraph(" | ".join(contact_parts))
        contact_para.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
    
    # Summary
    if content.get("summary"):
        doc.add_heading("Professional Summary", level=1)
        doc.add_paragraph(content["summary"])
    
    # Experience
    if content.get("experience"):
        doc.add_heading("Experience", level=1)
        for exp in content["experience"]:
            p = doc.add_paragraph()
            p.add_run(f"{exp.get('title', '')}").bold = True
            p.add_run(f" at {exp.get('company', '')}")
            
            dates = f"{exp.get('startDate', '')} - {exp.get('endDate', 'Present')}"
            doc.add_paragraph(dates)
            
            for bullet in exp.get("bullets", []):
                doc.add_paragraph(f"• {bullet}")
    
    # Education
    if content.get("education"):
        doc.add_heading("Education", level=1)
        for edu in content["education"]:
            p = doc.add_paragraph()
            p.add_run(f"{edu.get('degree', '')} in {edu.get('field', '')}").bold = True
            doc.add_paragraph(f"{edu.get('school', '')} - {edu.get('graduationDate', '')}")
    
    # Skills
    if content.get("skills"):
        doc.add_heading("Skills", level=1)
        doc.add_paragraph(", ".join(content["skills"]))
    
    # Certifications
    if content.get("certifications"):
        doc.add_heading("Certifications", level=1)
        for cert in content["certifications"]:
            doc.add_paragraph(f"{cert.get('name', '')} - {cert.get('issuer', '')} ({cert.get('date', '')})")
    
    buffer = BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename={resume['title']}.docx"}
    )

@api_router.post("/export/cover-letter/pdf/{cover_letter_id}")
async def export_cover_letter_pdf(cover_letter_id: str, user: User = Depends(get_current_user)):
    """Export cover letter as PDF"""
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet
    
    cl = await db.cover_letters.find_one({"cover_letter_id": cover_letter_id, "user_id": user.user_id}, {"_id": 0})
    if not cl:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
    
    styles = getSampleStyleSheet()
    story = []
    
    # Split content by paragraphs and add to document
    paragraphs = cl["content"].split("\n\n")
    for para in paragraphs:
        if para.strip():
            story.append(Paragraph(para.replace("\n", "<br/>"), styles["Normal"]))
            story.append(Spacer(1, 12))
    
    doc.build(story)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={cl['title']}.pdf"}
    )

# ========================
# DASHBOARD STATS
# ========================

@api_router.get("/dashboard/stats")
async def get_dashboard_stats(user: User = Depends(get_current_user)):
    resume_count = await db.resumes.count_documents({"user_id": user.user_id})
    cover_letter_count = await db.cover_letters.count_documents({"user_id": user.user_id})
    
    # Get recent items
    recent_resumes = await db.resumes.find(
        {"user_id": user.user_id}, 
        {"_id": 0, "resume_id": 1, "title": 1, "updated_at": 1, "ats_score": 1}
    ).sort("updated_at", -1).limit(5).to_list(5)
    
    recent_cover_letters = await db.cover_letters.find(
        {"user_id": user.user_id},
        {"_id": 0, "cover_letter_id": 1, "title": 1, "updated_at": 1}
    ).sort("updated_at", -1).limit(5).to_list(5)
    
    return {
        "resume_count": resume_count,
        "cover_letter_count": cover_letter_count,
        "recent_resumes": recent_resumes,
        "recent_cover_letters": recent_cover_letters
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

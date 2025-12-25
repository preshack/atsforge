import requests
import sys
import json
from datetime import datetime

class ATSForgeAPITester:
    def __init__(self, base_url="https://cv-genius-19.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}, Expected: {expected_status}"
            
            if not success:
                try:
                    error_detail = response.json().get('detail', 'No detail')
                    details += f", Error: {error_detail}"
                except:
                    details += f", Response: {response.text[:200]}"
            
            self.log_test(name, success, details)
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "",
            200
        )
        return success

    def test_register(self):
        """Test user registration"""
        test_user_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response.get('user_id')
            print(f"   Registered user: {response.get('email')}")
            return True
        return False

    def test_login(self):
        """Test user login with existing credentials"""
        login_data = {
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!"
        }
        
        # First register a user
        register_success, _ = self.run_test(
            "Register for Login Test",
            "POST",
            "auth/register",
            200,
            data={
                "name": "Login Test User",
                "email": login_data["email"],
                "password": login_data["password"]
            }
        )
        
        if not register_success:
            return False
        
        # Now test login
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response.get('user_id')
            return True
        return False

    def test_get_me(self):
        """Test get current user info"""
        if not self.token:
            self.log_test("Get Me", False, "No token available")
            return False
            
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_onboarding(self):
        """Test onboarding endpoints"""
        if not self.token:
            self.log_test("Onboarding", False, "No token available")
            return False
        
        # Test save onboarding
        onboarding_data = {
            "experience_level": "mid",
            "industry": "technology",
            "target_roles": ["Software Engineer", "Full Stack Developer"],
            "country": "United States",
            "resume_style": "modern"
        }
        
        success, _ = self.run_test(
            "Save Onboarding",
            "POST",
            "users/onboarding",
            200,
            data=onboarding_data
        )
        
        if success:
            # Test get onboarding
            success2, _ = self.run_test(
                "Get Onboarding",
                "GET",
                "users/onboarding",
                200
            )
            return success2
        return False

    def test_resume_crud(self):
        """Test resume CRUD operations"""
        if not self.token:
            self.log_test("Resume CRUD", False, "No token available")
            return False
        
        # Create resume
        resume_data = {
            "title": "Test Resume",
            "content": {
                "personalInfo": {"name": "John Doe", "email": "john@example.com"},
                "summary": "Experienced developer",
                "experience": [],
                "education": [],
                "skills": ["Python", "JavaScript"],
                "certifications": []
            }
        }
        
        success, response = self.run_test(
            "Create Resume",
            "POST",
            "resumes",
            200,
            data=resume_data
        )
        
        if not success:
            return False
        
        resume_id = response.get('resume_id')
        if not resume_id:
            self.log_test("Resume CRUD", False, "No resume_id in response")
            return False
        
        # Get resume
        success2, _ = self.run_test(
            "Get Resume",
            "GET",
            f"resumes/{resume_id}",
            200
        )
        
        # Get all resumes
        success3, _ = self.run_test(
            "Get All Resumes",
            "GET",
            "resumes",
            200
        )
        
        # Update resume
        update_data = {
            "title": "Updated Test Resume",
            "content": resume_data["content"]
        }
        
        success4, _ = self.run_test(
            "Update Resume",
            "PUT",
            f"resumes/{resume_id}",
            200,
            data=update_data
        )
        
        # Duplicate resume
        success5, _ = self.run_test(
            "Duplicate Resume",
            "POST",
            f"resumes/{resume_id}/duplicate",
            200
        )
        
        # Delete resume
        success6, _ = self.run_test(
            "Delete Resume",
            "DELETE",
            f"resumes/{resume_id}",
            200
        )
        
        return all([success2, success3, success4, success5, success6])

    def test_ai_generation(self):
        """Test AI generation endpoints"""
        if not self.token:
            self.log_test("AI Generation", False, "No token available")
            return False
        
        # Test resume generation
        generation_data = {
            "messages": [
                {"role": "user", "content": "Create a resume for a software engineer with 3 years experience in Python and React"}
            ]
        }
        
        success, _ = self.run_test(
            "AI Resume Generation",
            "POST",
            "resumes/generate",
            200,
            data=generation_data
        )
        
        # Test ATS optimization
        optimize_data = {
            "resume_content": {
                "personalInfo": {"name": "John Doe"},
                "summary": "Software engineer with experience",
                "experience": [{"title": "Developer", "company": "Tech Corp"}],
                "skills": ["Python", "JavaScript"]
            },
            "job_description": "Looking for a Python developer with web development experience"
        }
        
        success2, _ = self.run_test(
            "ATS Optimization",
            "POST",
            "resumes/optimize",
            200,
            data=optimize_data
        )
        
        return success and success2

    def test_cover_letter_crud(self):
        """Test cover letter CRUD operations"""
        if not self.token:
            self.log_test("Cover Letter CRUD", False, "No token available")
            return False
        
        # Create cover letter
        cl_data = {
            "title": "Test Cover Letter",
            "job_description": "Software Engineer position at Tech Company",
            "tone": "professional",
            "company_name": "Tech Company",
            "position": "Software Engineer"
        }
        
        success, response = self.run_test(
            "Create Cover Letter",
            "POST",
            "cover-letters",
            200,
            data=cl_data
        )
        
        if not success:
            return False
        
        cl_id = response.get('cover_letter_id')
        if not cl_id:
            self.log_test("Cover Letter CRUD", False, "No cover_letter_id in response")
            return False
        
        # Get cover letter
        success2, _ = self.run_test(
            "Get Cover Letter",
            "GET",
            f"cover-letters/{cl_id}",
            200
        )
        
        # Get all cover letters
        success3, _ = self.run_test(
            "Get All Cover Letters",
            "GET",
            "cover-letters",
            200
        )
        
        # Delete cover letter
        success4, _ = self.run_test(
            "Delete Cover Letter",
            "DELETE",
            f"cover-letters/{cl_id}",
            200
        )
        
        return all([success2, success3, success4])

    def test_resume_upload(self):
        """Test PDF/DOCX resume upload feature"""
        if not self.token:
            self.log_test("Resume Upload", False, "No token available")
            return False
        
        # Create a simple text file to simulate upload
        import tempfile
        import os
        
        # Create a temporary text file with resume content
        resume_content = """John Doe
john.doe@email.com
(555) 123-4567

PROFESSIONAL SUMMARY
Experienced software engineer with 5 years of experience in Python and web development.

EXPERIENCE
Software Engineer | Tech Corp | 2020-2024
• Developed web applications using Python and React
• Led team of 3 developers on major projects
• Improved system performance by 40%

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2020

SKILLS
Python, JavaScript, React, Node.js, SQL, Git"""
        
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
                f.write(resume_content)
                temp_file_path = f.name
            
            # Test file upload
            url = f"{self.base_url}/resumes/upload"
            headers = {}
            if self.token:
                headers['Authorization'] = f'Bearer {self.token}'
            
            print(f"\n🔍 Testing Resume Upload...")
            print(f"   URL: {url}")
            
            with open(temp_file_path, 'rb') as file:
                files = {'file': ('test_resume.txt', file, 'text/plain')}
                response = requests.post(url, files=files, headers=headers)
            
            # Clean up temp file
            os.unlink(temp_file_path)
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Expected: 200"
            
            if not success:
                try:
                    error_detail = response.json().get('detail', 'No detail')
                    details += f", Error: {error_detail}"
                except:
                    details += f", Response: {response.text[:200]}"
            else:
                try:
                    response_data = response.json()
                    if 'resume_id' in response_data and 'extracted_text' in response_data:
                        details += f", Resume ID: {response_data['resume_id'][:12]}..."
                    else:
                        success = False
                        details += ", Missing required fields in response"
                except:
                    success = False
                    details += ", Invalid JSON response"
            
            self.log_test("Resume Upload", success, details)
            return success
            
        except Exception as e:
            self.log_test("Resume Upload", False, f"Exception: {str(e)}")
            return False

    def test_dashboard_stats(self):
        """Test dashboard stats endpoint"""
        if not self.token:
            self.log_test("Dashboard Stats", False, "No token available")
            return False
        
        success, _ = self.run_test(
            "Dashboard Stats",
            "GET",
            "dashboard/stats",
            200
        )
        return success

    def test_logout(self):
        """Test logout"""
        if not self.token:
            self.log_test("Logout", False, "No token available")
            return False
        
        success, _ = self.run_test(
            "Logout",
            "POST",
            "auth/logout",
            200
        )
        
        if success:
            self.token = None
            self.user_id = None
        
        return success

def main():
    print("🚀 Starting ATSForge API Testing...")
    print("=" * 50)
    
    tester = ATSForgeAPITester()
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health_check),
        ("User Registration", tester.test_register),
        ("User Login", tester.test_login),
        ("Get Current User", tester.test_get_me),
        ("Onboarding", tester.test_onboarding),
        ("Resume CRUD", tester.test_resume_crud),
        ("Resume Upload (NEW)", tester.test_resume_upload),
        ("AI Generation", tester.test_ai_generation),
        ("Cover Letter CRUD", tester.test_cover_letter_crud),
        ("Dashboard Stats", tester.test_dashboard_stats),
        ("Logout", tester.test_logout)
    ]
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            test_func()
        except Exception as e:
            tester.log_test(test_name, False, f"Exception: {str(e)}")
    
    # Print summary
    print(f"\n{'='*50}")
    print(f"📊 Test Summary:")
    print(f"   Total Tests: {tester.tests_run}")
    print(f"   Passed: {tester.tests_passed}")
    print(f"   Failed: {tester.tests_run - tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total_tests": tester.tests_run,
            "passed": tester.tests_passed,
            "failed": tester.tests_run - tester.tests_passed,
            "success_rate": round(tester.tests_passed/tester.tests_run*100, 1) if tester.tests_run > 0 else 0
        },
        "test_results": tester.test_results
    }
    
    with open("/app/backend_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: /app/backend_test_results.json")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
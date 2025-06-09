#!/usr/bin/env python3
"""
CounselorHub - Netlify Deployment Script
Handles the complete deployment process for Netlify
"""

import os
import sys
import subprocess
import json
import shutil
from pathlib import Path

def print_header(title):
    print("=" * 60)
    print(f"🚀 {title}")
    print("=" * 60)

def print_step(step):
    print(f"📋 {step}")

def print_success(message):
    print(f"✅ {message}")

def print_error(message):
    print(f"❌ {message}")

def print_info(message):
    print(f"ℹ️  {message}")

def run_command(command, description):
    """Run a command and handle errors"""
    print_step(f"{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print_success(f"{description} completed successfully")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print_error(f"{description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return None

def check_prerequisites():
    """Check if all required tools are installed"""
    print_step("Checking prerequisites...")
    
    # Check Node.js
    node_version = run_command("node --version", "Checking Node.js")
    if not node_version:
        print_error("Node.js is not installed or not in PATH")
        return False
    
    # Check npm
    npm_version = run_command("npm --version", "Checking npm")
    if not npm_version:
        print_error("npm is not installed or not in PATH")
        return False
    
    print_success(f"Node.js version: {node_version.strip()}")
    print_success(f"npm version: {npm_version.strip()}")
    return True

def install_dependencies():
    """Install project dependencies"""
    print_step("Installing dependencies...")
    if not os.path.exists("package.json"):
        print_error("package.json not found")
        return False
    
    return run_command("npm install", "Installing npm dependencies") is not None

def create_env_production():
    """Create production environment file"""
    print_step("Creating production environment...")
    
    # Read current .env file
    env_vars = {}
    if os.path.exists(".env"):
        with open(".env", "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    env_vars[key] = value
    
    # Create production env
    prod_env_content = """# Production Environment Variables for CounselorHub
# Configure these variables in your Netlify dashboard

# API Configuration
VITE_API_URL=https://your-production-backend.com
VITE_APP_ENV=production

# App Configuration
VITE_APP_NAME=CounselorHub
VITE_APP_VERSION=1.0.0

# Security
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
"""
    
    with open(".env.production", "w") as f:
        f.write(prod_env_content)
    
    print_success("Production environment file created")
    print_info("Remember to configure these variables in your Netlify dashboard!")
    return True

def build_project():
    """Build the project for production"""
    print_step("Building project for production...")
    
    # Clean previous build
    if os.path.exists("dist"):
        shutil.rmtree("dist")
        print_success("Cleaned previous build")
    
    # Build the project
    result = run_command("npm run build", "Building project")
    if not result:
        return False
    
    # Verify build output
    if not os.path.exists("dist"):
        print_error("Build output directory 'dist' not found")
        return False
    
    # Check for index.html
    if not os.path.exists("dist/index.html"):
        print_error("index.html not found in build output")
        return False
    
    print_success("Project built successfully")
    return True

def copy_netlify_files():
    """Copy Netlify configuration files to dist folder"""
    print_step("Copying Netlify configuration files...")
    
    files_to_copy = [
        ("_redirects", "Redirects configuration"),
        ("_headers", "Headers configuration")
    ]
    
    for filename, description in files_to_copy:
        if os.path.exists(filename):
            shutil.copy(filename, f"dist/{filename}")
            print_success(f"Copied {description}")
        else:
            print_error(f"{filename} not found")
    
    return True

def generate_deployment_info():
    """Generate deployment information"""
    print_step("Generating deployment information...")
    
    # Read package.json for app info
    app_info = {}
    if os.path.exists("package.json"):
        with open("package.json", "r") as f:
            package_data = json.load(f)
            app_info = {
                "name": package_data.get("name", "CounselorHub"),
                "version": package_data.get("version", "1.0.0"),
                "description": package_data.get("description", "")
            }
    
    # Create deployment info
    deployment_info = {
        "app": app_info,
        "build_time": subprocess.check_output(["date"], shell=True, text=True).strip(),
        "node_version": subprocess.check_output(["node", "--version"], shell=True, text=True).strip(),
        "npm_version": subprocess.check_output(["npm", "--version"], shell=True, text=True).strip(),
        "build_command": "npm run build",
        "publish_directory": "dist"
    }
    
    with open("dist/deployment-info.json", "w") as f:
        json.dump(deployment_info, f, indent=2)
    
    print_success("Deployment information generated")
    return True

def print_deployment_instructions():
    """Print deployment instructions"""
    print_header("Deployment Instructions")
    
    print("""
🌐 Your CounselorHub app is ready for Netlify deployment!

📁 Build Output:
   • Location: ./dist/
   • Entry Point: index.html
   • Configuration: _redirects, _headers

🚀 Deployment Options:

1️⃣  DRAG & DROP DEPLOYMENT:
   • Visit: https://app.netlify.com/
   • Drag the 'dist' folder to the deployment area
   • Your site will be live instantly!

2️⃣  GIT DEPLOYMENT:
   • Connect your GitHub repository
   • Build Command: npm run build
   • Publish Directory: dist
   • Environment Variables: Configure in Netlify dashboard

3️⃣  NETLIFY CLI DEPLOYMENT:
   • Install: npm install -g netlify-cli
   • Deploy: netlify deploy --prod --dir=dist

📋 Environment Variables to Configure in Netlify:
   • VITE_API_URL: Your production backend URL
   • VITE_APP_ENV: production
   • VITE_APP_NAME: CounselorHub
   • VITE_APP_VERSION: 1.0.0

🔧 Post-Deployment Checklist:
   □ Test all routes work correctly
   □ Verify API connections
   □ Check CORS settings on your backend
   □ Test authentication flows
   □ Verify mobile responsiveness
   □ Check performance metrics

🆘 Troubleshooting:
   • If routes don't work: Check _redirects file
   • If API fails: Verify CORS and environment variables
   • If assets missing: Check build output and paths

💡 Pro Tips:
   • Use Netlify's branch deploys for testing
   • Set up form handling for contact forms
   • Enable analytics in Netlify dashboard
   • Configure custom domain if needed
""")

def main():
    """Main deployment process"""
    print_header("CounselorHub - Netlify Deployment")
    
    # Change to project directory
    project_dir = Path(__file__).parent
    os.chdir(project_dir)
    
    steps = [
        ("Prerequisites", check_prerequisites),
        ("Dependencies", install_dependencies),
        ("Production Environment", create_env_production),
        ("Build", build_project),
        ("Netlify Files", copy_netlify_files),
        ("Deployment Info", generate_deployment_info)
    ]
    
    for step_name, step_func in steps:
        print_header(f"Step: {step_name}")
        if not step_func():
            print_error(f"Deployment failed at step: {step_name}")
            sys.exit(1)
    
    print_header("Deployment Preparation Complete!")
    print_deployment_instructions()

if __name__ == "__main__":
    main()

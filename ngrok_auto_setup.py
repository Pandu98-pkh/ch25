#!/usr/bin/env python3
"""
Script otomatis untuk menjalankan backend dengan ngrok dan mengupdate frontend
"""

import subprocess
import time
import threading
import os
import sys
import signal
import requests
import json
import re

class NgrokBackendManager:
    def __init__(self):
        self.flask_process = None
        self.ngrok_process = None
        self.ngrok_url = None
        self.running = False

    def start_flask_server(self):
        """Start Flask server"""
        print("🚀 Starting Flask server on port 5000...")
        try:
            os.chdir("backend")
            self.flask_process = subprocess.Popen([
                sys.executable, "app.py"
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            # Wait a bit for server to start
            time.sleep(5)
            
            # Check if server is running
            try:
                response = requests.get("http://localhost:5000/health", timeout=5)
                if response.status_code == 200:
                    print("✅ Flask server started successfully!")
                    return True
                else:
                    print("❌ Flask server health check failed")
                    return False
            except requests.RequestException:
                print("❌ Flask server not responding")
                return False
                
        except Exception as e:
            print(f"❌ Error starting Flask server: {e}")
            return False

    def start_ngrok(self):
        """Start ngrok tunnel"""
        print("🌐 Starting ngrok tunnel...")
        try:
            self.ngrok_process = subprocess.Popen([
                "ngrok", "http", "5000", "--log=stdout"
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            # Wait for ngrok to start
            time.sleep(3)
            
            # Get ngrok URL
            self.ngrok_url = self.get_ngrok_url()
            if self.ngrok_url:
                print(f"✅ Ngrok tunnel started: {self.ngrok_url}")
                return True
            else:
                print("❌ Could not get ngrok URL")
                return False
                
        except Exception as e:
            print(f"❌ Error starting ngrok: {e}")
            return False

    def get_ngrok_url(self):
        """Get active ngrok URL"""
        try:
            response = requests.get('http://localhost:4040/api/tunnels', timeout=5)
            if response.status_code == 200:
                data = response.json()
                tunnels = data.get('tunnels', [])
                
                for tunnel in tunnels:
                    if tunnel.get('config', {}).get('addr') == 'http://localhost:5000':
                        public_url = tunnel.get('public_url')
                        if public_url and public_url.startswith('https://'):
                            return public_url
            return None
        except Exception:
            return None

    def update_env_file(self):
        """Update .env file with ngrok URL"""
        if not self.ngrok_url:
            return False
            
        env_file = '../.env'
        
        try:
            # Read current .env file
            if os.path.exists(env_file):
                with open(env_file, 'r', encoding='utf-8') as f:
                    content = f.read()
            else:
                content = ""
            
            # Update or add VITE_API_URL
            pattern = r'VITE_API_URL=.*'
            new_line = f'VITE_API_URL={self.ngrok_url}'
            
            if re.search(pattern, content):
                new_content = re.sub(pattern, new_line, content)
            else:
                new_content = content.rstrip() + f'\nVITE_API_URL={self.ngrok_url}\n'
            
            # Write updated content
            with open(env_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"✅ Updated .env file with ngrok URL")
            return True
            
        except Exception as e:
            print(f"❌ Error updating .env file: {e}")
            return False

    def display_info(self):
        """Display connection information"""
        print("\n" + "=" * 60)
        print("🎉 BACKEND IS NOW ACCESSIBLE VIA INTERNET!")
        print("=" * 60)
        print(f"🔗 Backend API URL: {self.ngrok_url}")
        print(f"🔗 Health Check: {self.ngrok_url}/health")
        print(f"🔗 API Endpoints: {self.ngrok_url}/api/")
        print("=" * 60)
        print("📋 Available Endpoints:")
        print(f"   • Students: {self.ngrok_url}/api/students")
        print(f"   • Classes: {self.ngrok_url}/api/classes")
        print(f"   • Sessions: {self.ngrok_url}/api/counseling-sessions")
        print(f"   • Users: {self.ngrok_url}/api/users")
        print("=" * 60)
        print("🚀 Next Steps:")
        print("   1. Share the ngrok URL with others for remote access")
        print("   2. Update your frontend to use this URL")
        print("   3. Test API endpoints using the URLs above")
        print("   4. Press Ctrl+C to stop all services")
        print("=" * 60)

    def cleanup(self):
        """Cleanup processes"""
        print("\n🛑 Shutting down services...")
        
        if self.ngrok_process:
            self.ngrok_process.terminate()
            print("✅ Ngrok tunnel stopped")
            
        if self.flask_process:
            self.flask_process.terminate()
            print("✅ Flask server stopped")

    def run(self):
        """Main run method"""
        self.running = True
        
        try:
            # Start Flask server
            if not self.start_flask_server():
                return False
            
            # Start ngrok
            if not self.start_ngrok():
                self.cleanup()
                return False
            
            # Update .env file
            self.update_env_file()
            
            # Display info
            self.display_info()
            
            # Keep running
            while self.running:
                time.sleep(1)
                
        except KeyboardInterrupt:
            print("\n⏹️ Received interrupt signal")
        except Exception as e:
            print(f"\n❌ Error: {e}")
        finally:
            self.cleanup()
            self.running = False

    def stop(self):
        """Stop the manager"""
        self.running = False

def signal_handler(sig, frame):
    """Handle Ctrl+C"""
    print('\n🛑 Shutting down...')
    sys.exit(0)

def main():
    print("=" * 60)
    print("🎯 CounselorHub - Backend with Ngrok Auto-Setup")
    print("=" * 60)
    print("This will:")
    print("   1. ✅ Start Flask backend server (localhost:5000)")
    print("   2. 🌐 Create ngrok tunnel for internet access")
    print("   3. 🔧 Auto-update .env file with ngrok URL")
    print("   4. 📋 Display all access URLs and endpoints")
    print("=" * 60)
    
    # Handle Ctrl+C
    signal.signal(signal.SIGINT, signal_handler)
    
    # Create and run manager
    manager = NgrokBackendManager()
    manager.run()

if __name__ == "__main__":
    main()

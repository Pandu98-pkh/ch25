#!/usr/bin/env python3
"""
Script untuk menjalankan backend Flask dengan ngrok
Ini akan membuat backend Anda accessible dari internet
"""

import subprocess
import time
import threading
import os
import sys
import signal

def run_flask_server():
    """Menjalankan Flask server"""
    print("🚀 Starting Flask server...")
    try:
        # Jalankan Flask server di background
        os.chdir("backend")
        subprocess.run([sys.executable, "app.py"], check=True)
    except KeyboardInterrupt:
        print("\n⏹️ Flask server stopped by user")
    except Exception as e:
        print(f"❌ Error running Flask server: {e}")

def run_ngrok():
    """Menjalankan ngrok untuk expose Flask server"""
    print("🌐 Starting ngrok tunnel...")
    try:
        # Tunggu sebentar untuk memastikan Flask server sudah running
        time.sleep(3)
        
        # Jalankan ngrok untuk port 5000
        result = subprocess.run([
            "ngrok", "http", "5000", 
            "--log=stdout"
        ], check=True)
    except KeyboardInterrupt:
        print("\n⏹️ Ngrok stopped by user")
    except Exception as e:
        print(f"❌ Error running ngrok: {e}")

def signal_handler(sig, frame):
    """Handle Ctrl+C"""
    print('\n🛑 Shutting down servers...')
    sys.exit(0)

def main():
    """Main function"""
    print("=" * 60)
    print("🎯 CounselorHub Backend with Ngrok")
    print("=" * 60)
    print("📋 This will:")
    print("   1. Start Flask backend server on localhost:5000")
    print("   2. Create ngrok tunnel to make it accessible via internet")
    print("   3. Display public URL for accessing your API")
    print("=" * 60)
    
    # Handle Ctrl+C gracefully
    signal.signal(signal.SIGINT, signal_handler)
    
    # Start Flask server in a separate thread
    flask_thread = threading.Thread(target=run_flask_server, daemon=True)
    flask_thread.start()
    
    # Start ngrok
    run_ngrok()

if __name__ == "__main__":
    main()

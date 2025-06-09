#!/usr/bin/env python3
"""
Utility script untuk mengupdate API URL secara otomatis dari ngrok
Script ini akan:
1. Mendapatkan URL ngrok yang aktif
2. Mengupdate file .env dengan URL ngrok
3. Restart development server jika diperlukan
"""

import requests
import re
import os
import subprocess
import json
import time

def get_ngrok_url():
    """Mendapatkan URL ngrok yang aktif"""
    try:
        # Ngrok API endpoint untuk mendapatkan tunnels yang aktif
        response = requests.get('http://localhost:4040/api/tunnels', timeout=5)
        if response.status_code == 200:
            data = response.json()
            tunnels = data.get('tunnels', [])
            
            # Cari tunnel untuk port 5000 (Flask backend)
            for tunnel in tunnels:
                if tunnel.get('config', {}).get('addr') == 'http://localhost:5000':
                    public_url = tunnel.get('public_url')
                    if public_url and public_url.startswith('https://'):
                        return public_url
                        
        return None
    except Exception as e:
        print(f"❌ Error getting ngrok URL: {e}")
        return None

def update_env_file(ngrok_url):
    """Update file .env dengan URL ngrok"""
    env_file = '.env'
    
    if not os.path.exists(env_file):
        print(f"❌ File {env_file} tidak ditemukan")
        return False
    
    try:
        with open(env_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern untuk mencari VITE_API_URL
        pattern = r'VITE_API_URL=.*'
        new_line = f'VITE_API_URL={ngrok_url}'
        
        if re.search(pattern, content):
            # Update existing line
            new_content = re.sub(pattern, new_line, content)
        else:
            # Add new line
            new_content = content + f'\n{new_line}\n'
        
        # Backup original file
        with open(f'{env_file}.backup', 'w', encoding='utf-8') as f:
            f.write(content)
        
        # Write updated content
        with open(env_file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✅ Updated {env_file} with ngrok URL: {ngrok_url}")
        return True
        
    except Exception as e:
        print(f"❌ Error updating {env_file}: {e}")
        return False

def check_ngrok_status():
    """Cek status ngrok"""
    try:
        response = requests.get('http://localhost:4040/api/tunnels', timeout=5)
        if response.status_code == 200:
            data = response.json()
            tunnels = data.get('tunnels', [])
            
            print(f"📊 Found {len(tunnels)} active ngrok tunnel(s):")
            for tunnel in tunnels:
                public_url = tunnel.get('public_url')
                local_addr = tunnel.get('config', {}).get('addr')
                print(f"   🔗 {public_url} -> {local_addr}")
            
            return len(tunnels) > 0
        else:
            print("❌ Ngrok API not accessible")
            return False
    except Exception as e:
        print(f"❌ Error checking ngrok status: {e}")
        print("💡 Make sure ngrok is running with: ngrok http 5000")
        return False

def main():
    print("=" * 60)
    print("🔧 CounselorHub - Ngrok URL Auto-Updater")
    print("=" * 60)
    
    # Check if ngrok is running
    if not check_ngrok_status():
        print("\n❌ Ngrok is not running or not accessible")
        print("💡 Please start ngrok first with: ngrok http 5000")
        return
    
    # Get ngrok URL
    ngrok_url = get_ngrok_url()
    if not ngrok_url:
        print("\n❌ Could not find ngrok URL for port 5000")
        print("💡 Make sure ngrok is tunneling port 5000")
        return
    
    print(f"\n🌐 Found ngrok URL: {ngrok_url}")
    
    # Update .env file
    if update_env_file(ngrok_url):
        print("\n✅ Environment file updated successfully!")
        print("\n📝 Next steps:")
        print("   1. Restart your Vite development server")
        print("   2. Your frontend will now use the ngrok URL")
        print("   3. Share the ngrok URL for remote access")
        print(f"\n🔗 Backend API accessible at: {ngrok_url}/api")
        print(f"🔗 Health check: {ngrok_url}/health")
    else:
        print("\n❌ Failed to update environment file")

if __name__ == "__main__":
    main()

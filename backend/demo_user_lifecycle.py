#!/usr/bin/env python3
"""
Demo dan test lengkap sistem soft delete
"""

import requests
import json
import uuid

API_BASE = 'http://localhost:5000/api'

def demo_user_lifecycle():
    """Demo lengkap siklus hidup user dengan soft delete"""
    
    print("🎭 DEMO: Siklus Hidup User dengan Soft Delete")
    print("=" * 60)
    
    # Step 1: Buat user demo
    print("\n1️⃣ Membuat user demo...")
    random_suffix = str(uuid.uuid4())[:6]
    
    demo_user = {
        'userId': f'DEMO-{random_suffix}',
        'name': f'Demo User {random_suffix}',
        'email': f'demo{random_suffix}@counselorhub.edu',
        'role': 'student',
        'username': f'demo{random_suffix}',
        'password': 'demo123'
    }
    
    try:
        response = requests.post(f'{API_BASE}/users', json=demo_user)
        if response.status_code == 201:
            created_user = response.json()
            user_id = created_user['userId']
            print(f"   ✅ User berhasil dibuat: {created_user['name']} (ID: {user_id})")
        else:
            print(f"   ❌ Gagal membuat user: {response.json()}")
            return
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Step 2: Verifikasi user muncul di daftar aktif
    print(f"\n2️⃣ Verifikasi user muncul di daftar aktif...")
    try:
        response = requests.get(f'{API_BASE}/users')
        if response.status_code == 200:
            users = response.json()
            user_found = any(u['userId'] == user_id for u in users)
            print(f"   {'✅' if user_found else '❌'} User {'ditemukan' if user_found else 'tidak ditemukan'} di daftar aktif")
        else:
            print(f"   ❌ Error getting users: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Step 3: Hapus user (soft delete)
    print(f"\n3️⃣ Menghapus user (soft delete)...")
    try:
        response = requests.delete(f'{API_BASE}/users/{user_id}')
        if response.status_code == 200:
            print(f"   ✅ User berhasil dihapus (soft delete)")
        else:
            print(f"   ❌ Gagal menghapus user: {response.json()}")
            return
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Step 4: Verifikasi user tidak muncul di daftar aktif
    print(f"\n4️⃣ Verifikasi user tidak muncul di daftar aktif...")
    try:
        response = requests.get(f'{API_BASE}/users')
        if response.status_code == 200:
            users = response.json()
            user_found = any(u['userId'] == user_id for u in users)
            print(f"   {'❌' if user_found else '✅'} User {'masih muncul' if user_found else 'tidak muncul'} di daftar aktif (✅ = benar)")
        else:
            print(f"   ❌ Error getting users: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Step 5: Verifikasi user muncul di daftar user yang dihapus
    print(f"\n5️⃣ Verifikasi user muncul di daftar user yang dihapus...")
    try:
        response = requests.get(f'{API_BASE}/admin/users/deleted')
        if response.status_code == 200:
            deleted_users = response.json()
            user_found = any(u['userId'] == user_id for u in deleted_users)
            print(f"   {'✅' if user_found else '❌'} User {'ditemukan' if user_found else 'tidak ditemukan'} di daftar user yang dihapus")
            if user_found:
                user_data = next(u for u in deleted_users if u['userId'] == user_id)
                print(f"   📄 Detail: {user_data['name']} - Dihapus pada: {user_data.get('deletedAt', 'Unknown')}")
        else:
            print(f"   ❌ Error getting deleted users: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Step 6: Restore user
    print(f"\n6️⃣ Me-restore user...")
    try:
        response = requests.put(f'{API_BASE}/admin/users/{user_id}/restore')
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ {result['message']}")
        else:
            print(f"   ❌ Gagal restore user: {response.json()}")
            return
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Step 7: Verifikasi user kembali muncul di daftar aktif
    print(f"\n7️⃣ Verifikasi user kembali muncul di daftar aktif...")
    try:
        response = requests.get(f'{API_BASE}/users')
        if response.status_code == 200:
            users = response.json()
            user_found = any(u['userId'] == user_id for u in users)
            print(f"   {'✅' if user_found else '❌'} User {'ditemukan' if user_found else 'tidak ditemukan'} di daftar aktif")
        else:
            print(f"   ❌ Error getting users: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Step 8: Cleanup - hapus user lagi untuk tes hard delete
    print(f"\n8️⃣ Cleanup - hapus user lagi untuk demo hard delete...")
    try:
        response = requests.delete(f'{API_BASE}/users/{user_id}')
        if response.status_code == 200:
            print(f"   ✅ User dihapus lagi (soft delete)")
        else:
            print(f"   ❌ Gagal menghapus user: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Step 9: Demo hard delete (BERBAHAYA!)
    print(f"\n9️⃣ Demo hard delete (PERMANEN - BERBAHAYA!)...")
    confirm = input(f"   ⚠️  Apakah Anda yakin ingin menghapus permanen user {user_id}? (ketik 'YA' untuk konfirmasi): ")
    
    if confirm.upper() == 'YA':
        try:
            response = requests.delete(f'{API_BASE}/admin/users/{user_id}/hard-delete')
            if response.status_code == 200:
                result = response.json()
                print(f"   🗑️ {result['message']}")
                print(f"   ⚠️  {result['warning']}")
            else:
                print(f"   ❌ Gagal hard delete: {response.json()}")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    else:
        print(f"   🛡️ Hard delete dibatalkan. User masih ada di daftar deleted users.")
    
    print(f"\n🎉 Demo selesai!")
    print(f"\n📋 Ringkasan Fitur:")
    print(f"   ✅ Soft Delete: User tidak muncul di aplikasi tapi data tetap ada")
    print(f"   ✅ Restore: User yang dihapus dapat dikembalikan")
    print(f"   ✅ Hard Delete: Menghapus permanen dari database (BERBAHAYA!)")
    print(f"   ✅ Admin Panel: Melihat dan mengelola user yang dihapus")

if __name__ == '__main__':
    demo_user_lifecycle()

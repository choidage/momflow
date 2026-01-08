#!/usr/bin/env python3
"""
Backend Server Launcher - Detached Process
PowerShell signal handling 문제를 회피하기 위해 분리된 프로세스로 실행
"""
import subprocess
import sys
import time
import os

backend_dir = r"C:\Users\USER\OneDrive\Desktop\AI18_FINAL\backend"
os.chdir(backend_dir)

print("[OK] Launching backend server...")
print(f"[OK] Working directory: {backend_dir}")

try:
    # 분리된 프로세스로 실행 (stdin, stdout, stderr를 분리)
    if sys.platform == "win32":
        # Windows: CREATE_NEW_PROCESS_GROUP로 Ctrl+C 신호 분리
        process = subprocess.Popen(
            [sys.executable, "server.py"],
            cwd=backend_dir,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    else:
        # Unix: 백그라운드 실행
        process = subprocess.Popen(
            [sys.executable, "server.py"],
            cwd=backend_dir,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,
        )
    
    print(f"[OK] Server started (PID: {process.pid})")
    print("[OK] Server running at http://localhost:8000")
    print("[OK] Press Ctrl+C to stop (server will continue running)")
    
    # 부모 프로세스만 계속 실행
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[INFO] Launcher stopped (server still running)")
        sys.exit(0)

except Exception as e:
    print(f"[ERROR] {e}")
    sys.exit(1)

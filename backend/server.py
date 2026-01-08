#!/usr/bin/env python3
"""
Always Plan Backend Server - Stable Execution
"""
import os
import sys
from pathlib import Path

# Set UTF-8 encoding first
os.environ['PYTHONIOENCODING'] = 'utf-8'

# Add backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))
os.environ['PYTHONPATH'] = str(backend_dir)
os.chdir(backend_dir)

print(f"[OK] Working directory: {os.getcwd()}")
print(f"[OK] PYTHONPATH: {os.environ.get('PYTHONPATH')}")
print(f"[OK] Python version: {sys.version.split()[0]}")

# Initialize database
from app.database import init_db
init_db()
init_db()

# Uvicorn 실행 (최소화된 설정)
if __name__ == "__main__":
    import uvicorn
    import signal
    
    print("\n[INFO] Starting FastAPI server...")
    
    # Uvicorn config (disable signal handler)
    config = uvicorn.Config(
        "main:app",
        host="0.0.0.0",
        port=8000,
        log_level="info",
    )
    server = uvicorn.Server(config)
    
    # Ignore SIGTERM on Windows
    if sys.platform == "win32":
        original_sigterm = signal.signal(signal.SIGTERM, signal.SIG_IGN)
        original_sigint = signal.signal(signal.SIGINT, signal.default_int_handler)
    
    # Manually run asyncio loop (more precise control)
    try:
        import asyncio
        
        async def run():
            await server.serve()
        
        # Create asyncio event loop
        if sys.platform == "win32":
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
        
        asyncio.run(run())
        
    except KeyboardInterrupt:
        print("\n\n[INFO] Server shutdown")
        sys.exit(0)

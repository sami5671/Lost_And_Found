import os
import sys
import subprocess
import time
import shutil

# Ensure UTF-8 output encoding for Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

def main():
    print("=" * 60)
    print("      DIU Lost & Found AI Service + Static Ngrok Tunnel Launcher")
    print("=" * 60)
    
    ai_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(ai_dir)
    
    port = os.getenv("PORT", "5000")
    static_domain = os.getenv("STATIC_NGROK_DOMAIN", "requisite-frolic-perkiness.ngrok-free.dev")
    
    # 1. Download/Verify models
    print("\n[1/3] Checking & pre-downloading AI models...")
    try:
        subprocess.run([sys.executable, "download_models.py"], check=True)
    except Exception as e:
        print(f"Warning: model pre-download encountered issues: {e}")
        
    # 2. Check ngrok availability
    ngrok_path = shutil.which("ngrok")
    
    # 3. Start FastAPI service
    print(f"\n[2/3] Starting FastAPI AI Service on http://localhost:{port}...")
    fastapi_process = subprocess.Popen([sys.executable, "app.py"])
    
    # Give FastAPI a couple of seconds to boot up
    time.sleep(3)
    
    ngrok_process = None
    try:
        if ngrok_path:
            print(f"\n[3/3] Starting Ngrok Tunnel -> https://{static_domain}...")
            ngrok_process = subprocess.Popen(["ngrok", "http", "--url=" + static_domain, port])
            print(f"\n[OK] Local AI Service and Static Ngrok Tunnel are running!")
            print(f"   Local URL:  http://localhost:{port}")
            print(f"   Ngrok URL:  https://{static_domain}\n")
            ngrok_process.wait()
        else:
            print("\n[3/3] [WARNING] Ngrok CLI was not detected in PATH.")
            print(f"   To expose the local AI service via static Ngrok tunnel, install Ngrok and run:")
            print(f"   ngrok http --url={static_domain} {port}\n")
            print(f"   FastAPI AI Service is running locally on http://localhost:{port}")
            fastapi_process.wait()
    except KeyboardInterrupt:
        print("\nStopping AI Service and Ngrok Tunnel...")
    finally:
        if ngrok_process and ngrok_process.poll() is None:
            ngrok_process.terminate()
        if fastapi_process.poll() is None:
            fastapi_process.terminate()

if __name__ == "__main__":
    main()

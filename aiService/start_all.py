import os
import sys
import subprocess
import time
import shutil

def main():
    print("=" * 60)
    print("      DIU Lost & Found AI Service + Static Ngrok Tunnel Launcher")
    print("=" * 60)
    
    ai_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(ai_dir)
    
    # 1. Download/Verify models
    print("\n[1/3] Checking & pre-downloading AI models...")
    try:
        subprocess.run([sys.executable, "download_models.py"], check=True)
    except Exception as e:
        print(f"Warning: model pre-download encountered issues: {e}")
        
    # 2. Check ngrok availability
    ngrok_path = shutil.which("ngrok")
    static_domain = "requisite-frolic-perkiness.ngrok-free.dev"
    
    # 3. Start FastAPI service
    print("\n[2/3] Starting FastAPI AI Service on http://localhost:5000...")
    fastapi_process = subprocess.Popen([sys.executable, "app.py"])
    
    # Give FastAPI a couple of seconds to boot up
    time.sleep(3)
    
    if ngrok_path:
        print(f"\n[3/3] Starting Ngrok Tunnel -> https://{static_domain}...")
        try:
            ngrok_process = subprocess.Popen(["ngrok", "http", "--url=" + static_domain, "5000"])
            print(f"\n✅ Local AI Service and Static Ngrok Tunnel are running!")
            print(f"   Local URL:  http://localhost:5000")
            print(f"   Ngrok URL:  https://{static_domain}\n")
            
            ngrok_process.wait()
        except KeyboardInterrupt:
            print("\nStopping Ngrok tunnel and FastAPI service...")
        except Exception as e:
            print(f"\nError running ngrok command: {e}")
            print(f"You can manually run: ngrok http --url={static_domain} 5000")
    else:
        print("\n[3/3] ⚠️ Ngrok CLI was not detected in PATH.")
        print(f"   To expose the local AI service via static Ngrok tunnel, install Ngrok and run:")
        print(f"   ngrok http --url={static_domain} 5000\n")
        print(f"   FastAPI AI Service is running locally on http://localhost:5000")
        
    try:
        fastapi_process.wait()
    except KeyboardInterrupt:
        print("\nStopping FastAPI server...")
        fastapi_process.terminate()

if __name__ == "__main__":
    main()

@echo off
echo Starting Static Ngrok Tunnel for AI Service...
echo Forwarding http://localhost:5000 to https://requisite-frolic-perkiness.ngrok-free.dev
ngrok http --url=requisite-frolic-perkiness.ngrok-free.dev 5000
pause

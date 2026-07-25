import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.match import router as match_router

app = FastAPI(
    title="DIU Lost and Found AI Matching Service",
    description="Microservice to extract features and compute similarity matches between items.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(match_router)

@app.get("/")
async def root():
    return {"message": "Daffodil Lost & Found AI Matching Service is running"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)

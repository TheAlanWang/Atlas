from pathlib import Path
from dotenv import load_dotenv

# Load .env.local from project root before anything else imports os.environ
load_dotenv(Path(__file__).parent.parent / ".env.local")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.chat import router

app = FastAPI(title="Atlas RAG API")

# Allow requests from the Next.js dev server and production domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://thealanwang.xyz"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok"}

"""
FastAPI Main Application Entry Point for Spam Message Detection System.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.connection import init_db
from app.services.model_service import model_service
from app.api.routes import health, prediction, history, statistics, model_metrics


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables
    print("[Startup] Initializing SQLite / PostgreSQL database tables...")
    init_db()
    
    # Check ML model availability
    if model_service.is_model_available():
        print("[Startup] Trained ML model artifact found. Loading pipeline...")
        try:
            model_service.load_pipeline()
            print("[Startup] Model pipeline ready for inference.")
        except Exception as e:
            print(f"[Startup Warning] Could not preload model: {e}")
    else:
        print("[Startup Warning] Model artifact missing. Run 'python backend/ml/train.py' to generate artifacts.")
    
    yield
    print("[Shutdown] Cleaning up application resources...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack AI/ML Spam Message Detection API with Naive Bayes and TF-IDF",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(prediction.router, prefix=settings.API_V1_STR)
app.include_router(history.router, prefix=settings.API_V1_STR)
app.include_router(statistics.router, prefix=settings.API_V1_STR)
app.include_router(model_metrics.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "docs_url": "/docs",
        "api_prefix": settings.API_V1_STR,
        "status": "operational"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again."}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=5001, reload=True)

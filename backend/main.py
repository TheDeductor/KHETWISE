from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import field, health, disease, irrigation, market, voice, outbreaks

app = FastAPI(
    title="Khetwise API",
    description="Community crop intelligence platform for Indian farmers.",
    version="1.0.0",
)

# CORS — open for all origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers under /api prefix
app.include_router(field.router,      prefix="/api", tags=["Field"])
app.include_router(health.router,     prefix="/api", tags=["Health"])
app.include_router(disease.router,    prefix="/api", tags=["Disease"])
app.include_router(irrigation.router, prefix="/api", tags=["Irrigation"])
app.include_router(market.router,     prefix="/api", tags=["Market"])
app.include_router(voice.router,      prefix="/api", tags=["Voice"])
app.include_router(outbreaks.router,  prefix="/api", tags=["Outbreaks"])


@app.get("/", tags=["Root"])
async def root():
    return {"message": "Khetwise API is running. Visit /docs for the full API reference."}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import iniciar_prolog
from routers import conocimiento, diagnostico, configuracion

app = FastAPI(title="Doctor Byte API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

iniciar_prolog()

app.include_router(conocimiento.router)
app.include_router(diagnostico.router)
app.include_router(configuracion.router)
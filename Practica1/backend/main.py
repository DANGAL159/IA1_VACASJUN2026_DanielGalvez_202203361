from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.database import iniciar_prolog
from routers import rutas, grafo

app = FastAPI(title="API Rutas IA1 - MVC")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar conocimiento al arrancar el servidor
iniciar_prolog()

# Registrar los controladores (Routers)
app.include_router(rutas.router)
app.include_router(grafo.router)
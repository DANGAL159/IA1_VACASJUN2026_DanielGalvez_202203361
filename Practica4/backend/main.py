from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers import maze_controller
import uvicorn

app = FastAPI(title="RoboMaze API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(maze_controller.router)
# Nota: Modificamos el enrutador solve para que este dentro de /api/mazes/solve en lugar de /api/solve para mantener uniformidad.

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
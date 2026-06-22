from fastapi import APIRouter, HTTPException
from schemas.maze_schema import SolveRequest, GenerateRequest, CustomMazeRequest
from services.maze_service import maze_service
from repositories.maze_repository import maze_repository

router = APIRouter(prefix="/api/mazes", tags=["Mazes"])

@router.get("/{maze_id}")
def get_maze(maze_id: str):
    maze = maze_repository.get_by_id(maze_id)
    if not maze:
        raise HTTPException(status_code=404, detail="Laberinto no encontrado")
    return maze

@router.post("/generate")
def generate_maze(req: GenerateRequest):
    if req.rows < 3 or req.cols < 3:
        raise HTTPException(status_code=400, detail="Dimensiones minimas 3x3")
    return maze_service.generate_random(req.rows, req.cols)

@router.post("/custom")
def save_custom_maze(req: CustomMazeRequest):
    success = maze_repository.save(req.maze_id, req.grid, req.start, req.targets)
    if success:
        return {"message": "Guardado exitoso"}
    raise HTTPException(status_code=500, detail="Error al guardar")

@router.post("/solve")
def solve_maze(req: SolveRequest):
    algo = req.algorithm.lower()
    if algo == "bfs":
        return maze_service.solve_bfs(req.grid, req.start, req.targets)
    elif algo == "dfs":
        return maze_service.solve_dfs(req.grid, req.start, req.targets)
    elif algo == "astar":
        return maze_service.solve_astar(req.grid, req.start, req.targets)
    raise HTTPException(status_code=400, detail="Algoritmo no soportado")
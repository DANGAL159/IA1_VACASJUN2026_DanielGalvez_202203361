from pydantic import BaseModel
from typing import List, Tuple

class SolveRequest(BaseModel):
    grid: List[List[int]]
    start: Tuple[int, int]
    targets: List[Tuple[int, int]]
    algorithm: str

class GenerateRequest(BaseModel):
    rows: int
    cols: int

class CustomMazeRequest(BaseModel):
    maze_id: str
    grid: List[List[int]]
    start: Tuple[int, int]
    targets: List[Tuple[int, int]]
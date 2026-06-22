# backend/repositories/maze_repository.py

PREDEFINED_MAZES = {
    "maze_1": {"grid": [[0,0,0,1,0],[1,1,0,1,0],[0,0,0,0,0],[0,1,1,1,1],[0,0,0,0,0]], "start": (0,0), "targets": [(4,4)]},
    "maze_2": {"grid": [[0,1,0,0,0,0,0],[0,1,0,1,1,1,0],[0,0,0,1,0,0,0],[1,1,0,1,0,1,1],[0,0,0,0,0,0,0]], "start": (0,0), "targets": [(4,6)]},
    "maze_3": {"grid": [[0,0,0,0,1,0,0,0],[0,1,1,0,1,0,1,0],[0,0,1,0,0,0,1,0],[1,0,1,1,1,0,1,0],[0,0,0,0,1,0,0,0],[0,1,1,0,0,0,1,1],[0,0,0,0,1,0,0,0]], "start": (6,0), "targets": [(0,7)]},
    "maze_4": {"grid": [[0,0,1,0,0],[0,1,1,0,0],[0,0,0,1,0],[1,1,0,0,0],[0,0,0,1,0]], "start": (0,0), "targets": [(4,4)]},
    "maze_5": {"grid": [[0,1,0,0,0,1,0],[0,1,0,1,0,1,0],[0,0,0,1,0,0,0],[1,1,0,1,1,1,0],[0,0,0,0,0,0,0],[0,1,1,1,1,1,0],[0,0,0,0,0,0,0]], "start": (0,0), "targets": [(6,6)]}
}

class MazeRepository:
    def __init__(self):
        self.custom_mazes = {}

    def get_by_id(self, maze_id: str):
        if maze_id in PREDEFINED_MAZES:
            return PREDEFINED_MAZES[maze_id]
        return self.custom_mazes.get(maze_id)

    def save(self, maze_id: str, grid: list, start: tuple, targets: list):
        self.custom_mazes[maze_id] = {
            "grid": grid,
            "start": start,
            "targets": targets
        }
        return True

maze_repository = MazeRepository()
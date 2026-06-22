import time
import random
from collections import deque
import heapq

class MazeService:
    @staticmethod
    def get_neighbors(grid, r, c):
        rows, cols = len(grid), len(grid[0])
        neighbors = []
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)] 
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0:
                neighbors.append((nr, nc))
        return neighbors

    @staticmethod
    def solve_bfs(grid, start, targets):
        start_time = time.perf_counter()
        queue = deque([(start, [start])])
        visited = set([start])
        explored_sequence = []
        target_set = set(targets)

        while queue:
            current, path = queue.popleft()
            explored_sequence.append(current)
            if current in target_set:
                return {"path": path, "explored_nodes": explored_sequence, "time_ms": (time.perf_counter() - start_time) * 1000}
            for neighbor in MazeService.get_neighbors(grid, current[0], current[1]):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, path + [neighbor]))
        return {"path": [], "explored_nodes": explored_sequence, "time_ms": (time.perf_counter() - start_time) * 1000}

    @staticmethod
    def solve_dfs(grid, start, targets):
        start_time = time.perf_counter()
        stack = [(start, [start])]
        visited = set()
        explored_sequence = []
        target_set = set(targets)

        while stack:
            current, path = stack.pop()
            if current not in visited:
                visited.add(current)
                explored_sequence.append(current)
                if current in target_set:
                    return {"path": path, "explored_nodes": explored_sequence, "time_ms": (time.perf_counter() - start_time) * 1000}
                for neighbor in reversed(MazeService.get_neighbors(grid, current[0], current[1])):
                    if neighbor not in visited:
                        stack.append((neighbor, path + [neighbor]))
        return {"path": [], "explored_nodes": explored_sequence, "time_ms": (time.perf_counter() - start_time) * 1000}

    @staticmethod
    def solve_astar(grid, start, targets):
        start_time = time.perf_counter()
        def heuristic(node):
            return min(abs(node[0] - t[0]) + abs(node[1] - t[1]) for t in targets)

        pq = [(heuristic(start), 0, start, [start])]
        visited = {}
        explored_sequence = []
        target_set = set(targets)

        while pq:
            f, g, current, path = heapq.heappop(pq)
            if current in visited and visited[current] <= g:
                continue
            visited[current] = g
            explored_sequence.append(current)
            if current in target_set:
                return {"path": path, "explored_nodes": explored_sequence, "time_ms": (time.perf_counter() - start_time) * 1000}
            for neighbor in MazeService.get_neighbors(grid, current[0], current[1]):
                new_g = g + 1
                if neighbor not in visited or new_g < visited[neighbor]:
                    heapq.heappush(pq, (new_g + heuristic(neighbor), new_g, neighbor, path + [neighbor]))
        return {"path": [], "explored_nodes": explored_sequence, "time_ms": (time.perf_counter() - start_time) * 1000}

    @staticmethod
    def generate_random(rows: int, cols: int):
        grid = [[1 for _ in range(cols)] for _ in range(rows)]
        def carve_passages_from(r, c):
            grid[r][c] = 0
            directions = [(0, 2), (2, 0), (0, -2), (-2, 0)]
            random.shuffle(directions)
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[r + dr // 2][c + dc // 2] = 0
                    carve_passages_from(nr, nc)
        carve_passages_from(0, 0)
        grid[rows-1][cols-1] = 0
        grid[rows-2][cols-1] = 0
        grid[rows-1][cols-2] = 0
        return {"grid": grid, "start": (0, 0), "targets": [(rows-1, cols-1)]}

maze_service = MazeService()
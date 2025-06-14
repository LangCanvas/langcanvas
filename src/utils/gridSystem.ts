
import { EnhancedNode } from '../types/nodeTypes';
import { getNodeDimensions } from './edgeCalculations';

export interface GridCell {
  x: number;
  y: number;
  isObstacle: boolean;
  cost: number;
}

export interface GridConfig {
  cellSize: number;
  width: number;
  height: number;
  padding: number;
}

export interface NodeObstacle {
  nodeId: string;
  gridX: number;
  gridY: number;
  gridWidth: number;
  gridHeight: number;
  padding: number;
}

export class GridSystem {
  private config: GridConfig;
  private grid: GridCell[][];
  private obstacles: Map<string, NodeObstacle> = new Map();

  constructor(canvasWidth: number, canvasHeight: number, cellSize: number = 20) {
    this.config = {
      cellSize,
      width: Math.ceil(canvasWidth / cellSize),
      height: Math.ceil(canvasHeight / cellSize),
      padding: 1
    };
    
    this.initializeGrid();
  }

  private initializeGrid(): void {
    this.grid = [];
    for (let y = 0; y < this.config.height; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.config.width; x++) {
        this.grid[y][x] = {
          x,
          y,
          isObstacle: false,
          cost: 1
        };
      }
    }
  }

  public canvasToGrid(canvasX: number, canvasY: number): { x: number, y: number } {
    return {
      x: Math.floor(canvasX / this.config.cellSize),
      y: Math.floor(canvasY / this.config.cellSize)
    };
  }

  public gridToCanvas(gridX: number, gridY: number): { x: number, y: number } {
    return {
      x: gridX * this.config.cellSize + this.config.cellSize / 2,
      y: gridY * this.config.cellSize + this.config.cellSize / 2
    };
  }

  public addNodeObstacle(node: EnhancedNode): void {
    const { width, height } = getNodeDimensions(node.type);
    const topLeft = this.canvasToGrid(node.x, node.y);
    const bottomRight = this.canvasToGrid(node.x + width, node.y + height);
    
    const obstacle: NodeObstacle = {
      nodeId: node.id,
      gridX: Math.max(0, topLeft.x - this.config.padding),
      gridY: Math.max(0, topLeft.y - this.config.padding),
      gridWidth: bottomRight.x - topLeft.x + (this.config.padding * 2),
      gridHeight: bottomRight.y - topLeft.y + (this.config.padding * 2),
      padding: this.config.padding
    };

    this.obstacles.set(node.id, obstacle);
    this.updateGridObstacles();
  }

  public removeNodeObstacle(nodeId: string): void {
    this.obstacles.delete(nodeId);
    this.updateGridObstacles();
  }

  private updateGridObstacles(): void {
    // Clear all obstacles
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        this.grid[y][x].isObstacle = false;
        this.grid[y][x].cost = 1;
      }
    }

    // Add obstacles back
    this.obstacles.forEach(obstacle => {
      for (let y = obstacle.gridY; y < obstacle.gridY + obstacle.gridHeight && y < this.config.height; y++) {
        for (let x = obstacle.gridX; x < obstacle.gridX + obstacle.gridWidth && x < this.config.width; x++) {
          if (x >= 0 && y >= 0) {
            this.grid[y][x].isObstacle = true;
            this.grid[y][x].cost = Infinity;
          }
        }
      }
    });
  }

  public isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < this.config.width && y >= 0 && y < this.config.height;
  }

  public isObstacle(x: number, y: number): boolean {
    if (!this.isValidPosition(x, y)) return true;
    return this.grid[y][x].isObstacle;
  }

  public getCost(x: number, y: number): number {
    if (!this.isValidPosition(x, y)) return Infinity;
    return this.grid[y][x].cost;
  }

  public getNeighbors(x: number, y: number): Array<{ x: number, y: number, cost: number }> {
    const neighbors = [];
    
    // 8-directional movement with different costs
    const directions = [
      { dx: 0, dy: -1, cost: 1 },   // Up
      { dx: 1, dy: 0, cost: 1 },    // Right
      { dx: 0, dy: 1, cost: 1 },    // Down
      { dx: -1, dy: 0, cost: 1 },   // Left
      { dx: 1, dy: -1, cost: 1.4 }, // Up-right (diagonal)
      { dx: 1, dy: 1, cost: 1.4 },  // Down-right (diagonal)
      { dx: -1, dy: 1, cost: 1.4 }, // Down-left (diagonal)
      { dx: -1, dy: -1, cost: 1.4 } // Up-left (diagonal)
    ];

    for (const dir of directions) {
      const newX = x + dir.dx;
      const newY = y + dir.dy;
      
      if (this.isValidPosition(newX, newY) && !this.isObstacle(newX, newY)) {
        neighbors.push({
          x: newX,
          y: newY,
          cost: dir.cost * this.getCost(newX, newY)
        });
      }
    }

    return neighbors;
  }

  public getConfig(): GridConfig {
    return { ...this.config };
  }

  public updateNodes(nodes: EnhancedNode[]): void {
    // Clear existing obstacles
    this.obstacles.clear();
    
    // Add all nodes as obstacles
    nodes.forEach(node => this.addNodeObstacle(node));
  }
}

// Fast 0.5-unit grid A* pathfinder with wall doorways and furniture obstacles

import { FURNITURE_CATALOG } from '../data/furniture.js';

const CELL = 0.5;
const MIN_X = -10.5;
const MAX_X = 10.5;
const MIN_Z = -8.0;
const MAX_Z = 10.0;
const COLS = Math.round((MAX_X - MIN_X) / CELL);
const ROWS = Math.round((MAX_Z - MIN_Z) / CELL);

function toGrid(x, z) {
  const cx = Math.max(0, Math.min(COLS - 1, Math.floor((x - MIN_X) / CELL)));
  const cz = Math.max(0, Math.min(ROWS - 1, Math.floor((z - MIN_Z) / CELL)));
  return [cx, cz];
}

function toWorld(cx, cz) {
  return {
    x: MIN_X + (cx + 0.5) * CELL,
    z: MIN_Z + (cz + 0.5) * CELL,
  };
}

export class PathGrid {
  constructor() {
    this.blocked = new Uint8Array(COLS * ROWS);
  }

  idx(cx, cz) {
    return cz * COLS + cx;
  }

  markRect(x0, z0, x1, z1) {
    const [c0, r0] = toGrid(x0, z0);
    const [c1, r1] = toGrid(x1, z1);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        this.blocked[this.idx(c, r)] = 1;
      }
    }
  }

  rebuild(furnitureList) {
    this.blocked.fill(0);

    // Outer house walls (matching world.js!)
    this.markRect(-7.15, -6.15, 7.15, -5.85);   // North
    this.markRect(-7.15, -6.15, -6.85, 4.15);   // West
    this.markRect(6.85, -6.15, 7.15, 4.15);     // East
    // South wall with front doorway x: -1..1
    this.markRect(-7.15, 3.85, -1.05, 4.15);
    this.markRect(1.05, 3.85, 7.15, 4.15);

    // Interior mid-wall z = -1 with 3 wide doorways (-4.5..-2.5, 0.5..2.5, 4.5..6.5)
    this.markRect(-7.1, -1.12, -4.55, -0.88);
    this.markRect(-2.45, -1.12, 0.45, -0.88);
    this.markRect(2.55, -1.12, 4.45, -0.88);

    // Interior vertical walls (x=0 & x=4, z:-6..-1)
    this.markRect(-0.12, -6.0, 0.12, -1.0);
    this.markRect(3.88, -6.0, 4.12, -1.0);

    // Furniture footprints (slightly inset so Sims can approach closely without getting stuck)
    for (const f of furnitureList) {
      const def = FURNITURE_CATALOG[f.type];
      if (!def) continue;
      const rot90 = Math.abs(Math.sin(f.rot || 0)) > 0.7;
      const fw = (rot90 ? def.size[1] : def.size[0]) * 0.42;
      const fd = (rot90 ? def.size[0] : def.size[1]) * 0.42;
      this.markRect(f.x - fw, f.z - fd, f.x + fw, f.z + fd);
    }
  }

  isWalkable(cx, cz) {
    if (cx < 0 || cz < 0 || cx >= COLS || cz >= ROWS) return false;
    return this.blocked[this.idx(cx, cz)] === 0;
  }

  findNearestWalkable(x, z, maxRadius = 10) {
    const [sc, sr] = toGrid(x, z);
    if (this.isWalkable(sc, sr)) return [sc, sr];
    for (let rad = 1; rad <= maxRadius; rad++) {
      for (let dr = -rad; dr <= rad; dr++) {
        for (let dc = -rad; dc <= rad; dc++) {
          if (Math.abs(dr) !== rad && Math.abs(dc) !== rad) continue;
          const nc = sc + dc;
          const nr = sr + dr;
          if (this.isWalkable(nc, nr)) return [nc, nr];
        }
      }
    }
    return [sc, sr];
  }

  findPath(sx, sz, tx, tz) {
    const start = this.findNearestWalkable(sx, sz);
    const goal = this.findNearestWalkable(tx, tz);
    if (start[0] === goal[0] && start[1] === goal[1]) {
      return [toWorld(goal[0], goal[1])];
    }

    const total = COLS * ROWS;
    const gScore = new Float32Array(total).fill(1e9);
    const cameFrom = new Int32Array(total).fill(-1);
    const closed = new Uint8Array(total);

    const sIdx = this.idx(start[0], start[1]);
    const gIdx = this.idx(goal[0], goal[1]);
    gScore[sIdx] = 0;

    const open = [[sIdx, Math.hypot(goal[0] - start[0], goal[1] - start[1])]];
    const dirs = [
      [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
      [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414],
    ];

    let found = false;
    let iter = 0;
    while (open.length > 0 && iter < 1800) {
      iter++;
      // Pop lowest fScore
      let bestI = 0;
      for (let i = 1; i < open.length; i++) {
        if (open[i][1] < open[bestI][1]) bestI = i;
      }
      const [curr] = open.splice(bestI, 1);
      if (curr === gIdx) {
        found = true;
        break;
      }
      if (closed[curr]) continue;
      closed[curr] = 1;

      const cc = curr % COLS;
      const cr = (curr - cc) / COLS;

      for (const [dc, dr, cost] of dirs) {
        const nc = cc + dc;
        const nr = cr + dr;
        if (!this.isWalkable(nc, nr)) continue;
        // Avoid corner cutting through walls
        if (dc !== 0 && dr !== 0) {
          if (!this.isWalkable(cc + dc, cr) || !this.isWalkable(cc, cr + dr)) continue;
        }
        const nIdx = this.idx(nc, nr);
        if (closed[nIdx]) continue;
        const tentative = gScore[curr] + cost;
        if (tentative < gScore[nIdx]) {
          cameFrom[nIdx] = curr;
          gScore[nIdx] = tentative;
          const h = Math.hypot(goal[0] - nc, goal[1] - nr);
          open.push([nIdx, tentative + h]);
        }
      }
    }

    if (!found) {
      return [toWorld(goal[0], goal[1])];
    }

    const path = [];
    let cur = gIdx;
    while (cur !== -1 && cur !== sIdx) {
      const cc = cur % COLS;
      const cr = (cur - cc) / COLS;
      path.push(toWorld(cc, cr));
      cur = cameFrom[cur];
    }
    path.reverse();

    // Smooth redundant collinear waypoints
    if (path.length <= 2) return path;
    const smooth = [path[0]];
    for (let i = 1; i < path.length - 1; i++) {
      const prev = smooth[smooth.length - 1];
      const next = path[i + 1];
      const dx1 = path[i].x - prev.x;
      const dz1 = path[i].z - prev.z;
      const dx2 = next.x - path[i].x;
      const dz2 = next.z - path[i].z;
      if (Math.abs(dx1 * dz2 - dz1 * dx2) > 0.01) {
        smooth.push(path[i]);
      }
    }
    smooth.push(path[path.length - 1]);
    return smooth;
  }

  canPlaceFurniture(x, z, w, d) {
    // Allow placement inside house or front yard, away from walls & other furniture
    if (x < -6.3 || x > 6.3 || z < -5.3 || z > 8.2) return false;
    // Don't block doorways
    if (Math.abs(z - 4) < 1.2 && Math.abs(x) < 1.6) return false;
    if (Math.abs(z + 1) < 0.8) return false;
    const [c0, r0] = toGrid(x - w * 0.42, z - d * 0.42);
    const [c1, r1] = toGrid(x + w * 0.42, z + d * 0.42);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        if (!this.isWalkable(c, r)) return false;
      }
    }
    return true;
  }
}

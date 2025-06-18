import type { Vec2 } from "./game.model";

export function ease(x: number) {
    return Math.max(Math.min(1.01 / (1 + Math.exp(-4 * (2 * x - 1))), 1), -1);
}

export function abs([x, y]: Vec2) {
    return Math.sqrt(x * x + y * y);
}

export function getBoundingBox({ pos, size }: { pos: Vec2; size: Vec2 }) {
    return {
        top: pos[1],
        bottom: pos[1] - size[1],
        left: pos[0],
        right: pos[0] + size[0],
    };
}
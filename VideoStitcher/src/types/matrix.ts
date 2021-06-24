import { Vec2 } from "../types/vector"

export interface Mat2 {
	values: [number, number, number, number];
};

export function Apply(matrix: Mat2, vec: Vec2): Vec2 {
	return {
		x: vec.x * matrix.values[0] + vec.y * matrix.values[1],
		y: vec.x * matrix.values[2] + vec.y * matrix.values[3],
	};
}

export const Rotate = (theta: number): Mat2 => {
	return {
		values: [Math.cos(theta), -Math.sin(theta), Math.sin(theta), Math.cos(theta)],
	};
}

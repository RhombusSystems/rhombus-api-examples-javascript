import { Vec2 } from "../types/vector"
import { CameraPlot } from "../services/graph_service"

export interface Triangle {
	// Counter clockwise
	p0: Vec2;
	p1: Vec2;
	p2: Vec2;
};

export interface Line {
	a: number;
	b: number;
	c: number;
};



export const LeftOfLine = (a: Vec2, b: Vec2, c: Vec2) => {
	return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) > 0;
}

export const TriangleFromCameraPlot = (camera: CameraPlot, offset: number): Triangle => {
	return {
		p0: { x: camera.x[0] + offset, y: camera.y[0] + offset },
		p1: { x: camera.x[1] + offset, y: camera.y[1] + offset },
		p2: { x: camera.x[2] + offset, y: camera.y[2] + offset },
	};
}

export const PointInsideTriangle = (triangle: Triangle, point: Vec2): boolean => {
	const l1 = LeftOfLine(triangle.p0, triangle.p1, point);
	const l2 = LeftOfLine(triangle.p1, triangle.p2, point);
	const l3 = LeftOfLine(triangle.p2, triangle.p0, point);
	return l1 && l2 && l3;
}


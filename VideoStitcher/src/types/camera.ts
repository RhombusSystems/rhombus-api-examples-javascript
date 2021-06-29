import { Vec2 } from "./vector";

export interface Camera {
	uuid: string;
	rotationRadians: number;
	location: Vec2;
	FOV: number;
	viewDistance: number;
}

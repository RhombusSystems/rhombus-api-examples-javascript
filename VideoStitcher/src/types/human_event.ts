import { Vec2 } from "./vector"

export interface HumanEvent {
	position: Vec2;
	dimensions: Vec2;
	id: number;
	timestamp: number;
	camUUID: string;
};

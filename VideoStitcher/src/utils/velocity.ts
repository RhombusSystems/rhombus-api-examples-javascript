import { HumanEvent } from "../types/human_event"
import { divide, subtract, Vec2 } from "../types/vector"

export const GetVelocity = (a: HumanEvent, b: HumanEvent):Vec2 => {
	return divide(subtract(b.position, a.position), (b.timestamp - a.timestamp));
}

export const NormalizeVelocity = (a: Vec2, threshold: Vec2 = { x: 0, y: 0 }): Vec2 => {
	let normalizedVelocity: Vec2 = { x: 0, y: 0 };
	if (a.x > threshold.x) {
		normalizedVelocity.x = 1;
	} else if (a.x < -threshold.x) {
		normalizedVelocity.x = -1;
	}

	if (a.y > threshold.y) {
		normalizedVelocity.y = 1;
	} else if (a.y < -threshold.y) {
		normalizedVelocity.y = -1;
	}
	return normalizedVelocity;
}

export const NormalizePosition = (a: Vec2, threshold: Vec2): Vec2 => {
	let normalizedVelocity: Vec2 = { x: 0, y: 0 };
	if (a.x > 1 - threshold.x) {
		normalizedVelocity.x = 1;
	} else if (a.x < threshold.x) {
		normalizedVelocity.x = -1;
	}

	if (a.y > 1 - threshold.y) {
		normalizedVelocity.y = -1;
	} else if (a.y < threshold.y) {
		normalizedVelocity.y = 1;
	}
	return normalizedVelocity;
}
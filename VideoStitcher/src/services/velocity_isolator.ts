import { HumanEvent } from "../types/human_event"

import { EdgeEventsType } from "./edge_event_detector"

import { GetVelocity } from "../utils/velocity"
import { abs, compare, Vec2 } from "../types/vector";

export const NormalizeVelocity = (a: Vec2): Vec2 =>  {
	let normalizedVelocity: Vec2 = { x: 0, y: 0};
	if(a.x > 0) {
		normalizedVelocity.x = 1;
	} else if(a.x < 0) {
		normalizedVelocity.x = -1;
	}

	if(a.y > 0) {
		normalizedVelocity.y = 1;
	} else if(a.y < 0) {
		normalizedVelocity.y = -1;
	}
	return normalizedVelocity;
}

export const NormalizePosition = (a: Vec2, threshold: Vec2): Vec2 => {
	let normalizedVelocity: Vec2 = {x: 0, y: 0};
	if(a.x > 1 - threshold.x) {
		normalizedVelocity.x = 1;
	} else if(a.x < threshold.x){
		normalizedVelocity.x = -1;
	}

	if(a.y > 1 - threshold.y) {
		normalizedVelocity.y = 1;
	} else if(a.y < threshold.y) {
		normalizedVelocity.y = -1;
	}
	return normalizedVelocity;
}

export const IsolateVelocities = (events: Map<number, HumanEvent[]>, type: EdgeEventsType, camUUID: string): Map<number, HumanEvent[]> => {
	events.forEach((es) => {
		let velocity: Vec2;
		const finalEvent = es[es.length - 1];
		const beginEvent = es[0];

		if (type == EdgeEventsType.End) {
			const determiningEvent = es[es.length - 2];
			velocity = GetVelocity(determiningEvent, finalEvent);
		} else if (type == EdgeEventsType.Begin) {
			const determiningEvent = es[1];
			velocity = GetVelocity(beginEvent, determiningEvent);

		}

		if (compare(abs(velocity), 0.025 / 1000) == 1) {
			events.delete(finalEvent.id);
		} else {
			const normalizedVelocity = NormalizeVelocity(velocity);

			if (type == EdgeEventsType.End) {
				const normalizedPosition = NormalizePosition(finalEvent.position, {x: 0.25, y: 0.25});
				if (normalizedVelocity.x - normalizedPosition.x != 0 && normalizedVelocity.y - normalizedPosition.y != 0) {
					events.delete(finalEvent.id);
				} 
			} else if (type == EdgeEventsType.Begin) {
				const normalizedPosition = NormalizePosition(beginEvent.position, {x: 0.5, y: 0.5});
				if (normalizedVelocity.x - normalizedPosition.x != 0 && normalizedVelocity.y - normalizedPosition.y != 0) {
					events.delete(beginEvent.id);
				}
			}
		}
	});

	return events;
}

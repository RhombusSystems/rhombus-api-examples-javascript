import { HumanEvent } from "../../types/human_event"

import { EdgeEventsType } from "../services/edge_event_detector"

import { NormalizeVelocity, NormalizePosition, GetVelocity } from "../../utils/velocity"
import { abs, compare, Vec2 } from "../../types/vector";


export const IsolateVelocities = (events: Map<number, HumanEvent[]>, type: EdgeEventsType): Map<number, HumanEvent[]> => {
	events.forEach((es) => {
		let velocity: Vec2;
		const finalEvent = es[es.length - 1];
		const beginEvent = es[0];

		let velocities: Vec2[] = [];

		if (type == EdgeEventsType.Begin) {
			for (let i = 1; i < 4 && i < es.length; i++) {
				const previousEvent = es[i - 1];
				const currentEvent = es[i];
				const velocity = GetVelocity(previousEvent, currentEvent);
				velocities.push(velocity);
			}
		} else if (type == EdgeEventsType.End) {
			for (let i = es.length - 2; i >= es.length - 4 && i >= 0; i--) {
				const previousEvent = es[i + 1];
				const currentEvent = es[i];
				const velocity = GetVelocity(previousEvent, currentEvent);
				velocities.push(velocity);
			}
		}

		if (velocities.length % 2 == 0) velocities.pop();

		let negCount = 0;
		let posCount = 0;
		for (let i = 0; i < velocities.length; i++) {
			const normalizedVelocity = NormalizeVelocity(velocities[i]);
			if (normalizedVelocity.x > 0) {
				posCount++;
			} else if (normalizedVelocity.x < 0) {
				negCount++;
			}
		}

		let check = posCount > negCount ? 1 : -1;

		let totalVelocityX = 0;
		velocities.forEach(velocity => {
			const normalizedVelocity = NormalizeVelocity(velocity);
			if (normalizedVelocity.x == check) {
				totalVelocityX += velocity.x;
			}
		});

		const avgVelocityX = totalVelocityX / Math.max(posCount, negCount);


		negCount = 0;
		posCount = 0;
		for (let i = 0; i < velocities.length; i++) {
			const normalizedVelocity = NormalizeVelocity(velocities[i]);
			if (normalizedVelocity.y > 0) {
				posCount++;
			} else if (normalizedVelocity.y < 0) {
				negCount++;
			}
		}

		check = posCount > negCount ? 1 : -1;

		let totalVelocityY = 0;
		velocities.forEach(velocity => {
			const normalizedVelocity = NormalizeVelocity(velocity);
			if (normalizedVelocity.y == check) {
				totalVelocityY += velocity.y;
			}
		});

		const avgVelocityY = totalVelocityY / Math.max(posCount, negCount);

		velocity = { x: avgVelocityX, y: avgVelocityY };


		if (compare(abs(velocity), 0.015 / 1000) == 1) {
			events.delete(finalEvent.id);
		} else {
			const normalizedVelocity = NormalizeVelocity(velocity);

			if (type == EdgeEventsType.End) {
				const normalizedPosition = NormalizePosition(finalEvent.position, { x: 0.4, y: 0.4 });
				if (normalizedVelocity.x - normalizedPosition.x != 0 && normalizedVelocity.y - normalizedPosition.y != 0) {
					events.delete(finalEvent.id);
				}
			} else if (type == EdgeEventsType.Begin) {
				const normalizedPosition = NormalizePosition(beginEvent.position, { x: 0.5, y: 0.5 });
				if (normalizedVelocity.x - normalizedPosition.x != 0 && normalizedVelocity.y - normalizedPosition.y != 0) {
					events.delete(beginEvent.id);
				}
			}
		}
	});

	return events;
}

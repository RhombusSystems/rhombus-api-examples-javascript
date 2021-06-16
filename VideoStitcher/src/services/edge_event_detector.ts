import { HumanEvent } from "../types/human_event"

export const DetectEdgeEvents = (allEvents: Map<number, HumanEvent[]>): Map<number, HumanEvent[]> => {
	let edgeEvents: Map<number, HumanEvent[]> = new Map();

	allEvents.forEach((events) => {
		let i = 0;
		for (let event of events) {
			if (i == events.length - 1) {
				if (event.position.x < 0.2 || event.position.x > 0.8) {
					edgeEvents.set(event.id, events);
				}
			}
			i++;
		}
	});

	return edgeEvents;
}

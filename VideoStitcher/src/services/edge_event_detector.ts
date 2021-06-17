import { HumanEvent } from "../types/human_event"

export enum EdgeEventsType {
	Begin,
	End,
};

export const DetectEdgeEvents = (allEvents: Map<number, HumanEvent[]>, type: EdgeEventsType): Map<number, HumanEvent[]> => {
	let edgeEvents: Map<number, HumanEvent[]> = new Map();

	allEvents.forEach((events) => {
		const event = type == EdgeEventsType.Begin ? events[0] : events[events.length - 1];
		if (event.position.x < 0.25 || event.position.x > 0.75) {
			edgeEvents.set(event.id, events);
		}
	});

	return edgeEvents;
}

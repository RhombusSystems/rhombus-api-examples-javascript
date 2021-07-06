import { HumanEvent } from "../../types/human_event"

export enum EdgeEventsType {
	Begin,
	End,
};

export const IsolateEdgeEvents = (allEvents: Map<number, HumanEvent[]>, type: EdgeEventsType): Map<number, HumanEvent[]> => {
	let edgeEvents: Map<number, HumanEvent[]> = new Map();

	allEvents.forEach((events) => {
		const event = type == EdgeEventsType.Begin ? events[0] : events[events.length - 1];
		if (type == EdgeEventsType.End) {
			if (event.position.y < 0.4 || event.position.y > 0.6 || event.position.x < 0.4 || event.position.x > 0.6) {
				edgeEvents.set(event.id, events);
			}
		} else {
			if (event.position.y < 0.5 || event.position.y > 0.5 || event.position.x < 0.5 || event.position.x > 0.5) {
				edgeEvents.set(event.id, events);
			}
		}

	});

	return edgeEvents;
}

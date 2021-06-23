import { HumanEvent } from "../types/human_event"

export const IsolateHumanEventsFromObjectID = (es: HumanEvent[], startFromBeginning: boolean = false): HumanEvent[] => {
	if (startFromBeginning) {
		for (let i = 0; i < es.length - 2; i++) {
			const event = es[i];
			const followingEvent = es[i + 1];
			if (followingEvent.timestamp - event.timestamp > 10 * 1000) {
				es.splice(i + 1, es.length - 1);
				return es;
			}
		}
	} else {
		for (let i = es.length - 2; i >= 0 && i <= es.length - 2; i--) {
			const event = es[i];
			const followingEvent = es[i + 1];
			if (followingEvent.timestamp - event.timestamp > 10 * 1000) {
				es.splice(0, i + 1);
			}
		}
	}
	return es;
}

export const IsolateObjectIDEvents = (events: Map<number, HumanEvent[]>): Map<number, HumanEvent[]> => {
	events.forEach((es) => IsolateHumanEventsFromObjectID(es));
	return events;
}

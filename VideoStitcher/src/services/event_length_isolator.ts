import { HumanEvent } from "../types/human_event"

export const IsolateEventsFromLength = (events: Map<number, HumanEvent[]>): Map<number, HumanEvent[]> => {
	events.forEach((es: HumanEvent[], id: number,) => {
		if (es.length < 2) {
			events.delete(id);
		}
	});
	return events;
}

import { HumanEvent } from "../../types/human_event"
import { Environment } from "../../environment/environment"

export const IsolateEventsFromLength = (events: Map<number, HumanEvent[]>): Map<number, HumanEvent[]> => {
	events.forEach((es: HumanEvent[], id: number,) => {
		if (es.length < Environment.MinimumEventLength) {
			events.delete(id);
		}
	});
	return events;
}

import { HumanEvent } from "../../types/human_event"
import { MinimumEventLength } from "../../environment/environment"

export const IsolateEventsFromLength = (events: Map<number, HumanEvent[]>): Map<number, HumanEvent[]> => {
	events.forEach((es: HumanEvent[], id: number,) => {
		if (es.length < MinimumEventLength) {
			events.delete(id);
		}
	});
	return events;
}

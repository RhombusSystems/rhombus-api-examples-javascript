import { HumanEvent } from "../../types/human_event"
import { Environment } from "../../environment/environment"

/*
  *
  * @export
  * @method Isolates events and only returns events that have a minimum number of events
  *
  * @param {Map<number, HumanEvent[]>} [events] A map of objectID to human event list
  *
  * @return {Map<number, HumanEvent[]>} Returns only events that have at least `Environment.MinimumEventLength` events
  * */
export const IsolateEventsFromLength = (events: Map<number, HumanEvent[]>): Map<number, HumanEvent[]> => {
	// Loop through all of the events
	events.forEach((es: HumanEvent[], id: number,) => {
		// If the number of events does not pass the threshold, then delete them
		if (es.length < Environment.MinimumEventLength)
			events.delete(id);
	});
	return events;
}

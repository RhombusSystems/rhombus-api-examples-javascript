import { HumanEvent } from "../../types/human_event"

/*
  *
  * @export
  * @method Isolates events and only returns events that are at the edge of the camera's viewport
  *
  * @param {Map<number, HumanEvent[]>} [allEvents] A map of objectID to human event list
  *
  * @return {Map<number, HumanEvent[]>} Returns the resulting vector [a.x + b.x, a.y + b.y]
  * */
export const IsolateEdgeEvents = (allEvents: Map<number, HumanEvent[]>): Map<number, HumanEvent[]> => {
	// Create a new map for our edge events
	let edgeEvents: Map<number, HumanEvent[]> = new Map();

	// Loop through all of the events
	allEvents.forEach((events) => {
		// The last event is what matters for us, since this isolator is only used for the exit event detection pipeline
		const event = events[events.length - 1];

		// If the position of the event is above our threshold, then we can add the events to our edge events map
		if (event.position.y < 0.4 || event.position.y > 0.6 || event.position.x < 0.4 || event.position.x > 0.6)
			edgeEvents.set(event.id, events);

	});

	// Return the edge events
	return edgeEvents;
}

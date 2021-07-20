import { HumanEvent } from "../../types/human_event"
import { Environment } from "../../environment/environment"

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

		// Edge values
		const smallEdge = Environment.EdgeEventDetectionDistanceFromEdge;
		const largeEdge = 1 - Environment.EdgeEventDetectionDistanceFromEdge;

		// If the position of the event is above our threshold, then we can add the events to our edge events map
		if (event.position.y < smallEdge || event.position.y > largeEdge || event.position.x < smallEdge || event.position.x > largeEdge)
			edgeEvents.set(event.id, events);

	});

	// Return the edge events
	return edgeEvents;
}

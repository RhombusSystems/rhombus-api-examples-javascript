import { HumanEvent } from "../types/human_event"

export const CollateEvents = (events: Map<number, HumanEvent[]>): Map<number, HumanEvent[]> => {
	for (let [currentID, currentEvents] of events) {

		for (let i = currentEvents.length - 1; i >= 0; i--) {
			for (let [otherID, otherEvents] of events) {
				if (currentID != otherID) {
					const currentEvent = currentEvents[i];
					for (let j = otherEvents.length - 1; j >= 0; j--) {
						const otherEvent = otherEvents[j];
						const xSimilar = Math.abs(currentEvent.position.x - otherEvent.position.x) < 0.1;
						const ySimilar = Math.abs(currentEvent.position.y - otherEvent.position.y) < 0.1;
						const wSimilar = Math.abs(currentEvent.dimensions.x - otherEvent.dimensions.x) < 0.1;
						const hSimilar = Math.abs(currentEvent.dimensions.y - otherEvent.dimensions.y) < 0.1;
						const tSimilar = Math.abs(currentEvent.timestamp - otherEvent.timestamp) < 500;
						if (xSimilar && ySimilar && wSimilar && hSimilar && tSimilar) {
							console.log("Combining " + currentID + " with " + otherID);
							otherEvents.forEach(e => e.id = currentEvent.id);
							currentEvents = currentEvents.concat(otherEvents);
							events.set(currentID, currentEvents);
							events.delete(otherID);
							break;
						}
					}
				}
			}
		}
	}
	return events;
}

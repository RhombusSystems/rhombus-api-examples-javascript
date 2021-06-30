import { HumanEvent } from "../types/human_event"
import { SortHumanEventsByTime } from "./graph_service"
import { EnterEvent, ExitEvent } from "../types/events"
import { GetVelocity } from "../utils/velocity"
import { abs, compare, subtract } from "../types/vector"

export const CollateEvents = (events: Map<number, HumanEvent[]>): Map<number, HumanEvent[]> => {
	for (let [currentID, currentEvents] of events) {
		for (let i = currentEvents.length - 1; i >= 0; i--) {
			for (let [otherID, otherEvents] of events) {
				if (currentID != otherID) {
					const currentEvent = currentEvents[i];
					for (let j = otherEvents.length - 1; j >= 0; j--) {
						const otherEvent = otherEvents[j];
						const vSimilar = compare(GetVelocity(currentEvent, otherEvent), 0.001 / 1000) == 1;
						const wSimilar = Math.abs(currentEvent.dimensions.x - otherEvent.dimensions.x) < 0.05;
						const hSimilar = Math.abs(currentEvent.dimensions.y - otherEvent.dimensions.y) < 0.05;
						const tSimilar = Math.abs(currentEvent.timestamp - otherEvent.timestamp) < 500;
						if (wSimilar && hSimilar && tSimilar && vSimilar) {
							console.log("Combining " + currentID + " with " + otherID);
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
	for (let [_, es] of events) {
		es.sort(SortHumanEventsByTime);
	}

	return events;
}

export const CanCollateEvents = (a: EnterEvent, b: EnterEvent): boolean => {
	const aEvent = a.events[a.events.length - 1];
	const bEvent = b.events[0];
	const timeDelta = bEvent.timestamp - aEvent.timestamp;
	if (aEvent.camUUID == bEvent.camUUID && timeDelta < 5000 && timeDelta > 0 && compare(abs(subtract(aEvent.position, bEvent.position)), 0.1) == 1)
		return true;
	const aVelocity = GetVelocity(aEvent, a.events[a.events.length - 2]);
	const bVelocity = GetVelocity(b.events[1], bEvent);

	const velocityBetween = GetVelocity(aEvent, bEvent);

	const vAAndBSimilar = compare(subtract(aVelocity, bVelocity), 0.1) == 1;
	const vBetweenAndASimilar = compare(subtract(velocityBetween, aVelocity), 0.1) == 1;
	const vBetweenAndBSimilar = compare(subtract(velocityBetween, bVelocity),  0.1) == 1;
	if (vAAndBSimilar && vBetweenAndASimilar && vBetweenAndBSimilar) {
		return true;
	} else {
		return false;
	}
}

export const DoCollateEnterAndExit = (a: EnterEvent, b: ExitEvent): ExitEvent => {
	return {
		events: a.events.concat(b.events).sort(SortHumanEventsByTime),
		id: b.id,
		relatedEvents: b.relatedEvents,
		velocity: b.velocity,
	};
}

import { HumanEvent } from "../../types/human_event"
import { CompareHumanEventsByTime } from "../../types/events"
import { EnterEvent, ExitEvent } from "../../types/events"
import { GetVelocity } from "../../utils/velocity"
import { abs, compare, subtract } from "../../types/vector"

/*
  *
  * @export
  * @method Comnbines Human Events that are similar, even if object IDs do not match
  *
  * @param {Map<number, HumanEvent[]>} [events] A map of objectID to human event list
  *
  * @return {Map<number, HumanEvent[]>} Returns only events that have at least `Environment.MinimumEventLength` events
  * */
export const CollateHumanEvents = (events: Map<number, HumanEvent[]>): Map<number, HumanEvent[]> => {
	// Loop through all of the object IDs that Rhombus classified and their human events
	// Yes there are 4 nested loops, no I couldn't think of a better way of doing this, yes there probably is a better way of doing this, no I don't regret my actions 
	for (let [currentID, currentEvents] of events) {
		for (let i = currentEvents.length - 1; i >= 0; i--) {

			// Now we will loop through all of the events again to find similar human events
			for (let [otherID, otherEvents] of events) {

				// Don't loop over ourself
				if (currentID != otherID) {

					// Get the current event
					const currentEvent = currentEvents[i];

					// Loop through all of the events of the otherID
					for (let j = otherEvents.length - 1; j >= 0; j--) {
						const otherEvent = otherEvents[j];

						// We will check to make sure the velocity, height, width, and timestamp are all similar within a certain threshold
						const vSimilar = compare(GetVelocity(currentEvent, otherEvent), 0.001 / 1000) == 1;
						const wSimilar = Math.abs(currentEvent.dimensions.x - otherEvent.dimensions.x) < 0.05;
						const hSimilar = Math.abs(currentEvent.dimensions.y - otherEvent.dimensions.y) < 0.05;
						const tSimilar = Math.abs(currentEvent.timestamp - otherEvent.timestamp) < 500;

						// If all of the checks pass
						if (wSimilar && hSimilar && tSimilar && vSimilar) {
							// Combine the events
							console.log("Combining " + currentID + " with " + otherID);

							// The current events will be combined with the other events
							currentEvents = currentEvents.concat(otherEvents);

							// Update the array
							events.set(currentID, currentEvents);

							// Delete the duplicate event data
							events.delete(otherID);

							// Nothing more to do with this other event since all the events have been combined, so break
							break;
						}

					}
				}
			}
		}
	}

	// Make sure to sort all of the events properly
	for (let [_, es] of events) {
		es.sort(CompareHumanEventsByTime);
	}

	// Return the events
	return events;
}

/*
  *
  * @export
  * @method Checks whether two events follow the pattern that `b` follows `a` in such a way that makes it seem like they are connected and can be combined
  *
  * @param {EnterEvent} [a] First event to check
  * @param {EnterEvent} [b] Second event to check
  *
  * @return {boolean} Returns true if the events can be combined since they are similar
  * */
export const CanCollateEvents = (a: EnterEvent, b: EnterEvent): boolean => {
	const aEvent = a.events[a.events.length - 1];
	const bEvent = b.events[0];

	// Get the time delta in miliseconds between the last human event of `a` to the first human event of `b`
	const timeDelta = bEvent.timestamp - aEvent.timestamp;

	// If the camera UUID is the same, the time delta is withing 5 seconds, and the positions are nearly identical, then we can assume that the events can be collated
	if (aEvent.camera.uuid == bEvent.camera.uuid && timeDelta < 5000 && timeDelta > 0 && compare(abs(subtract(aEvent.position, bEvent.position)), 0.1) == 1)
		return true;

	// Another check we will do is based on velocity
	// We will get the velocity between the last 2 events of `a`
	const aVelocity = GetVelocity(aEvent, a.events[a.events.length - 2]);
	// And the velocity between the first 2 events of `b`
	const bVelocity = GetVelocity(b.events[1], bEvent);

	// We will also get the velocity between `a` and `b`
	const velocityBetween = GetVelocity(aEvent, bEvent);

	// Make sure that the velocity of `a` and `b` are almost the same (within a 0.1 threshold which is extremely generous)
	const vAAndBSimilar = compare(subtract(aVelocity, bVelocity), 0.1) == 1;

	// Make sure that the velocity between `a` and `b` is similar to the velocities of the end of `a` and the beginning of `b` (within a 0.1 threshold which is extremely generous).
	// On a graph this will look like 2 lines that have a break in the middle but the middle section looks like a continuation of the line. 
	const vBetweenAndASimilar = compare(subtract(velocityBetween, aVelocity), 0.1) == 1;
	const vBetweenAndBSimilar = compare(subtract(velocityBetween, bVelocity), 0.1) == 1;

	if (vAAndBSimilar && vBetweenAndASimilar && vBetweenAndBSimilar) {
		// If everything with the velocities checks out, then return
		return true;
	}

	// Otherwise return false
	return false;
}

/*
  *
  * @export
  * @method Comnbines Human Events that are similar, even if object IDs do not match
  *
  * @param {EnterEvent} [a] The enter event to combine the exit event with
  * @param {ExitEvent} [b] The exit event to combine the enter event with
  *
  * @return {ExitEvent} Returns a combined exit event that has the events of both enter event `a` and exit event `b`
  * */
export const DoCollateEnterAndExit = (a: EnterEvent, b: ExitEvent): ExitEvent => {
	return {
		// The events will consist of both of the events of `a` and `b`. These will also be sorted by timestamp.
		events: a.events.concat(b.events).sort(CompareHumanEventsByTime),
		id: b.id,
		relatedEvents: b.relatedEvents,
		velocity: b.velocity,
	};
}

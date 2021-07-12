import { CompareHumanEventsByTime } from "../../types/events"
import { EnterEvent, ExitEvent } from "../../types/events"
import { GetVelocity } from "../../utils/velocity"
import { abs, compare, subtract } from "../../types/vector"

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
  * @method Combines Human Events that are similar, even if object IDs do not match
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

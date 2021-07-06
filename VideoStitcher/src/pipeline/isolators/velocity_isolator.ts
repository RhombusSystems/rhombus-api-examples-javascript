import { HumanEvent } from "../../types/human_event"

import { EdgeEventsType } from "../../types/events"

import { NormalizeVelocity, NormalizePosition, GetVelocity } from "../../utils/velocity"
import { abs, compare, Vec2 } from "../../types/vector";

/*
  *
  * @export
  * @method Isolates events and only returns events that pass a certain minimum velocity and have a direction that matches the edge location of the event
  *
  * @param {Map<number, HumanEvent[]>} [events] A map of objectID to human event list
  * @param {EdgeEventsType} [type] Whether or not we are isolating based on enter or exit events
  *
  * @return {Map<number, HumanEvent[]>} Returns only events that pass a certain minimum velocity and have a direction that matches the edge location of the event
  * */
export const IsolateVelocities = (events: Map<number, HumanEvent[]>, type: EdgeEventsType): Map<number, HumanEvent[]> => {
	// Loop through all of the events
	events.forEach(es => {
		// Declare our velocity
		let velocity: Vec2;

		// Get our beginning and final events
		const beginEvent = es[0];
		const finalEvent = es[es.length - 1];

		// We will get the velocities between the human events and store them here.
		// These will later be ranked and we will come out with a final average velocity.
		let velocities: Vec2[] = [];

		if (type == EdgeEventsType.Begin) {
			// If we are looking for begin events, start from the beginning and get all of the velocities up to 4 elements or until we run out of human events to get velocities for
			for (let i = 1; i < 4 && i < es.length; i++) {
				// We will get the previous event
				const previousEvent = es[i - 1];

				// And the current event
				const currentEvent = es[i];

				// And get the velocity between these two human events
				const velocity = GetVelocity(previousEvent, currentEvent);

				// Then add the velocity to the array
				velocities.push(velocity);
			}
		} else if (type == EdgeEventsType.End) {
			// If we are looking for begin events, start from the end and get all of the velocities up to 4 elements or until we run out of human events to get velocities for
			for (let i = es.length - 2; i >= es.length - 4 && i >= 0; i--) {
				// We will get the following event
				const followingEvent = es[i + 1];

				// And the current event
				const currentEvent = es[i];

				// And get the velocity between the two
				const velocity = GetVelocity(currentEvent, followingEvent);

				// Then add the velocity to the array
				velocities.push(velocity);
			}
		}


		// If we have an even number of velocities, remove the last one so that we can properly rank
		if (velocities.length % 2 == 0) velocities.pop();

		// Next we are going to tally the number of positive and negative X direction velocities, see which one wins, then get the average X velocity based on that

		// We are going to count the number of negative and positive velocities for ranking
		let negCount = 0;
		let posCount = 0;

		// Loop through all of the velocities
		for (let i = 0; i < velocities.length; i++) {
			// Normalize the velocities
			const normalizedVelocity = NormalizeVelocity(velocities[i]);

			if (normalizedVelocity.x > 0) {
				// If the normalized velocity is 1, increase the positive tally
				posCount++;
			} else if (normalizedVelocity.x < 0) {
				// If the normalized velocity is -1, increase the negative tally
				negCount++;
			}

			// If the normalized velocity is 0 then we won't worry about it.
			// This will almost never happen because there will almost certainly be differences in the bounding box position, even if small.
			// Since our threshold is just 0, there just needs to be any change in position AT ALL to consider it.
		}

		// Figure out the winner, and use that as our check
		let check = posCount > negCount ? 1 : -1;

		// Here we will accumulate our total velocity in the X axis
		let totalVelocityX = 0;

		// Loop through all of the velocities
		velocities.forEach(velocity => {
			// Normalize the velocity
			const normalizedVelocity = NormalizeVelocity(velocity);

			// If the normalized velocity is the same as our check, that means that we will add it to our total velocity. 
			// For example if the check is 1 (meaning right) if the normalized velocity is also 1, then this velocity is also going right and we should consider it
			// We don't want to take the average of velocities that are going in the opposite direction. 
			// We only want to worry about the velocities that match the most common direction and use that as the average.
			if (normalizedVelocity.x == check) {
				totalVelocityX += velocity.x;
			}
		});

		// Finally here is our average velocity
		const avgVelocityX = totalVelocityX / Math.max(posCount, negCount);

		// Reset the tally, and do the same thing on the Y axis
		negCount = 0;
		posCount = 0;

		// Loop through all of the velocities
		for (let i = 0; i < velocities.length; i++) {
			// Normalize the velocities
			const normalizedVelocity = NormalizeVelocity(velocities[i]);

			if (normalizedVelocity.y > 0) {
				// If the normalized velocity is 1, increase the positive tally
				posCount++;
			} else if (normalizedVelocity.y < 0) {
				// If the normalized velocity is -1, increase the negative tally
				negCount++;
			}

			// If the normalized velocity is 0 then we won't worry about it.
			// This will almost never happen because there will almost certainly be differences in the bounding box position, even if small.
			// Since our threshold is just 0, there just needs to be any change in position AT ALL to consider it.
		}

		// Figure out the winner, and use that as our check
		check = posCount > negCount ? 1 : -1;

		// Here we will accumulate our total velocity in the Y axis
		let totalVelocityY = 0;

		// Loop through all of the velocities
		velocities.forEach(velocity => {
			// Normalize the velocity
			const normalizedVelocity = NormalizeVelocity(velocity);

			// If the normalized velocity is the same as our check, that means that we will add it to our total velocity. 
			// For example if the check is 1 (meaning down) if the normalized velocity is also 1, then this velocity is also going down and we should consider it
			// We don't want to take the average of velocities that are going in the opposite direction. 
			// We only want to worry about the velocities that match the most common direction and use that as the average.
			if (normalizedVelocity.y == check) {
				totalVelocityY += velocity.y;
			}
		});

		// Finally here is our average velocity
		const avgVelocityY = totalVelocityY / Math.max(posCount, negCount);

		// Our velocity is the two average velocities
		velocity = { x: avgVelocityX, y: avgVelocityY };

		// Next we will check to make sure that the magnitude abolute value of the velocity is greater than the threshold.
		if (compare(abs(velocity), 0.015 / 1000) == 1) {
			// If the velocity doesn't meet the threshold then we will delete the event
			events.delete(finalEvent.id);
		} else {
			// Get the normalized velocity
			const normalizedVelocity = NormalizeVelocity(velocity);

			// Next we need to make sure that the position of the human is on the edge of the screen is matches the velocity. If they are moving right, we want to make sure that 
			//
			// Because normalization will only give us a value of -1, 1, or 0, we can simply subtract the normalized position from the normalized velocity
			// to make sure that they velocity is in the same direction as the position on the edge.
			//
			// For example, if our normalized position on the x axis is 1, that means that the person is near the right of the screen. 
			// We want to make sure that our velocity is going in the right direction. 
			// For a type of EdgeEventsType.End, this means that the normalized velocity is also going right, or 1.
			// For a type of EdgeEventsType.Begin, this means that the normalized velocity is going left, or -1.
			//
			// Based on these normalized values, we can simply subtract the normalized position from the normalized velocity to see that if it is an exit event it should be 0
			// and if it is an enter event it should NOT be 0
			//
			//
			// TLDR: Subtract the normalized position from the normalized velocity to make sure that it is going in the correct direction
			if (type == EdgeEventsType.End) {
				// If we are isolating based on exit events then we will normalize the position of the final event
				const normalizedPosition = NormalizePosition(finalEvent.position, { x: 0.4, y: 0.4 });

				// Then we will compare the normalized position to the normalized velocity. Since this is an exit event we want these to match and thus be 0
				if (normalizedVelocity.x - normalizedPosition.x != 0 && normalizedVelocity.y - normalizedPosition.y != 0) {
					events.delete(finalEvent.id);
				}
			} else if (type == EdgeEventsType.Begin) {
				// If we are isolating based on exit events then we will normalize the position of the final event
				const normalizedPosition = NormalizePosition(beginEvent.position, { x: 0.5, y: 0.5 });

				// Then we will compare the normalized position to the normalized velocity. Since this is an enter event we want these to match and thus NOT be 0
				if (normalizedVelocity.x - normalizedPosition.x == 0 || normalizedVelocity.y - normalizedPosition.y == 0) {
					events.delete(beginEvent.id);
				}
			}
		}
	});

	return events;
}

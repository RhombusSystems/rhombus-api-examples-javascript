import { ExitEvent, EdgeEventsType, ExitEventsFromMap } from "../types/events"

import { Configuration } from "@rhombus/API"

import { GetHumanEvents } from "../services/human_events_service"
import { IsolateEdgeEvents } from "./isolators/edge_event_isolator"
import { IsolateVelocities } from "./isolators/velocity_isolator"
import { IsolateEventsFromLength } from "./isolators/event_length_isolator"
import { CollateHumanEvents } from "./services/event_collator"
import { Camera } from "../types/camera"
import { CompareEvents } from "../types/events"

/*
  *
  * @export
  * @method Parses through human events to find exit events
  *
  * @param {Configuration} [configuration] The API configuration to use when making API requests
  * @param {Camera} [camera] The camera to look for human events
  * @param {number} [objectID] The object ID to look for
  * @param {number} [timestamp] The timestamp at which to look for human events
  *
  * @return {Promise<ExitEvent[]>} Returns an array of exit events that match the object ID
  * */
export const DetectionPipeline = async (configuration: Configuration, camera: Camera, objectID: number, timestamp: number): Promise<ExitEvent[]> => {

	// TODO: Make this not hardcoded
	// Get the duration of time in seconds to look for human events. This is by default 10 minutes.
	const duration = 10 * 60;
	// A small offset in seconds is good so that we don't accidentally barely miss the object ID. This is by default 30 seconds
	const offset = 0.5 * 60;

	// Unintentional but works really well (works) 1623884880
	// Sick af because I also didn't even mean to do this (works) 1623945969
	// Super basic example (works) 1623962260
	// This one is somewhat broken, but I won't worry about it (broken) 1623963641
	// Somewhat broken now, need to fix (broken) 1623969300
	// Good one for testing (works) 1623970642
	// Still broken, but less so (broken) 1624314992
	// Kinda works, but still quite buggy (broken) 1624317870
	// Need to fix (broken) 1624398830
	// Go beneath camera (in progress) 1624471346
	// Basically works as expected (works) 1624488420
	// Wow ok didn't even mean to do that (works) 1624553931
	// Demonstration of positioning filter (works, well actually broken but it is intentional behavior) 1624572627

	// Get an array of human events within the timeframe
	const human_events = await GetHumanEvents(configuration, camera, timestamp - offset, duration)

	// Collate the HumanEvents so that we can get an accurate picture of how many different objectIDs were found
	const res = CollateHumanEvents(human_events);

	console.log(res.size + " humans found");

	// Isolate the human events by length
	const isolatedEvents = IsolateEventsFromLength(res);

	console.log(isolatedEvents.size + " were found from length and object IDs");

	// Isolate the human events by edge and then by length 
	const edgeEvents = IsolateEventsFromLength(IsolateEdgeEvents(isolatedEvents));

	console.log(edgeEvents.size + " were found from being close to the edge");

	// Isolate the human events by velocity
	const exitEvents = IsolateVelocities(edgeEvents, EdgeEventsType.End);

	console.log(exitEvents.size + " were found from velocity");

	// Convert our raw map of objectID to HumanEvent[] to an array of ExitEvents
	const events = ExitEventsFromMap(exitEvents);

	// Only include exit events that actually contain our object ID
	events.filter(event => {
		// Loop through all of the events attached to this exit event, and return true if at least one matches our object ID
		for (const humanEvent of event.events) {
			if (humanEvent.id == objectID) return true;
		}

		// If none were found with our objectID, then return false and this ExitEvent will not be included
		return false;
	});

	// Sort all of the events by time
	events.sort(CompareEvents);

	// Sort all of the related events also
	events.forEach(e => e.relatedEvents.sort(CompareEvents));
	return events;
}

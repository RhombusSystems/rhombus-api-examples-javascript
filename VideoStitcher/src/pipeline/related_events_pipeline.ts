import { ExitEvent, EdgeEventsType, EnterEventsFromMap } from "../types/events"
import { Configuration } from "@rhombus/API"
import { GetHumanEvents } from "../services/human_events_service"
import { IsolateVelocities } from "./isolators/velocity_isolator"
import { IsolateEventsFromLength } from "./isolators/event_length_isolator"
import { CollateHumanEvents } from "./services/event_collator"
import { GetValidCameras } from "../rasterization/rasterizer"
import { Camera } from "../types/camera"
import { Environment } from "../environment/environment"

/*
  *
  * @export
  * @method Looks through human events that could be related to our exit event to find a suitable match
  *
  * @param {Configuration} [configuration] The API configuration to use when making API requests
  * @param {Camera} [camera] The camera to look for human events
  * @param {number} [objectID] The object ID to look for
  * @param {number} [timestamp] The timestamp at which to look for human events
  *
  * @return {Promise<ExitEvent[]>} Returns an array of exit events that match the object ID
  * */
export const RelatedEventsPipeline = async (configuration: Configuration, exitEvents: ExitEvent[], cameras: Camera[]): Promise<ExitEvent[]> => {
	for (let event of exitEvents) {
		// TODO: Make the ppm not hardcoded
		// Get a list of valid cameras based on the position of the exit event
		let _cameras: Camera[] = GetValidCameras(cameras, event, 10, Environment.CaptureRadiusMeters);

		console.log("Looking through cameras");
		console.log(_cameras);

		// Get the events
		const events = event.events;

		// Get the startTime
		const startTime = Math.floor(events[events.length - 1].timestamp / 1000);

		// TODO: Make the detection duration not hardcoded
		// Get the duration in seconds of how far in the future to look for related human events
		const detectionDuration = 30;

		// Loop through all of the cameras that are valid
		for (const otherCam of _cameras) {
			// Get the human events and isolate them from length
			const otherHumanEvents = await GetHumanEvents(configuration, otherCam, startTime, detectionDuration);

			// Collate the events and isolate them from length
			const collatedEvents = IsolateEventsFromLength(CollateHumanEvents(otherHumanEvents));

			// Isolate the events based on their velocities
			const velocityEvents = IsolateVelocities(collatedEvents, EdgeEventsType.Begin);

			console.log("Found " + velocityEvents.size + " related events for camera " + otherCam.uuid);

			// Add the related enter events to the exit event
			event.relatedEvents = event.relatedEvents.concat(EnterEventsFromMap(velocityEvents));
		}
	}

	// Return the exit events
	return exitEvents;
}

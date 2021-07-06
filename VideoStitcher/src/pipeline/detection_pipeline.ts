import { ExitEvent, ExitEventsFromMap } from "../types/events"

import { Configuration } from "@rhombus/API"

import { GetHumanEvents } from "../services/human_events_service"
import { DetectEdgeEvents, EdgeEventsType } from "./services/edge_event_detector"
import { IsolateEventsFromObjectID } from "./isolators/object_id_isolator"
import { IsolateVelocities } from "./isolators/velocity_isolator"
import { IsolateEventsFromLength } from "./isolators/event_length_isolator"
import { CollateEvents } from "./services/event_collator"
import { GetCameraList } from "../services/camera_list"
import { SortEvents } from "../services/graph_service"
import { Camera } from "../types/camera"

export const DetectionPipeline = async (configuration: Configuration, camera: Camera, objectID: number, timestamp: number): Promise<ExitEvent[]> => {
	let events: ExitEvent[] = [];

	// for (const camera of cameras) {
	const duration = 10 * 60;
	const offset = 0.5 * 60;
	const currentTime = Math.round(new Date().getTime() / 1000) - duration - offset;
	console.log("Current time " + currentTime);
	console.log(camera.uuid);
	console.log(objectID)

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
	const human_events = await GetHumanEvents(configuration, camera, timestamp - offset, duration)

	const res = CollateEvents(human_events);

	console.log(res.size + " human events found");

	const isolatedEvents = IsolateEventsFromLength(res);

	console.log(isolatedEvents.size + " were found from length and object IDs");

	const edgeEvents = IsolateEventsFromLength(DetectEdgeEvents(isolatedEvents, EdgeEventsType.End));

	console.log(edgeEvents.size + " were found from being close to the edge");

	const exitEvents = IsolateVelocities(edgeEvents, EdgeEventsType.End);

	console.log(exitEvents.size + " were found from velocity");

	const exitEventArray = ExitEventsFromMap(exitEvents);

	exitEventArray.filter((event) => {
		for (const humanEvent of event.events) {
			if (humanEvent.id == objectID) return true;
		}
		return false;
	});

	events = events.concat(exitEventArray);


	events.sort(SortEvents);
	events.forEach(e => e.relatedEvents.sort(SortEvents));
	return events;
}

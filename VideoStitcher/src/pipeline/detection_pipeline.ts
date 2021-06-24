import { ExitEvent, ExitEventsFromMap } from "../types/events"

import { Configuration } from "@rhombus/API"

import { GetHumanEvents } from "../services/human_events_service"
import { DetectEdgeEvents, EdgeEventsType } from "../services/edge_event_detector"
import { IsolateObjectIDEvents } from "../services/object_id_isolator"
import { IsolateVelocities } from "../services/velocity_isolator"
import { IsolateEventsFromLength } from "../services/event_length_isolator"
import { CollateEvents } from "../services/event_collator"
import { GetCameraList } from "../services/camera_list"
import { SortEvents } from "../services/graph_service"

export const DetectionPipeline = async (configuration: Configuration): Promise<ExitEvent[]> => {
	const cameras = await GetCameraList(configuration);

	let events: ExitEvent[] = [];

	for (const camera of cameras) {
		const duration = 2 * 60;
		const offset = 0 * 60;
		const currentTime = Math.round(new Date().getTime() / 1000) - duration - offset;
		console.log("Current time " + currentTime);
		console.log(camera);

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
		// Again didn't mean to lmfao (works) 1624562875
		// Demonstration of positioning filter (works, well actually broken but it is intentional behavior) 1624572627
		const res = CollateEvents(await GetHumanEvents(configuration, camera.uuid, currentTime, duration));

		console.log(res.size + " human events found");

		const isolatedEvents = IsolateEventsFromLength(IsolateObjectIDEvents(res));

		console.log(isolatedEvents.size + " were found from length and object IDs");

		const edgeEvents = IsolateEventsFromLength(DetectEdgeEvents(isolatedEvents, EdgeEventsType.End));

		console.log(edgeEvents.size + " were found from being close to the edge");

		const exitEvents = IsolateVelocities(edgeEvents, EdgeEventsType.End, camera.uuid);

		console.log(exitEvents.size + " were found from velocity");

		events = events.concat(ExitEventsFromMap(exitEvents));

	}

	events.sort(SortEvents);
	events.forEach(e => e.relatedEvents.sort(SortEvents));
	return events;
}

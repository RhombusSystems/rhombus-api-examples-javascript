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
		const duration = 5 * 60;
		const offset = 0 * 60;
		const currentTime = Math.round(new Date().getTime() / 1000) - duration - offset;
		console.log("Current time " + currentTime);
		console.log(camera);

		// Very very very good timestamp 1623884880
		// I'm so confused 1623945969
		// Not working because multiple people
		// Almost there 1623962260
		// IT FUCKING WORKS 1623963641
		// Good one for testing 1623970642
		// Very complicated one 1624314992
		// Works perfectly 1624317870
		// 1624396373
		const res = CollateEvents(await GetHumanEvents(configuration, camera, 1624398830, duration));

		console.log(res.size + " human events found");

		const isolatedEvents = IsolateEventsFromLength(IsolateObjectIDEvents(res));

		console.log(isolatedEvents.size + " were found from length and object IDs");

		const edgeEvents = IsolateEventsFromLength(DetectEdgeEvents(isolatedEvents, EdgeEventsType.End));

		console.log(edgeEvents.size + " were found from being close to the edge");

		const exitEvents = IsolateVelocities(edgeEvents, EdgeEventsType.End, camera);

		console.log(exitEvents.size + " were found from velocity");

		events = events.concat(ExitEventsFromMap(exitEvents));

	}

	events.sort(SortEvents);
	events.forEach(e => e.relatedEvents.sort(SortEvents));
	return events;
}

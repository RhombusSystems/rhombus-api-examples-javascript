
import { HumanEvent } from "../types/human_event"

import { Configuration } from "@rhombus/API"

import { GetHumanEvents } from "../services/human_events_service"
import { DetectEdgeEvents, EdgeEventsType } from "../services/edge_event_detector"
import { IsolateObjectIDEvents } from "../services/object_id_isolator"
import { IsolateVelocities } from "../services/velocity_isolator"
import { IsolateEventsFromLength } from "../services/event_length_isolator"
import { CollateEvents } from "../services/event_collator"

export const DetectionPipeline = async (configuration: Configuration, camUUID: string): Promise<Map<number, HumanEvent[]>> => {
	const duration = 10 * 60;
	const offset = 0 * 60;
	const currentTime = Math.round(new Date().getTime() / 1000) - duration - offset;
	console.log("Current time " + currentTime);

	// Very very very good timestamp 1623884880
	// I'm so confused 1623945969
	// Not working because multiple people
	// Almost there 1623962260
	// IT FUCKING WORKS 1623963641
	const res = CollateEvents(await GetHumanEvents(configuration, camUUID, 1623970642, duration));

	console.log(res.size + " human events found");

	const isolatedEvents = IsolateEventsFromLength(IsolateObjectIDEvents(res));

	console.log(isolatedEvents.size + " were found from length and object IDs");

	const edgeEvents = IsolateEventsFromLength(DetectEdgeEvents(isolatedEvents, EdgeEventsType.End));

	console.log(edgeEvents.size + " were found from being close to the edge");

	const exitEvents = IsolateVelocities(edgeEvents, EdgeEventsType.End, camUUID);

	console.log(exitEvents.size + " were found from velocity");

	return exitEvents;
}

import { ExitEvent, EnterEventsFromMap } from "../types/events"
import { Configuration } from "@rhombus/API"
import { GetHumanEvents } from "../services/human_events_service"
import { IsolateEdgeEvents, EdgeEventsType } from "./isolators/edge_event_isolator"
import { IsolateEventsFromObjectID } from "./isolators/object_id_isolator"
import { IsolateVelocities } from "./isolators/velocity_isolator"
import { IsolateEventsFromLength } from "./isolators/event_length_isolator"
import { CollateHumanEvents } from "./services/event_collator"
import { GetValidCameras } from "../rasterization/rasterizer"
import { Camera } from "../types/camera"


export const RelatedEventsPipeline = async (configuration: Configuration, exitEvents: ExitEvent[], cameras: Camera[]): Promise<ExitEvent[]> => {
	for (let event of exitEvents) {
		let _cameras: Camera[] = GetValidCameras(cameras, event, 10, 300);
		console.log("Looking through cameras");
		console.log(_cameras);
		const events = event.events;
		const startTime = Math.floor(events[events.length - 1].timestamp / 1000);
		const detectionDuration = 30;

		for (const otherCam of _cameras) {
			const otherHumanEvents = IsolateEventsFromLength(await GetHumanEvents(configuration, otherCam, startTime, detectionDuration));
			const collatedEvents = IsolateEventsFromLength(IsolateEventsFromObjectID(CollateHumanEvents(otherHumanEvents)));
			const edgeEvents = IsolateEventsFromLength(IsolateEdgeEvents(collatedEvents, EdgeEventsType.Begin));
			const velocityEvents = IsolateVelocities(edgeEvents, EdgeEventsType.Begin);
			console.log("other events " + otherCam.uuid + ", " + velocityEvents.size);

			event.relatedEvents = event.relatedEvents.concat(EnterEventsFromMap(velocityEvents));
		}
	}

	return exitEvents;
}

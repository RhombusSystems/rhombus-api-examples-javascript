import { ExitEvent, EnterEventsFromMap } from "../types/events"
import { Configuration } from "@rhombus/API"
import { GetHumanEvents } from "../services/human_events_service"
import { DetectEdgeEvents, EdgeEventsType } from "../services/edge_event_detector"
import { IsolateObjectIDEvents } from "../services/object_id_isolator"
import { IsolateVelocities } from "../services/velocity_isolator"
import { IsolateEventsFromLength } from "../services/event_length_isolator"
import { CollateEvents } from "../services/event_collator"
// import { IsolateCameras } from "../services/camera_position_isolator"
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
			const otherHumanEvents = IsolateEventsFromLength(await GetHumanEvents(configuration, otherCam.uuid, startTime, detectionDuration));
			const collatedEvents = IsolateEventsFromLength(IsolateObjectIDEvents(CollateEvents(otherHumanEvents)));
			const edgeEvents = IsolateEventsFromLength(DetectEdgeEvents(collatedEvents, EdgeEventsType.Begin));
			const velocityEvents = IsolateVelocities(edgeEvents, EdgeEventsType.Begin, otherCam.uuid);
			console.log("other events " + otherCam.uuid + ", " + velocityEvents.size);

			event.relatedEvents = event.relatedEvents.concat(EnterEventsFromMap(velocityEvents));
		}
	}

	return exitEvents;
}

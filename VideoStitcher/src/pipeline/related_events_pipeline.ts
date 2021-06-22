import { ExitEvent, EnterEventsFromMap } from "../types/events"
import { Configuration } from "@rhombus/API"
import { GetCameraList } from "../services/camera_list"
import { GetHumanEvents } from "../services/human_events_service"
import { DetectEdgeEvents, EdgeEventsType } from "../services/edge_event_detector"
import { IsolateObjectIDEvents } from "../services/object_id_isolator"
import { IsolateVelocities } from "../services/velocity_isolator"
import { IsolateEventsFromLength } from "../services/event_length_isolator"
import { CollateEvents } from "../services/event_collator"


export const RelatedEventsPipeline = async (configuration: Configuration, exitEvents: ExitEvent[]): Promise<ExitEvent[]> => {
	const cameraUUIDs = await GetCameraList(configuration);

	for (let event of exitEvents) {
		let cameras: string[] = [];
		cameraUUIDs.forEach(camera => {
			if (camera != event.events[0].camUUID)
				cameras.push(camera);
		})
		const events = event.events;
		const startTime = Math.floor(events[events.length - 1].timestamp / 1000);
		const detectionDuration = 30;

		for (const otherCamUUID of cameras) {
			const otherHumanEvents = IsolateEventsFromLength(await GetHumanEvents(configuration, otherCamUUID, startTime, detectionDuration));
			const collatedEvents = IsolateEventsFromLength(IsolateObjectIDEvents(CollateEvents(otherHumanEvents)));
			const edgeEvents = IsolateEventsFromLength(DetectEdgeEvents(collatedEvents, EdgeEventsType.Begin));
			const velocityEvents = IsolateVelocities(edgeEvents, EdgeEventsType.Begin, otherCamUUID);
			console.log("other events " + otherCamUUID + ", " + velocityEvents.size);

			event.relatedEvents = event.relatedEvents.concat(EnterEventsFromMap(velocityEvents));
		}
	}

	// for (let i = exitEvents.length - 1; i >= 0; i--) {
	//         const event = exitEvents[i];
	//         if (event.relatedEvents.length == 0) exitEvents.splice(i, 1);
	// }


	return exitEvents;
}

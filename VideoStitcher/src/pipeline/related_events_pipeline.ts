
import { ConvertMapToList, PlotGraphMessage } from "../services/graph_service"
import { HumanEvent } from "../types/human_event"
import { Configuration } from "@rhombus/API"
import { GetCameraList } from "../services/camera_list"
import { GetHumanEvents } from "../services/human_events_service"
import { DetectEdgeEvents, EdgeEventsType } from "../services/edge_event_detector"
import { IsolateObjectIDEvents } from "../services/object_id_isolator"
import { IsolateVelocities } from "../services/velocity_isolator"
import { IsolateEventsFromLength } from "../services/event_length_isolator"

export const RelatedEventsPipeline = async (configuration: Configuration, camUUID: string, exitEvents: Map<number, HumanEvent[]>): Promise<PlotGraphMessage> => {
	const cameraUUIDs = await GetCameraList(configuration, camUUID);

	let events: HumanEvent[] = [];
	exitEvents.forEach(list => events = events.concat(list));

	let graphMsg: PlotGraphMessage = {
		events: events,
		relatedEvents: [],
		id: new Date().getTime(),
	};

	exitEvents.forEach(async (events: HumanEvent[]) => {
		const startTime = Math.floor(events[events.length - 1].timestamp / 1000);
		const detectionDuration = 30;

		console.log(startTime);

		for (const otherCamUUID of cameraUUIDs) {
			const otherHumanEvents = await GetHumanEvents(configuration, otherCamUUID, startTime, detectionDuration);
			const collatedEvents = IsolateEventsFromLength(IsolateObjectIDEvents(otherHumanEvents));
			const edgeEvents = IsolateEventsFromLength(DetectEdgeEvents(collatedEvents, EdgeEventsType.Begin));
			const velocityEvents = IsolateVelocities(edgeEvents, EdgeEventsType.Begin, otherCamUUID);

			graphMsg.relatedEvents = graphMsg.relatedEvents.concat(ConvertMapToList(velocityEvents));
		}
	});
	return graphMsg;
}

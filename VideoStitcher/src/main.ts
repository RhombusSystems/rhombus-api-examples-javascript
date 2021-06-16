/*
  *
  * @import necessary services
  * */
import { FetchMediaURIs } from "./services/media_uri_fetcher"
import { FetchVOD } from "./services/vod_fetcher"
import { RhombusFinalizer } from "./services/rhombus_finalizer"
import { Cleanup } from "./services/cleanup"
import { GetHumanEvents } from "./services/human_events_service"
import { DetectEdgeEvents } from "./services/edge_event_detector"
import { IsolateObjectIDEvents } from "./services/object_id_isolator"
import { IsolateVelocities } from "./services/velocity_isolator"
import { IsolateEventsFromLength } from "./services/event_length_isolator"

/*
  *
  * @import Connection URI Type for picking out the correct URI
  * */
import { ConnectionType } from "./types/connection_type"

import { HumanEvent } from "./types/human_event"

/*
  *
  * @import Rhombus API configuration which will hold our API key
  * */
import { Configuration } from "@rhombus/API"

import { IOServer } from "./server/server"


export const DetectionPipeline = async (configuration: Configuration, camUUID: string, type: ConnectionType): Promise<Map<number, HumanEvent[]>> => {
	const duration = 10 * 60;
	const offset = 2 * 60;
	const currentTime = Math.round(new Date().getTime() / 1000) - duration - offset;

	const res = await GetHumanEvents(configuration, camUUID, currentTime, duration);

	console.log(res.size + " human events found");

	console.log(res);

	const isolatedEvents = IsolateEventsFromLength(IsolateObjectIDEvents(res));

	console.log(isolatedEvents.size + " were found from length and object IDs");

	const edgeEvents = IsolateEventsFromLength(DetectEdgeEvents(isolatedEvents));

	console.log(edgeEvents.size + " were found from being close to the edge");

	const exitEvents = IsolateVelocities(edgeEvents);

	console.log(exitEvents.size + " were found from velocity");

	return exitEvents;
}

/*
  *
  * Entry point 
  * @param {string} [apiKey] sets the API key that will be used throughout the application
  *
  * */
export const main = async (apiKey: string, camUUID: string, type: ConnectionType) => {
	IOServer.StartServer();


	// Show a warning if running in WAN mode, because this is not recommended
	if (type == ConnectionType.WAN) {
		// Print in red
		console.log("\x1b[31m%s\x1b[0m", "Running in WAN mode! This is not recommended if it can be avoided");
	}

	// Create a `Configuration` which will use our API key, this config will be used in all further API calls
	const configuration = new Configuration({ apiKey: apiKey });

	let res = await DetectionPipeline(configuration, camUUID, type);

	setInterval(() => {
		IOServer.Emit("CameraUUID", camUUID);
		res.forEach(async (events) => {
			IOServer.Emit("Plot-Graph", events);
		});
	}, 1000);

	setInterval(async () => {
		res = await DetectionPipeline(configuration, camUUID, type);
		if (res.size > 0) {
		}
	}, 10000);
}

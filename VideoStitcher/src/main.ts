/*
  *
  * @import necessary services
  * */
import { SendGraph, PlotGraphMessage } from "./services/graph_service"

import { DetectionPipeline } from "./pipeline/detection_pipeline"
import { RelatedEventsPipeline } from "./pipeline/related_events_pipeline"
import { RelatedEventsIsolatorPipeline } from "./pipeline/related_event_isolator_pipeline"
import { ClipCombinerPipeline } from "./pipeline/clip_combiner_pipeline"

/*
  *
  * @import Connection URI Type for picking out the correct URI
  * */
import { ConnectionType } from "./types/connection_type"


/*
  *
  * @import Rhombus API configuration which will hold our API key
  * */
import { Configuration } from "@rhombus/API"

import { IOServer } from "./server/server"


/*
  *
  * Entry point 
  * @param {string} [apiKey] sets the API key that will be used throughout the application
  *
  * */
export const main = async (apiKey: string, type: ConnectionType) => {
	IOServer.StartServer();


	// Show a warning if running in WAN mode, because this is not recommended
	if (type == ConnectionType.WAN) {
		// Print in red
		console.log("\x1b[31m%s\x1b[0m", "Running in WAN mode! This is not recommended if it can be avoided");
	}

	// Create a `Configuration` which will use our API key, this config will be used in all further API calls
	const configuration = new Configuration({ apiKey: apiKey });

	let res = undefined;

	let msg: PlotGraphMessage = undefined;


	setInterval(() => SendGraph(msg), 1000);

	// setInterval(async () => {
	res = await DetectionPipeline(configuration);
	if (res.length > 0) {
		const events = await RelatedEventsPipeline(configuration, res);
		const relatedEventsRes = RelatedEventsIsolatorPipeline(events);
		msg = relatedEventsRes.msg;
		SendGraph(msg);
		console.log(msg);
		if (relatedEventsRes.events.length > 0) {
			for (const event of relatedEventsRes.events) {
				if (event.followingEvent != undefined) {
					console.log("Combining clips");
					ClipCombinerPipeline(configuration, type, event);
				}
			}
		}
		// console.log(JSON.stringify(msg, null, 2));
	}
	// }, 3 * 60 * 1000);
}

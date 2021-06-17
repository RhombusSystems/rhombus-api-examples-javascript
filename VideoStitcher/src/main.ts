/*
  *
  * @import necessary services
  * */
import { SendGraph } from "./services/graph_service"

import { DetectionPipeline } from "./pipeline/detection_pipeline"
import { RelatedEventsPipeline } from "./pipeline/related_events_pipeline"

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
export const main = async (apiKey: string, camUUID: string, type: ConnectionType) => {
	IOServer.StartServer();


	// Show a warning if running in WAN mode, because this is not recommended
	if (type == ConnectionType.WAN) {
		// Print in red
		console.log("\x1b[31m%s\x1b[0m", "Running in WAN mode! This is not recommended if it can be avoided");
	}

	// Create a `Configuration` which will use our API key, this config will be used in all further API calls
	const configuration = new Configuration({ apiKey: apiKey });

	let res = await DetectionPipeline(configuration, camUUID);

	let msg = await RelatedEventsPipeline(configuration, camUUID, res);

	setInterval(() => SendGraph(msg), 1000);

	setInterval(async () => {
		res = await DetectionPipeline(configuration, camUUID);
		if (res.size > 0) {
			msg = await RelatedEventsPipeline(configuration, camUUID, res);
		}
	}, 10000);
}

import { HumanEvent } from "../types/human_event"
import { FetchVOD } from "../services/vod_fetcher"
import { FetchMediaURIs } from "../services/media_uri_fetcher"

import { Configuration } from "@rhombus/API"

import { ConnectionType } from "../types/connection_type"

/*
  *
  * @import We are going to call FFMpeg to generate our frame JPEGs, so we will need both ffmpeg and the child process to execute our commands
  * */
import * as pathToFFMpeg from "ffmpeg-static"
import { exec } from 'child_process'

import * as fs from "fs";

/*
  *
  * @import We also will import util so that we can use exec as an async/await function
  * */
import * as util from "util"
const run = util.promisify(exec);

export const ClipCombinerPipeline = async (config: Configuration, type: ConnectionType, events: HumanEvent[][]): Promise<void> => {

	let i = 0;
	let dir = undefined;
	let previousEndTime = -1
	for (const eventGroup of events) {
		console.log(eventGroup[0].timestamp);
		if (dir == undefined) {
			dir = "res/" + eventGroup[0].timestamp + "/";
			if (fs.existsSync(dir)) return;
		}
		const startTime = previousEndTime != -1 ? previousEndTime : Math.floor(eventGroup[0].timestamp / 1000) - 4;
		const endTime = Math.ceil(eventGroup[eventGroup.length - 1].timestamp / 1000);
		previousEndTime = endTime;
		const camUUID = eventGroup[0].camUUID;
		const uri_res = await FetchMediaURIs(config, camUUID, 60, type);
		await FetchVOD(config, uri_res.federatedToken, uri_res.uri, type, dir, i.toString() + ".mp4", startTime, endTime);

		const vidlist = dir + "vidlist.txt";
		const data = "file '" + i.toString() + ".mp4'\n";
		if (i == 0) {
			fs.writeFileSync(vidlist, data);
		} else {
			fs.appendFileSync(vidlist, data)
		}
		i++;

	}

	try {
		await run("ffmpeg -f concat -safe 0 -i " + dir + "vidlist.txt -c copy " + dir + "output.mp4");
	} catch (e) {
		console.log("Fuck something went wrong i hate this bug");
		fs.rmdirSync(dir, { recursive: true });
		return ClipCombinerPipeline(config, type, events);
	}
	console.log("Output stitched video");
}

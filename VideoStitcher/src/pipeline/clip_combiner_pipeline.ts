import { HumanEvent } from "../types/human_event"
import { FinalizedEvent } from "../types/events"
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

export const DownloadFinalizedEventRecursive = async (config: Configuration, type: ConnectionType, event: FinalizedEvent, dir: string, index: number = 0): Promise<void> => {
	console.log(event.startTime);
	const startTime = Math.floor(event.startTime / 1000 - (index == 0 ? 4 : 1.5));
	const endTime = Math.ceil(event.endTime / 1000 + (event.followingEvent == undefined ? 4 : 0));
	const camUUID = event.data[0].camUUID;
	const uri_res = await FetchMediaURIs(config, camUUID, 60, type);
	await FetchVOD(config, uri_res.federatedToken, uri_res.uri, type, dir, index.toString() + ".mp4", startTime, endTime);

	const vidlist = dir + "vidlist.txt";
	const data = "file '" + index.toString() + ".mp4'\n";
	if (index == 0) {
		fs.writeFileSync(vidlist, data);
	} else {
		fs.appendFileSync(vidlist, data)
	}
	if (event.followingEvent != undefined) {
		return DownloadFinalizedEventRecursive(config, type, event.followingEvent, dir, ++index);
	}
}

export const ClipCombinerPipeline = async (config: Configuration, type: ConnectionType, event: FinalizedEvent): Promise<void> => {
	let dir = "res/" + event.startTime + "/";
	console.log(dir);
	if (fs.existsSync(dir)) return;
	fs.mkdirSync(dir);

	await DownloadFinalizedEventRecursive(config, type, event, dir)

	try {
		await run(pathToFFMpeg + " -f concat -safe 0 -i " + dir + "vidlist.txt -c copy " + dir + "output.mp4");
	} catch (e) {
		console.log("Fuck something went wrong i hate this bug");
		fs.rmdirSync(dir, { recursive: true });
		return ClipCombinerPipeline(config, type, event);
	}

	console.log("Output stitched video");
}

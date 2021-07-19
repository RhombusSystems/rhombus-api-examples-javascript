import { Configuration, CameraWebserviceApi, OrgWebserviceApi } from "@rhombus/API"
import * as path from "path"
import * as fs from "fs"
/*
  *
  * @import Import axios to download the vod
  * */
const axios = require('axios').default;

// Necessary headers that should be used for every POST request
const RHOMBUS_HEADERS = { headers: { "x-auth-scheme": "api-token" } };

/*
  *
  * @enum Enum to declare whether to use WAN or LAN
  * */
enum ConnectionType {
	WAN,

	// NOTE: It is almost always recommended to use LAN over WAN because it will be faster and use less resources however if you are running this node server 
	// on a different connection than your camera for whatever reason then you must use WAN
	LAN
};

/*
  *
  * @enum Enum to declare the debug level
  * */
enum LogLevel {
	INFO, // INFO is the default log level
	DEBUG,
};


/*
  *
  * @method Get the log level of the environment. If not set in the .env file, it will return LogLevel.INFO
  * @return {LogLevel} Returns the log level enum of the program.
  * */
const getLogLevel = (): LogLevel => {
	if (process.env.DEBUG != undefined) {
		return LogLevel.DEBUG;
	}
	return LogLevel.INFO;
}

/*
  *
  * @method Log a debug message
  * @param {string} [message] The message to log
  * */
const debugLog = (message: string): void => {
	if (getLogLevel() == LogLevel.DEBUG) {
		console.log(message);
	}
}

/*
  *
  * @method Log a warning message
  * @param {string} [message] The message to log
  * */
const warnLog = (message: string): void => {
	console.log("\x1b[33m%s\x1b[0m", message);
}

/*
  *
  * @method Log an error message
  * @param {string} [message] The message to log
  * */
const errorLog = (message: string): void => {
	console.log("\x1b[31m%s\x1b[0m", message);
}

/*
  *
  * @method Log an info message
  * @param {string} [message] The message to log
  * */
const infoLog = (message: string): void => {
	console.log(message);
}

/*
  *
  * @method Get the connectionType of the environment. If not set in the .env file, it will return ConnectionType.LAN
  * @return {ConnectionType} Returns the connection type enum of the program.
  * */
const getConnectionType = (): ConnectionType => {
	if (process.env.CONNECTION_TYPE == "WAN") {
		warnLog("Running in WAN mode! This is not recommended if it can be avoided");
		return ConnectionType.WAN;
	}
	return ConnectionType.LAN;
}

/*
  *
  * @export 
  * @method Save an m4v or mp4 url to the specified output file
  *
  * @param {string} [path] the path of the output file
  * @param {string} [uri] the url from which to download
  * @param {boolean} [write] whether or not to write the file or append it to an existing file, by default it is false which is append
  * */
export const saveClip = async (path: string, uri: string, write: boolean = false) => {
	// Download the file from the uri
	const response = await axios.get(uri, { responseType: 'arraybuffer' })

	// Get the buffer
	const buffer = Buffer.from(response.data, "utf-8");

	// If we should write vs append to an existing file
	if (write) {
		// If the path already exists and we need to write, then delete the existing file
		if (fs.existsSync(path)) {
			fs.unlinkSync(path);
		}

		// Write the file
		fs.writeFileSync(path, buffer)
	} else {
		// Append the buffer to the existing file
		fs.appendFileSync(path, buffer);
	}
}

/*
  *
  * @method Entry point of the program
  * @param {string} [apiKey] The API Key to make RhombusAPI requests.
  * @param {string} [outputPath] The output path of the mp4.
  * @param {string} [cameraUUID] The camera UUID to download the footage from
  * @param {number | undefined} [startTime] The time in seconds since epoch at which to start downloading footage from.
  * @param {number | undefined} [duration] The duration in seconds of how long of a clip to download.
  * */
const main = async (apiKey: string | undefined, outputPath: string | undefined, cameraUUID: string | undefined, startTime: number | undefined, duration: number | undefined): Promise<void> => {
	// Get our environment variables
	if (apiKey == undefined) {
		infoLog("Please specify an API Key in the .env file! See the README.md for more info");
		return;
	}

	if (outputPath == undefined) {
		infoLog("Please specify an output path in the .env file! See the README.md for more info");
		return;
	}

	if (cameraUUID == undefined) {
		infoLog("Please specify a camera UUID in the .env file! See the README.md for more info");
		return;
	}

	if (duration == undefined || isNaN(duration)) {
		// 1 hour
		duration = 1 * 60 * 60
	}

	if (startTime == undefined || isNaN(startTime)) {
		// The current time - the duration
		startTime = Math.round(new Date().getTime() / 1000) - duration;
	}


	const connectionType = getConnectionType();

	// Create an API configuration which will be used to make requests
	const configuration = new Configuration({ apiKey: apiKey });

	// Get the output directory
	const outputDirectory = path.dirname(outputPath);

	// Create the output directory
	fs.mkdirSync(outputDirectory, { recursive: true });

	// If the output CSV already exists, then we will delete it
	if (fs.existsSync(outputPath)) {
		fs.unlinkSync(outputPath);
	}

	// Get a federated session token for media that lasts 1 hour
	let federatedSessionToken: string;
	try {
		const orgAPI = new OrgWebserviceApi(configuration);
		const orgRes = await orgAPI.generateFederatedSessionToken({ durationSec: 60 * 60 }, RHOMBUS_HEADERS);
		if (orgRes.federatedSessionToken == undefined) {
			errorLog("Failed to get federated session token.");
			return;
		}

		federatedSessionToken = orgRes.federatedSessionToken;

		debugLog("Federated session token response: " + JSON.stringify(orgRes, null, 2));
	} catch (e) {
		errorLog("Failed to get federated session token " + e);
		return;
	}

	// Get camera media uris
	let mpdUriTemplate: string;
	try {

		const cameraAPI = new CameraWebserviceApi(configuration);
		const mediaRes = await cameraAPI.getMediaUris({ cameraUuid: cameraUUID }, RHOMBUS_HEADERS);

		debugLog("Camera media uri response: " + JSON.stringify(mediaRes, null, 2));

		if (mediaRes.lanVodMpdUrisTemplates == undefined) {
			errorLog("Failed to get media URIs");
			return;
		}

		mpdUriTemplate = mediaRes.lanVodMpdUrisTemplates[0];

		debugLog("Raw mpd uri template: " + mpdUriTemplate);
	} catch (e) {
		errorLog("Failed to get media URIs " + e);
		return;
	}


	// We need to replace {START_TIME} and {DURATION} with the correct values in order to properly download the file
	let mpdUri = mpdUriTemplate.replace("{START_TIME}", startTime.toString()).replace("{DURATION}", duration.toString());

	debugLog("Mpd uri: " + mpdUri);

	// This will change depend on whether we are using WAN or LAN
	const mpdName = connectionType == ConnectionType.LAN ? "clip.mpd" : "file.mpd";

	// These headers are necessary for almost all Rhombus requests, URL or API regardless
	axios.defaults.headers.common['x-auth-apikey'] = apiKey;
	axios.defaults.headers.common['x-auth-scheme'] = 'api-token';
	axios.defaults.headers.common['Accept'] = 'application/json';
	axios.defaults.headers.common['Content-Type'] = 'application/json';

	// The federated token is set as a cookie. Without this we would be unable to download the files from Rhombus
	axios.defaults.headers.common['Cookie'] = 'RSESSIONID=RFT:' + federatedSessionToken;

	// Because our URI is an mpd, we need to get each of the segments. The seg_init.mp4 is the first of these. 
	// Just replace clip.mpd at the end of the URL with seg_init.mp4 
	// This also needs to be written since this is the first of our segments
	const initSegUri = mpdUri.replace(mpdName, "seg_init.mp4");
	debugLog("Init segment uri: " + initSegUri);
	await saveClip(outputPath, initSegUri, true);

	// Each of the segments is 2 seconds long, so the number of segments is duration/2
	for (let i = 0; i < duration / 2; i++) {
		// The URI of all subsequent segments will replace clip.mpd with seg_<index>.m4v
		// These files will need to be appended to our existing clip.mp4 in disk
		const uri = mpdUri.replace(mpdName, "seg_" + i + ".m4v");
		await saveClip(outputPath, uri);
		debugLog("Saved segment: " + uri)
	}

	infoLog("Succesfully downloaded video.");
}

// Get the API Key from the environment, for more info see https://apidocs.rhombussystems.com/reference#introduction
//
// Set this by creating a ".env" file in the root source directory with the contents: API_KEY=<YOUR API KEY HERE>
// Example: API_KEY=Rh0MbU$-iS-AwEs0M3
require('dotenv').config()
main(process.env.API_KEY, process.env.OUTPUT, process.env.CAMERA_UUID, Number(process.env.START_TIME), Number(process.env.DURATION));

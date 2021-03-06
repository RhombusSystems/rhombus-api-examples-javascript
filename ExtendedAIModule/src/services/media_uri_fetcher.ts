/**********************************************************************************/
/* Copyright (c) 2021 Rhombus Systems 						  */
/* 										  */
/* Permission is hereby granted, free of charge, to any person obtaining a copy   */
/* of this software and associated documentation files (the "Software"), to deal  */
/* in the Software without restriction, including without limitation the rights   */
/* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell      */
/* copies of the Software, and to permit persons to whom the Software is          */
/* furnished to do so, subject to the following conditions: 			  */
/* 										  */
/* The above copyright notice and this permission notice shall be included in all */
/* copies or substantial portions of the Software.  				  */
/* 										  */
/* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR     */
/* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,       */
/* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE    */
/* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER         */
/* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  */
/* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  */
/* SOFTWARE. 									  */
/**********************************************************************************/

/*
  *
  * @import Rhombus APIs and configuration. We also need RHOMBUS_HEADERS to send requests
  * */
import { Configuration, CameraWebserviceApi, OrgWebserviceApi } from "@rhombus/API"
import { RHOMBUS_HEADERS } from "../utils/headers"

/*
  *
  * @import Connection URI Type for picking out the correct URI
  * */
import { ConnectionType } from "../types/connection_type"

/*
  *
  * @export
  * @interface Result after fetching the MediaURIs
  * */
export interface MediaURIResult {
	/*
	  *
	  * @type {string} the lan URI of the vod. This remains constant for each camera
	  * @memberof MediaURIResult
	  * */
	uri: string;
	/*
	  *
	  * @types {string} the token that is needed to download the VOD mp4
	  * @memberof MediaURIResult
	  * */
	federatedToken: string;
};


/*
  *
  * @export
  * @method Get the lan URI of the camera and generate a federatedToken to download the VOD
  *
  * @param {Configuration} [config] The API configuration for sending requests to Rhombus
  * @param {string} [camUUID] The UUID of the camera to get info for
  * @param {number} [duration] How long the federated token should last in seconds
  * @param {URIType} [type] Whether to use LAN or WAN for the connection, by default LAN and unless you are on a different connection, you should really just use LAN
  *
  *
  * @return {Promise<MediaURIResult>} Returns the lan URI of the vod and the generated federated token
  * */
export const FetchMediaURIs = async (config: Configuration, camUUID: string, duration: number, type: ConnectionType = ConnectionType.LAN): Promise<MediaURIResult> => {
	// Create a new instance of the Camera API for us to use	
	let camAPI: CameraWebserviceApi;
	// Use the configuration which has our Rhombus API Key
	camAPI = new CameraWebserviceApi(config);

	// Request from Rhombus the media URIs of our camera
	// NOTE: It is necessary to use the RHOMBUS_HEADERS otherwise you will receive a 401 Unauthorized error
	const mediaURIRes = await camAPI.getMediaUris({ cameraUuid: camUUID }, RHOMBUS_HEADERS);

	// Create a new instance of the ORG API to get the federated token
	let orgAPI: OrgWebserviceApi;
	// Use the configuration which has our Rhombus API Key
	orgAPI = new OrgWebserviceApi(config);

	// NOTE: It is necessary to use the RHOMBUS_HEADERS otherwise you will receive a 401 Unauthorized error
	const federatedTokenRes = await orgAPI.generateFederatedSessionToken({ durationSec: duration }, RHOMBUS_HEADERS);

	// Return our results
	return {
		// It is best to use the lanVod as that will be the fastest
		uri: type == ConnectionType.LAN ? mediaURIRes.lanVodMpdUrisTemplates[0] : mediaURIRes.wanVodMpdUriTemplate,
		federatedToken: federatedTokenRes.federatedSessionToken,
	};

}

import { RHOMBUS_HEADERS } from "../utils/headers"

import { Configuration, CameraWebserviceApi } from "@rhombus/API"


export const GetCameraList = async (configuration: Configuration, excludedUUID: string): Promise<string[]> => {
	let api: CameraWebserviceApi;
	api = new CameraWebserviceApi(configuration);
	const res = await api.getMinimalList({}, RHOMBUS_HEADERS);
	let cameraUUIDs: string[] = []
	res.cameras.forEach(camera => { if (camera.uuid != excludedUUID) cameraUUIDs.push(camera.uuid) });
	return cameraUUIDs;
}

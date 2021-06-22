import { RHOMBUS_HEADERS } from "../utils/headers"

import { Configuration, CameraWebserviceApi } from "@rhombus/API"


export const GetCameraList = async (configuration: Configuration): Promise<string[]> => {
	let api: CameraWebserviceApi;
	api = new CameraWebserviceApi(configuration);
	const res = await api.getMinimalList({}, RHOMBUS_HEADERS);
	return res.cameras.map(camera => camera.uuid);
}

import { RHOMBUS_HEADERS } from "../utils/headers"

import { Configuration, CameraWebserviceApi } from "@rhombus/API"
import { Camera } from "../types/camera";


export const GetCameraList = async (configuration: Configuration): Promise<Camera[]> => {
	let api: CameraWebserviceApi;
	api = new CameraWebserviceApi(configuration);
	const res = await api.getMinimalCameraStateList({}, RHOMBUS_HEADERS);
	return res.cameraStates.map(camera => <Camera>{
		uuid: camera.uuid,
    	rotationRadians: camera.directionRadians,
    	location: {x: camera.latitude, y: camera.longitude},
	});
}

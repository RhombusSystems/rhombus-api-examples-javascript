import { RHOMBUS_HEADERS } from "../utils/headers"

import { Configuration, CameraWebserviceApi } from "@rhombus/API"
import { Camera } from "../types/camera";
import { DegreesToRadians, ConvertRhombusAngle } from "../utils/unit_circle"


export const GetCameraList = async (configuration: Configuration): Promise<Camera[]> => {
	let api: CameraWebserviceApi;
	api = new CameraWebserviceApi(configuration);
	const res = await api.getMinimalCameraStateList({}, RHOMBUS_HEADERS);
	return res.cameraStates.map(camera => <Camera>{
		uuid: camera.uuid,
		rotationRadians: ConvertRhombusAngle(camera.directionRadians),
		location: { x: camera.latitude, y: camera.longitude },
		FOV: DegreesToRadians(96),
		viewDistance: 20.72,
	});
}

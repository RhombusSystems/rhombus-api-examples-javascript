import { RHOMBUS_HEADERS } from "../utils/headers"

import { Configuration, CameraWebserviceApi } from "@rhombus/API"
import { Camera } from "../types/camera";
import { DegreesToRadians, ConvertRhombusAngle } from "../utils/math"
import { GetCameraSpecs } from "../utils/rhombus_camera_info"

/*
  *
  * @export
  * @method Gets the list of Rhombus Systems Cameras
  *
  * @param {Configuration} [configuration] The API configuration to use when making API requests
  *
  * @return {Promise<Camera[]>} Returns the list of cameras
  * */
export const GetCameraList = async (configuration: Configuration): Promise<Camera[]> => {
	// Create the api
	let api: CameraWebserviceApi;
	api = new CameraWebserviceApi(configuration);

	// Send the request to Rhombus to get the camera state list
	const res = await api.getMinimalCameraStateList({}, RHOMBUS_HEADERS);
	res.cameraStates = res.cameraStates.filter(element => element.latitude != undefined && element.longitude != undefined && element.directionRadians);


	// Return the result but mapped to our own camera interface
	return res.cameraStates.map(camera => <Camera>{
		uuid: camera.uuid,
		// We will want to convert the Rhombus radians angle to our own coordinate space
		rotationRadians: ConvertRhombusAngle(camera.directionRadians),
		location: { x: camera.latitude, y: camera.longitude },
		FOV: DegreesToRadians(GetCameraSpecs(camera.hwVariation).FOV),
		viewDistance: GetCameraSpecs(camera.hwVariation).viewDistance,
	});
}

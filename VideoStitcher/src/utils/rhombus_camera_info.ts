import { FeetToMeters } from "./utils"
import { HardwareVariationEnum } from "@rhombus/API"
/*
  *
  * @export
  * @interface RhombusCameraSpecs
  * */
export interface RhombusCameraSpecs {
	/*
	  * @type {number} The field of view of the camera.
	  * @memberof RhombusCameraSpecs
	  * */
	FOV: number;

	/*
	  * @type {number} The view distance of humans in meters of the camera.
	  * @memberof RhombusCameraSpecs
	  * */
	viewDistance: number;
};

/*
  *
  * @export
  * @method Gets the camera spec information for a specific model
  *
  * @param {HardwareVariationEnum} [cameraHW] The camera hardware model
  *
  * @return {RhombusCameraSpecs} Returns the hardware specs of the camera
  * */
export const GetCameraSpecs = (cameraHW: HardwareVariationEnum): RhombusCameraSpecs => {
	switch (cameraHW) {
		case HardwareVariationEnum.CAMERAR100:
			return {
				FOV: 96,
				viewDistance: FeetToMeters(57)
			};
		case HardwareVariationEnum.CAMERAR1:
			return {
				FOV: 135,
				viewDistance: FeetToMeters(44)
			};
		case HardwareVariationEnum.CAMERAR2:
			return {
				FOV: 96,
				viewDistance: FeetToMeters(57)
			};
		case HardwareVariationEnum.CAMERAR200:
			return {
				FOV: 112,
				viewDistance: FeetToMeters(57)
			};
		default:
			// Print in red
			console.log("\x1b[31m%s\x1b[0m", "Running unsupported camera! Using default FOV and view distance settings!");
			return {
				FOV: 112,
				viewDistance: FeetToMeters(57)
			};
	}
}

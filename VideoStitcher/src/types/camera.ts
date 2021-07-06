import { Vec2 } from "./vector";

/*
  *
  * @export
  * @interface Camera
  * 
  * This is represents a Rhombus Systems Camera
  * */
export interface Camera {
	/*
	  * @type {string} The UUID of this camera
	  * @memberof Camera
	  * */
	uuid: string;

	/*
	  * @type {number} The rotation of this camera in radians. 
	  * These are converted radians, NOT the direct radians given from rhombus. 
	  * In this coordinate space, 0 is east, PI / 2 is north, and PI is west etc...
	  *
	  * @memberof Camera
	  * */
	rotationRadians: number;

	/*
	  * @type {number} The latitude (x) and longitude (y) location of this camera
	  * @memberof Camera
	  * */
	location: Vec2;

	/*
	  * @type {number} The field of view of this camera. 
	  * This changes depending on the Rhombus Camera type and is used in determining which cameras are located next to each other
	  *
	  * @memberof Camera
	  * */
	FOV: number;

	/*
	  * @type {number} The distance in meters on average this camera will see. 
	  * This obviously is not exact because this will change based on the up and down rotation of the camera,
	  * but this is a good enough number that we can use to detect which cameras are near each other
	  *
	  * @memberof Camera
	  * */
	viewDistance: number;
}

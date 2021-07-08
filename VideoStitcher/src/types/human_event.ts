import { Vec2 } from "./vector"
import { Camera } from "./camera"

/*
  *
  * @export
  * @interface HumanEvent
  * 
  * This is represents a single human bounding box at a specific timestamp. 
  * */
export interface HumanEvent {
	/*
	  * @type {number} The ObjectID of this human event.
	  * @memberof HumanEvent
	  * */
	id: number;

	/*
	  * @type {Vec2} The position permyriad of the bounding box this human event is for
	  * @memberof HumanEvent
	  * */
	position: Vec2;

	/*
	  * @type {Vec2} The size permyriad of the bounding box this human event is for
	  * @memberof HumanEvent
	  * */
	dimensions: Vec2;

	/*
	  * @type {number} The timestamp in miliseconds at which this human event occurs
	  * @memberof HumanEvent
	  * */
	timestamp: number;

	/*
	  * @type {Camera} The camera for this human event
	  * @memberof HumanEvent
	  * */
	camera: Camera;
};

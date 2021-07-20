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

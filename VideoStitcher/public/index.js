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

const socket = io();

const TYPE_X = 0;
const TYPE_Y = 1;

const parseFinalizedEvent = (index, eventData, startTime, x, y, event, type) => {
	x.push(...event.data.map(event => (event.timestamp - startTime) / 1000));
	y.push(...event.data.map(event => (type == TYPE_X ? event.position.x : event.position.y) * 2 - 1));
	event.data.forEach((e) => {
		eventData.push(e);
		index++;
	});
	if ('followingEvent' in event) {
		parseFinalizedEvent(index += event.data.length, eventData, startTime, x, y, event.followingEvent);
	}
}


socket.on("Plot-Graph", (msg) => {
	let x = [];
	let y = [];
	let eventData = [];
	const startTime = msg.event.startTime;
	parseFinalizedEvent(0, eventData, startTime, x, y, msg.event, TYPE_X);

	const graphOnClick = (data) => {
		const point = data.points[0];
		console.log(point);
		const event = eventData[point.pointNumber];
		const timestamp = event.timestamp;
		window.open("https://console.rhombussystems.com/devices/cameras/" + event.camera.uuid + "/?t=" + timestamp, "_blank");
	}

	let graph = document.getElementById("velocity_x_graph");
	Plotly.newPlot("velocity_x_graph", [{
		x: x,
		y: y,
		type: 'scatter',
	}]);

	graph.on('plotly_click', graphOnClick);

	x = [];
	y = [];
	eventData = [];
	parseFinalizedEvent(0, eventData, startTime, x, y, msg.event, TYPE_Y);

	graph = document.getElementById("velocity_y_graph");
	Plotly.newPlot("velocity_y_graph", [{
		x: x,
		y: y,
		type: 'scatter',
	}]);

	graph.on('plotly_click', graphOnClick);
});

socket.on("Plot-Cameras", (msg) => {
	const pixels = msg.screen.pixels;
	const netPixels = msg.netScreen.netScreen.pixels;
	const numRows = pixels.length;
	const size = 1000 / numRows;
	const canvas = document.getElementById("camera_visibility_rasterized");
	const ctx = canvas.getContext('2d');

	ctx.clearRect(0, 0, 1000, 1000);
	for (let i = 0; i < numRows; i++) {
		for (let j = 0; j < numRows; j++) {
			if (pixels[j][i].cameras.length > 0) {
				if (netPixels[j][i]) {
					ctx.fillStyle = '#9494ff';
				} else {
					ctx.fillStyle = 'white';
				}
			} else if (netPixels[j][i]) {
				ctx.fillStyle = 'blue';
			} else {
				ctx.fillStyle = 'black';
			}
			ctx.fillRect(size * i, 1000 - size * j, size, size);
			ctx.strokeStyle = 'white';
			ctx.strokeRect(size * i, 1000 - size * j, size, size);
		}
	}
});


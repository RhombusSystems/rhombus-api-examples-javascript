const socket = io();

// const graphHumanEvents = (events) => {
//         let data = [];
//         let curveData = [];
//         let k = 0;
//         for (let i = 0; i < events.length; i++) {
//                 const exitEvent = events[i];
//                 data.push({
//                         x: exitEvent.events.map(event => (event.timestamp - events[0].events[0].timestamp) / 1000),
//                         y: exitEvent.events.map(event => event.position.x * 2 - 1),
//                         type: 'scatter',
//                         name: 'Exit event ' + exitEvent.id,
//                 });
//                 curveData.push({
//                         event: exitEvent,
//                 });
//                 for (let j = 0; j < exitEvent.relatedEvents.length; j++) {
//                         const relatedEvent = exitEvent.relatedEvents[j];
//                         data.push({
//                                 x: relatedEvent.events.map(event => (event.timestamp - events[0].events[0].timestamp) / 1000),
//                                 y: relatedEvent.events.map(event => event.position.x * 2 - 1),
//                                 type: 'scatter',
//                                 name: 'Related event ' + relatedEvent.id + ' for other enter event ' + exitEvent.id,
//                         });
//                         curveData.push({
//                                 event: relatedEvent,
//                         });
//                         k++;
//                 }

//         }
//         console.log(data);
// }

const parseFinalizedEvent = (index, eventData, startTime, x, y, event) => {
	x.push(...event.data.map(event => (event.timestamp - startTime) / 1000));
	y.push(...event.data.map(event => event.position.x * 2 - 1));
	event.data.forEach((e) => {
		eventData.push(e);
		index++;
	});
	if ('followingEvent' in event) {
		parseFinalizedEvent(index += event.data.length, eventData, startTime, x, y, event.followingEvent);
	}
}

socket.on("Plot-Graph", (msg) => {
	console.log(msg);
	let x = [];
	let y = [];
	let eventData = [];
	let index = 0;
	let startTime = msg.event.startTime;
	parseFinalizedEvent(index, eventData, startTime, x, y, msg.event);
	console.log(x);
	console.log(y);
	console.log(eventData);
	let graph = document.getElementById("graph");
	Plotly.newPlot("graph", [{
		x: x,
		y: y,
		type: 'scatter',
	}]);
	graph.on('plotly_click', (data) => {
		const point = data.points[0];
		console.log(point);
		const event = eventData[point.pointNumber];
		const timestamp = event.timestamp;
		window.open("https://console.rhombussystems.com/devices/cameras/" + event.camUUID + "/?t=" + timestamp, "_blank");
	})

	// graphHumanEvents(msg.events);
});


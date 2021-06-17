const socket = io();
let id = -1;

const graphList = (x, y, events) => {
	let graph = document.getElementById("graph");
	let data = [];
	console.log(x);
	for (let i = 0; i < x.length; i++) {
		data.push({
			x: x[i],
			y: y[i],
			type: 'scatter',
		});
	}
	Plotly.newPlot("graph", data);
	graph.on('plotly_click', (data) => {
		const point = data.points[0];
		let totalIndex = 0;
		for (let i = 0; i < point.curveNumber; i++) {
			totalIndex += x[i].length;
		}
		totalIndex += point.pointNumber;
		const timestamp = events[totalIndex].timestamp;
		window.open("https://console.rhombussystems.com/devices/cameras/" + events[totalIndex].camUUID + "/?t=" + timestamp, "_blank");
	})
}

const graphHumanEvents = (events) => {
	let totalX = [];
	let totalY = [];
	let x = [];
	let y = [];
	let objectID = events[0].id;
	let camUUID = events[0].camUUID;
	for (let i = 0; i < events.length; i++) {
		const box = events[i];
		if (objectID != box.id || camUUID != box.camUUID) {
			totalX.push(x);
			totalY.push(y);
			x = [];
			y = [];
			objectID = box.id;
			camUUID = box.camUUID;
		}
		x.push((box.timestamp - events[0].timestamp) / 1000);
		y.push(box.position.x * 2 - 1);
	}
	if (x.length > 0) {
		totalX.push(x);
		totalY.push(y);
	}
	graphList(totalX, totalY, events);


}

socket.on("Plot-Graph", (msg) => {
	if (id == msg.id) return;
	id = msg.id;

	graphHumanEvents(msg.events.concat(msg.relatedEvents));
});


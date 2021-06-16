const socket = io();
let objectID = -1;
let camUUID = "";

socket.on("CameraUUID", (uuid) => {
	camUUID = uuid;
});

socket.on("Plot-Graph", (boxes) => {
	if (objectID == boxes[0].id) return;
	let x = [];
	let y = [];
	for (let box of boxes) {
		x.push((box.timestamp - boxes[0].timestamp) / 1000);
		y.push(box.position.x * 2 - 1);
	}
	Plotly.newPlot("graph", [
		{
			x: x,
			y: y
		},
		{
			hovermode: 'closest',
		}
	]);
	objectID = boxes[0].id;
	const graph = document.getElementById("graph");
	graph.on('plotly_click', (data) => {
		const point = data.points[0];
		const timestamp = boxes[point.pointNumber].timestamp;
		window.open("https://console.rhombussystems.com/devices/cameras/" + camUUID + "/?t=" + timestamp, "_blank");
	});
});


import * as express from 'express';
import * as path from 'path'
import { Server } from "socket.io"
import * as http from 'http'

export namespace IOServer {
	let io: Server;
	export const StartServer = () => {
		const app = express();
		const port = process.env.PORT || 8080;
		const server = http.createServer(app);
		io = new Server(server);

		app.get('/', function(_, res) {
			res.sendFile(path.join(__dirname, '../../public/index.html'));
		});

		app.get('/index.js', function(_, res) {
			res.sendFile(path.join(__dirname, '../../public/index.js'));
		});


		io.on('connection', socket => {
			console.log("New client!");
			socket.on('disconnect', () => {
				console.log("Client disconnected!");
			});
		});


		server.listen(port, () => {
			console.log("Socket IO is now listening");
		});

		console.log("\x1b[34m%s\x1b[0m", "Server started at http://localhost:" + port);
	}

	export const Emit = (event: string, data: any) => {
		io.emit(event, data);
	}
}

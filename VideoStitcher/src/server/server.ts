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


		server.listen(port, () => {
			console.log("Socket IO is now listening");
		});

		console.log("\x1b[34m%s\x1b[0m", "To view the devtools, go to http://localhost:" + port);
	}

	export const Emit = (event: string, data: any) => {
		io.emit(event, data);
	}
}

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

// Get the API Key from the environment, for more info see https://apidocs.rhombussystems.com/reference#introduction
//
// Set this by creating a ".env" file in the root source directory with the contents: API_KEY=<YOUR API KEY HERE>
// Example: API_KEY=Rh0MbU$-iS-AwEs0M3
require('dotenv').config()

/*
  * 
  * @import Main so that we can run it from here
  * */
import { main } from "./src/main"

/*
  *
  * @import Connection Type as this is a param in `main`
  * */
import { ConnectionType } from "./src/types/connection_type"




// Entry point
//
// We are just going to use LAN by default, and if you specify WAN in .env then we will use WAN. There isn't really a reason to do this unless you have to
main(process.env.API_KEY, process.env.CONNECTION_TYPE == "WAN" ? ConnectionType.WAN : ConnectionType.LAN);

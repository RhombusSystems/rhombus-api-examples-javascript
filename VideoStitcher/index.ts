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


// Get the API Key from the environment, for more info see https://apidocs.rhombussystems.com/reference#introduction
//
// Set this by creating a ".env" file in the root source directory with the contents: API_KEY=<YOUR API KEY HERE>
// Example: API_KEY=Rh0MbU$-iS-AwEs0M3
require('dotenv').config()


// Entry point
//
// We are just going to use LAN by default, and if you specify WAN in .env then we will use WAN. There isn't really a reason to do this unless you have to
main(process.env.API_KEY, process.env.CONNECTION_TYPE == "WAN" ? ConnectionType.WAN : ConnectionType.LAN);

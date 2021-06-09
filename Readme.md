# Rhombus Identifier

## What is this
Rhombus Identifier is a NodeJS server application written in Typescript that identifies objects in Rhombus Systems cameras using the Tensorflow COCO model. This is an example of how to use the [Rhombus API](https://apidocs.rhombussystems.com/reference). This is NOT a production ready example, it is for demonstrational purposes only

The code demos how to send API requests to Rhombus using API token authentication and how to download VODs from Rhombus.


## Installation

1. Clone the repo with `git clone https://github.com/RhombusSystems/rhombus-api-examples-javascript` 
2. Run ``
3. Run `npm install` in the root directory
4. Create a `.env` file in the root source directory using the following structure (without the angle brackets)

    API_KEY=<YOUR API KEY>

    CAM_UUID=<YOUR CAMERA UUID>

    CONNECTION_TYPE=<WAN OR LAN> 

NOTE: CONNECTION_TYPE param is optional, but it will specify whether to use a WAN or LAN connection from the camera to download the VODs. It is by default LAN and unless the NodeJS server is running on a separate wifi from the camera, which would be very unlikely...

5. Run the app using `npm run start`

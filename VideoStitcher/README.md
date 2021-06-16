# Rhombus Extended AI Module

## What is this
Rhombus Extended AI Module is a NodeJS server application written in Typescript that identifies objects in Rhombus Systems cameras using the Tensorflow COCO model. This is an example of how to use the [Rhombus API](https://apidocs.rhombussystems.com/reference). This is NOT a production ready example, it is for demonstrational purposes only

The code demos how to send API requests to Rhombus using API token authentication and how to download VODs from Rhombus.


## Installation

### Generate RhombusTypescriptAPI

NOTE: If you have already generated the Typescript client and have a RhombusTypescriptAPIdirectory in the root source directory, then steps 1 and 2 are optional

1. Clone the repo with `git clone https://github.com/RhombusSystems/rhombus-api-examples-javascript` 
2. Run `curl https://raw.githubusercontent.com/RhombusSystems/rhombus-api-examples-codegen/main/typescript/install.sh | bash` in the root directory

### Running the demo

3. Run `cd ExtendedAIModule`
4. Run `npm install` in the ExtendedAIModule directory
5. Create a `.env` file in the ExtendedAIModule source directory using the following structure (without the angle brackets)

    API_KEY=<YOUR API KEY>

    CAM_UUID=<YOUR CAMERA UUID>

    CONNECTION_TYPE=<WAN OR LAN> 

NOTE: CONNECTION_TYPE parameter is optional, but it will specify whether to use a WAN or LAN connection from the camera to download the VODs. It is by default LAN and unless the NodeJS server is running on a separate wifi from the camera, which would be very unlikely...
6. Run the example using `npm run start`

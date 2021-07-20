# Rhombus Video Stitcher

## What is this
Rhombus Video Stitcher is a NodeJS server application written in Typescript that attempts to automatically stitch together different video clips to follow someone around seemlessly. This is an example of how to use the [Rhombus API](https://apidocs.rhombussystems.com/reference). This is NOT a production ready example, it is for demonstrational purposes only

The code demos how to send API requests to Rhombus using API token authentication and how to download VODs from Rhombus.

## Installation

### Generate RhombusTypescriptAPI

NOTE: If you have already generated the Typescript client and have a RhombusTypescriptAPIdirectory in the root source directory, then steps 1 and 2 are optional

1. Clone the repo with `git clone https://github.com/RhombusSystems/rhombus-api-examples-javascript` 
2. Run `curl https://raw.githubusercontent.com/RhombusSystems/rhombus-api-examples-codegen/main/typescript/install.sh | bash` in the root directory

### Running the demo

3. Run `cd VideoStitcher`
4. Run `npm install` in the VideoStitcher directory
5. Create a `.env` file in the VideoStitcher source directory using the following structure (without the angle brackets)

    API_KEY=<YOUR API KEY>

    CONNECTION_TYPE=<WAN OR LAN> 

NOTE: CONNECTION_TYPE parameter is optional, but it will specify whether to use a WAN or LAN connection from the camera to download the VODs. It is by default LAN and unless the NodeJS server is running on a separate wifi from the camera, which would be very unlikely...

There are also many other environment variables that can be set, see `src/environment/environment.ts` for more information.

6. Run the example using `npm run start`

You will need to either choose from a list of suggested human events or provide your own object ID, timestamp, and camera UUID to start the example.


### Reliability
Unfortunately due to limited information about people in the scene and relying purely on bounding box positions, this demo is not very reliable. It will give more false positives than false negatives and that is intentional, because it seems to be more beneficial to sometimes provide the user with garbage clips rather than to skip good clips because of small issues. However under good circumstances the example works pretty well. The example works best when there is only 1 person on camera, and when they follow an obvious exit path.

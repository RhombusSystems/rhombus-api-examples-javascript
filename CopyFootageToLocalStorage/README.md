# Rhombus Copy Footage To Local Storage

## What is this
Rhombus copy footage to local storage is a NodeJS server application written in Typescript that downloads footage from Rhombus Systems cameras. This is an example of how to use the [Rhombus API](https://apidocs.rhombussystems.com/reference). This is NOT a production ready example, it is for demonstrational purposes only

The code demos how to send API requests to Rhombus using API token authentication and how to download VODs from Rhombus.


## Installation

### Generate RhombusTypescriptAPI

NOTE: If you have already generated the Typescript client and have a RhombusTypescriptAPIdirectory in the root source directory, then steps 1 and 2 are optional

1. Clone the repo with `git clone https://github.com/RhombusSystems/rhombus-api-examples-javascript` 
2. Run `curl https://raw.githubusercontent.com/RhombusSystems/rhombus-api-examples-codegen/main/typescript/install.sh | bash` in the root directory

### Running the demo

3. Run `cd CopyFootageToLocalStorage`
4. Run `npm install` in the CopyFootageToLocalStorage directory
5. Create a `.env` file in the CopyFootageToLocalStorage source directory using the following structure (without the angle brackets)

    API_KEY=<YOUR API KEY>

    CAMERA_UUID=<YOUR CAMERA UUID>

    OUTPUT=<OUTPUT mp4 PATH>

    # Other optional parameters
    
    START_TIME=<START TIME IN SECONDS SINCE EPOCH>

    DURATION=<DURATION IN SECONDS>

    DEBUG=<TRUE or FALSE>

    CONNECTION_TYPE=<WAN OR LAN> 


NOTE: CONNECTION_TYPE parameter is optional, but it will specify whether to use a WAN or LAN connection from the camera to download the VODs. It is by default LAN and unless the NodeJS server is running on a separate wifi from the camera, which would be very unlikely...

6. Run the example using `npm run start`

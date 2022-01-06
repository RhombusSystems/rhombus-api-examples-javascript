# Rhombus List of Users Example

## What is this
Rhombus list of users example is a NodeJS server application written in Typescript that gets a report of all of the users and their emails and outputs to a CSV. This is an example of how to use the [Rhombus API](https://apidocs.rhombussystems.com/reference). This is NOT a production ready example, it is for demonstrational purposes only

The code demos how to send API requests to Rhombus using API token authentication and how to use that data to create a CSV


## Installation

### Generate RhombusTypescriptAPI

NOTE: If you have already generated the Typescript client and have a RhombusTypescriptAPIdirectory in the root source directory, then steps 1 and 2 are optional

1. Clone the repo with `git clone https://github.com/RhombusSystems/rhombus-api-examples-javascript` 
2. Run `curl https://raw.githubusercontent.com/RhombusSystems/rhombus-api-examples-codegen/main/typescript/install.sh | bash` in the root directory

### Running the demo

3. Run `cd ListOfUsersExample`
4. Run `npm install` in the ListOfUsersExample directory
5. Create a `.env` file in the ListOfUsersExample source directory using the following structure (without the angle brackets)

    API_KEY=`<YOUR API KEY>`

    OUTPUT_PATH=`<PATH TO OUTPUT CSV>`

    NAMES=`<COMMA SEPARATED NAMES IN QUOTES>`

The `NAMES` parameter is optional. It will filter the users and only output users with the specified names

6. Run the example using `npm run start`

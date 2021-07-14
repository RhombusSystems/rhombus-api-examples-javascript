import { Configuration, UserWebserviceApi, UserType } from "@rhombus/API"
import * as path from "path"
import * as fs from "fs"

import * as csv from "csv-writer"

// Necessary headers that should be used for every POST request
const RHOMBUS_HEADERS = { headers: { "x-auth-scheme": "api-token" } };

/*
  *
  * @method Gets and prints a list of found users
  * @param {Configuration} [configuration] The API configuration used to send requests to RhombusAPI
  * @return {Promise<UserType[]>} Returns an array of found users
  * */
const getUsers = async (configuration: Configuration): Promise<UserType[]> => {
	// Create the API
	let api: UserWebserviceApi;
	api = new UserWebserviceApi(configuration);

	// Send a request to rhombus to get all of the users
	try {
		const res = await api.getUsersInOrg({}, RHOMBUS_HEADERS);
		return res.users;
	} catch (e) {
		console.log(e);
		return [];
	}
}

/*
  *
  * @interface User
  *
  * Holds data nicely for the CSV writer
  * */
interface User {
	/*
	  *
	  * @type {string} The name of the user
	  * @memberof User
	  * */
	name: string;

	/*
	  *
	  * @type {string} The email of the user
	  * @memberof User
	  * */
	email: string;
};

/*
  *
  * @method Creates a record from a RhombusAPI user type to be inserted into the CSV
  * @param {UserType} [user] The user to insert
  * @return {User} Returns the serializable `User` to put into the CSV
  * */
const getUserRecord = (user: UserType): User => {
	return {
		name: user.name,
		email: user.email,
	};
}

/*
  *
  * @method Creates the CSV stringifier
  * @return {ObjectCsvStringifier} Returns the CSV stringifier
  * */
const initCSVWriter = () => {
	return csv.createObjectCsvStringifier({
		// The two headers in our CSV are going to be `name` and `email`
		header: [
			{ id: "name", title: "Name" },
			{ id: "email", title: "Email" },
		],
	});
}


/*
  *
  * @method Entry point of the program
  * @param {string} [apiKey] The API Key to make RhombusAPI requests
  * @param {string} [outputPath] The output path of the CSV file
  * @param {string | undefined} [filterNames] The user specified name filters. Does not have to be present, will be undefined if there are none.
  * */
const main = async (apiKey: string, outputPath: string, filterNames: string | undefined): Promise<void> => {
	// Create an API configuration which will be used to make requests
	const configuration = new Configuration({ apiKey: apiKey });

	// Get the output directory
	const outputDirectory = path.dirname(outputPath);

	// Create the output directory
	fs.mkdirSync(outputDirectory, { recursive: true });

	// If the output CSV already exists, then we will delete it
	if (fs.existsSync(outputPath)) {
		fs.unlinkSync(outputPath);
	}

	// Create the output CSV
	fs.writeFileSync(outputPath, "");

	// Create our CSV writer
	const csvWriter = initCSVWriter();

	// Get the users
	const users = await getUsers(configuration);

	// Create our array of records
	const records: User[] = [];

	if (filterNames != undefined) {
		// If the names are specified, then filter by the specified names

		// Names are split by a ", ", so we will turn this into an array of names so that we can use it easier
		const names = filterNames.split(", ");

		for (const user of users) {
			// If the name exists in the filters, then add it to the CSV
			if (names.find(element => element == user.name) != undefined) {
				// Add the user to the CSV
				records.push(getUserRecord(user));
			}
		}
	} else {
		// Otherwise just add all of the users 
		for (const user of users) {
			// Add the user to the CSV
			records.push(getUserRecord(user));
		}
	}

	// Writes the CSV strings
	fs.appendFileSync(outputPath, csvWriter.getHeaderString());
	fs.appendFileSync(outputPath, csvWriter.stringifyRecords(records));
}

// Get the API Key from the environment, for more info see https://apidocs.rhombussystems.com/reference#introduction
//
// Set this by creating a ".env" file in the root source directory with the contents: API_KEY=<YOUR API KEY HERE>
// Example: API_KEY=Rh0MbU$-iS-AwEs0M3
require('dotenv').config()
main(process.env.API_KEY, process.env.OUTPUT_PATH, process.env.NAMES);

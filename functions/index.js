'use strict';

const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const ZwermAPI = require('@zwerm/zwermapi-client');
const spotify = require('./spotify');
const Handover = require('./handover');
const Player = require('./player');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    // Set up the dialog flow agent
    const agent = new WebhookClient({ request, response });
    console.info('Dialogflow Request headers: ' + JSON.stringify(request.headers, null, 2));
    console.info('Dialogflow Request body: ' + JSON.stringify(request.body, null, 2));
    console.info(agent.requestSource);

    // Set up basic libraries
    const zwerm = new ZwermAPI(
        functions.config().zwerm.endpoint,
        functions.config().zwerm.key
    );

    // Ensure connection to spotify and process intents
    return spotify
        .connect()

        // Set up services
        .then(spotify => [
            new Handover(agent, zwerm),
            new Player(agent, spotify)
        ])

        // handle intents
        .then(services => agent.handleRequest(require('./intents')(...services)))

        // Generic Error Response
        .catch(error => {
            console.error(error);

            // Creating a new client here to remove all previously added messages.
            const agent = new WebhookClient({ request, response });
            // noinspection JSCheckFunctionSignatures as the third party library is malformed.
            return agent.handleRequest(agent => agent.add('Something went wrong.'));
        });
});

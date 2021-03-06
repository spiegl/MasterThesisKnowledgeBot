// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const {
    TimexProperty
} = require("@microsoft/recognizers-text-data-types-timex-expression");
const { MessageFactory, InputHints } = require("botbuilder");
const { LuisRecognizer } = require("botbuilder-ai");
const {
    ComponentDialog,
    DialogSet,
    DialogTurnStatus,
    TextPrompt,
    WaterfallDialog
} = require("botbuilder-dialogs");
const { CancelAndHelpDialog } = require("./cancelAndHelpDialog");

const { KmConnector } = require("../KmConnector");
const Data = new KmConnector();

const MAIN_WATERFALL_DIALOG = "mainWaterfallDialog";

class MainDialog extends CancelAndHelpDialog {
    constructor(luisRecognizer, bookingDialog) {
        super("MainDialog");

        if (!luisRecognizer)
            throw new Error(
                "[MainDialog]: Missing parameter 'luisRecognizer' is required"
            );
        this.luisRecognizer = luisRecognizer;

        if (!bookingDialog)
            throw new Error(
                "[MainDialog]: Missing parameter 'bookingDialog' is required"
            );

        // Define the main dialog and its related components.
        // This is a sample "book a flight" dialog.
        this.addDialog(new TextPrompt("TextPrompt"))
            .addDialog(bookingDialog)
            .addDialog(
                new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                    this.introStep.bind(this),
                    this.actStep.bind(this),
                    this.finalStep.bind(this)
                ])
            );

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * First step in the waterfall dialog. Prompts the user for a command.
     */
    async introStep(stepContext) {
        if (!this.luisRecognizer.isConfigured) {
            const messageText =
                "NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.";
            await stepContext.context.sendActivity(
                messageText,
                null,
                InputHints.IgnoringInput
            );
            return await stepContext.next();
        }

        const messageText = stepContext.options.restartMsg
            ? stepContext.options.restartMsg
            : 'Hello!\nWhat can I help you with today?\nSay something like "What is the capital of Austria? I can\'t wait to tell you all my knowledge about EU countries!"';
        const promptMessage = MessageFactory.text(
            messageText,
            messageText,
            InputHints.ExpectingInput
        );
        return await stepContext.prompt("TextPrompt", { prompt: promptMessage });
    }

    /**
     * Second step in the waterfall.  This will use LUIS to attempt to extract the origin, destination and travel dates.
     * Then, it hands off to the bookingDialog child dialog to collect any remaining details.
     */
    async actStep(stepContext) {
        const bookingDetails = {};

        if (!this.luisRecognizer.isConfigured) {
            // LUIS is not configured, we just run the BookingDialog path.
            return await stepContext.beginDialog("bookingDialog", bookingDetails);
        }

        // Call LUIS and gather any potential booking details. (Note the TurnContext has the response to the prompt)
        const luisResult = await this.luisRecognizer.executeLuisQuery(
            stepContext.context
        );

        console.log(luisResult);
        console.log(luisResult.entities);
        console.log(luisResult.entities.$instance);

        switch (LuisRecognizer.topIntent(luisResult)) {
            case "BookFlight":
                // Extract the values for the composite entities from the LUIS result.
                const fromEntities = this.luisRecognizer.getFromEntities(luisResult);
                const toEntities = this.luisRecognizer.getToEntities(luisResult);

                // Show a warning for Origin and Destination if we can't resolve them.
                await this.showWarningForUnsupportedCities(
                    stepContext.context,
                    fromEntities,
                    toEntities
                );

                // Initialize BookingDetails with any entities we may have found in the response.
                bookingDetails.destination = toEntities.airport;
                bookingDetails.origin = fromEntities.airport;
                bookingDetails.travelDate = this.luisRecognizer.getTravelDate(
                    luisResult
                );
                console.log(
                    "LUIS extracted these booking details:",
                    JSON.stringify(bookingDetails)
                );

                // Run the BookingDialog passing in whatever details we have from the LUIS call, it will fill out the remainder.
                return await stepContext.beginDialog("bookingDialog", bookingDetails);

            case "GetWeather":
                // We haven't implemented the GetWeatherDialog so we just display a TODO message.
                const getWeatherMessageText = "TODO: get weather flow here";
                await stepContext.context.sendActivity(
                    getWeatherMessageText,
                    getWeatherMessageText,
                    InputHints.IgnoringInput
                );
                break;

            case "QueryKM":
                let country, property, answer;
                try {
                    country = luisResult.entities.Country[0][0];
                } catch (error) {
                    await stepContext.context.sendActivity(
                        "Sorry, I didn't get the country."
                    );
                    break;
                }

                try {
                    property = luisResult.entities.CountryProperty[0][0];
                } catch (error) {
                    await stepContext.context.sendActivity(
                        "Sorry, I didn't get the property of the country (" +
                        Data.query(country, "name") +
                        ") you were asking for."
                    );
                    break;
                }

                answer = Data.query(country, property);

                if (answer === "") {
                    await stepContext.context.sendActivity(
                        "I understood your question, but i do not have any data on this. Sorry!"
                    );
                    break;
                }

                let answerText = Data.getAnswerText(property)
                    .replace("$countryProperty", answer)
                    .replace("$country", Data.query(country, "name"));

                console.log(country, property, answer);
                console.log(answerText);

                await stepContext.context.sendActivity(answerText);

                break;
            case "FilterQueryKMNum":
                let filterNumProperty, filterNumOperator, filterNumValue;

                filterNumProperty = luisResult.entities.CountryProperty[0][0];
                filterNumOperator = luisResult.entities.FilterOperator[0][0];
                try {
                    filterNumValue = luisResult.entities.FilterValueNum[0].number[0];
                } catch (error) {
                    filterNumValue = luisResult.entities.number[0];
                }

                const filterNumAnswer = Data.filterNum(
                    filterNumProperty,
                    filterNumOperator,
                    filterNumValue
                );

                let filterNumAnswerText =
                    "The following " +
                    filterNumAnswer.num +
                    " countries have " +
                    filterNumOperator +
                    " than " +
                    filterNumValue +
                    " " +
                    filterNumProperty +
                    ": " +
                    filterNumAnswer.string +
                    ".";

                await stepContext.context.sendActivity(filterNumAnswerText);
                break;
            case "FilterQueryKM":
                let filterProperty, filterValue;
                filterValue = luisResult.entities.FilterValue[0][0];
                filterProperty = (filterValue == 'euro') ? 'currency' : luisResult.entities.CountryProperty[0][0];

                const filterAnswer = Data.filter(
                    filterProperty,
                    filterValue
                );

                let filterAnswerText =
                    "The following " +
                    filterAnswer.num +
                    " countries have " +
                    filterValue +
                    " " +
                    filterProperty +
                    ": " +
                    filterAnswer.string +
                    ".";

                await stepContext.context.sendActivity(filterAnswerText);
                break;
            case "AggregateQueryKM":
                await stepContext.context.sendActivity(
                    "Indent is AggregateQueryKM. Not programmed yet!"
                );
                break;
            case "InfoAboutBot":
                await stepContext.context.sendActivity(
                    "I glad that you ask! I know a litte bit about EU countries in special, which capitals they have and which currency they use. I also know about their population and area."
                );
                break;
            default:
                // Catch all for unhandled intents
                const didntUnderstandMessageText = `Sorry, I didn't get that. Please try asking in a different way.`;
                await stepContext.context.sendActivity(
                    didntUnderstandMessageText,
                    didntUnderstandMessageText,
                    InputHints.IgnoringInput
                );
        }

        return await stepContext.next();
    }

    /**
     * Shows a warning if the requested From or To cities are recognized as entities but they are not in the Airport entity list.
     * In some cases LUIS will recognize the From and To composite entities as a valid cities but the From and To Airport values
     * will be empty if those entity values can't be mapped to a canonical item in the Airport.
     */
    async showWarningForUnsupportedCities(context, fromEntities, toEntities) {
        const unsupportedCities = [];
        if (fromEntities.from && !fromEntities.airport) {
            unsupportedCities.push(fromEntities.from);
        }

        if (toEntities.to && !toEntities.airport) {
            unsupportedCities.push(toEntities.to);
        }

        if (unsupportedCities.length) {
            const messageText = `Sorry but the following airports are not supported: ${unsupportedCities.join(
                ", "
            )}`;
            await context.sendActivity(
                messageText,
                messageText,
                InputHints.IgnoringInput
            );
        }
    }

    /**
     * This is the final step in the main waterfall dialog.
     * It wraps up the sample "book a flight" interaction with a simple confirmation.
     */
    async finalStep(stepContext) {
        // If the child dialog ("bookingDialog") was cancelled or the user failed to confirm, the Result here will be null.
        if (stepContext.result) {
            const result = stepContext.result;
            // Now we have all the booking details.

            // This is where calls to the booking AOU service or database would go.

            // If the call to the booking service was successful tell the user.
            const timeProperty = new TimexProperty(result.travelDate);
            const travelDateMsg = timeProperty.toNaturalLanguage(
                new Date(Date.now())
            );
            const msg = `I have you booked to ${result.destination} from ${result.origin} on ${travelDateMsg}.`;
            await stepContext.context.sendActivity(
                msg,
                msg,
                InputHints.IgnoringInput
            );
        }

        // Restart the main dialog with a different message the second time around
        return await stepContext.replaceDialog(this.initialDialogId, {
            restartMsg: "Any further questions? I'm curious."
        });
    }
}

module.exports.MainDialog = MainDialog;

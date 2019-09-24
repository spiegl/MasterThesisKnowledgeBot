# Knowledge Bot

Chatbot which allows you to ask questions about plain geography of EU countries.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) version 10.14 or higher
- LOUIS AI credentials

### Installation

1. Install node modules

    ```bash
    npm install
    ```

2. Run the update script to (re)generate data caches and the LUIS model.

    ```bash
    bin/update.sh
    ```

3. Setup LUIS

    Once you created the [LUIS model](cognitiveModels/output.json), update `.env` with your `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName`.

4. Start the bot

    ```bash
    npm start
    ```

5. Access with [Bot Framework Emulator](https://github.com/microsoft/botframework-emulator)

- Launch Bot Framework Emulator
- File -> Open Bot
- Enter a Bot URL of `http://localhost:3978/api/messages`

## Tests

WIP...

## Deployment

WIP...

Deploy the bot to Azure: https://aka.ms/azuredeployment

## Built With

- [Microsoft BotFramework](https://github.com/microsoft/botframework) -  A comprehensive framework for building enterprise-grade conversational AI experiences
- Based on [Core Bot Example](https://github.com/microsoft/BotBuilder-Samples/tree/2dfdc2c742ee051639646d692bd295a1ab0bbc63/samples/javascript_nodejs/13.core-bot) - PHP framework for web applications and a set of reusable PHP components
- [LUIS](https://www.luis.ai)
- [Restify](https://www.npmjs.com/package/restify)

## License

This project is licensed under the GNU GPLv3 License - see the [LICENSE.md](LICENSE.md) for details

# JIRA bot for Cisco Spark

This is a bot for Cisco Spark that integrates with JIRA.

## Spark Configuration

In order for the bot to communicate with Cisco Spark, a couple configuration values
are expected to exist in the environment (or `.env` or `.env.local` files):

* `PUBLIC_ADDRESS` - the address at which your bot can be reached.
* `ACCESS_TOKEN` - the bot's access token from Cisco Spark

## JIRA Configuration

In order for the bot to talk with JIRA a couple configuration values are required:

* `JIRA_HOST` - the URL to the JIRA instance
  (`https://YOUR_SUBDOMAIN.atlassian.net` for example)
* `JIRA_USERNAME` and `JIRA_PASSWORD` - the username and password used to
  authenticate with the JIRA API. Changes made to JIRA will be performed by
  this user, so you may want to create a special bot account.

### JIRA Webhooks

To be notified of events via webhooks, you must
[register
the webhook via the JIRA administration console]
(https://developer.atlassian.com/jiradev/jira-apis/webhooks#Webhooks-jiraadmin).

The URL should be `<PUBLIC_ADDRESS>/jira/receive`, where `<PUBLIC_ADDRESS>` is
the same URL as specified above. Be sure to select the notifications that you
want to receive in the administration console.

Additionally, you need to specify which room to post the webhook notifications
to. This is done using the `JIRA_WEBHOOK_ROOM` environment variable and should
be the title of the room you want notifications posted to.

## Deploying your own bot

Here are instructions for deploying on Heroku, but this can be adapted to any host.

1. [Create a new bot account](https://developer.ciscospark.com/add-bot.html) on Cisco Spark
1. Clone this repo
1. Create a new app on heroku

        heroku apps:create my-spark-bot

1. Add environment variables to the heroku app to match those in `.env`.
   e.g.

        heroku config:add PUBLIC_ADDRESS=https://my-spark-bot.herokuapp.com
        heroku config:add JIRA_HOST=https://test.atlassian.net

1. Push to heroku

        git push heroku

1. Add your bot to your space.

## Development

### Work on the bot


1. [Create a new bot account](https://developer.ciscospark.com/add-bot.html) on Cisco Spark

1. Clone this repo

1. Install dependencies

        yarn install

1. Copy `.env` to `.env.local` and customize

        cp .env .env.local

1. Start the local development server

        yarn server-dev

1. Run ngrok (or something like it).

    Because Spark uses webhooks to talk to bots, you must run something like
    ngrok locally to expose your server to the web.  We've included a script to
    do this for you (requires ngrok)

        yarn ngrok


### Tests

Run the tests:

    yarn test

Run the test watcher, which will re-run tests after every file change:

    yarn test-watch


### Code Structure

The code is laid out with the following structure:

```
src
├── attachHandlers.js  # Where all the phrases that will invoke handlers are specified
├── controller.js      # Creates the botkit `sparkbot` controller, configured via the env
├── handlers           # Directory containing all the functions that handle messages/webhooks received
│   ├── index.js       # Contains generic message handlers ("help", for example)
│   ├── issues.js      # All message handlers related to issue management
│   └── webhooks.js    # All webhook handlers
├── index.js           # The entry point of the bot
├── jira.js            # Wrapper around JIRA api
└── server.js          # Webserver that handles incoming Spark messages and JIRA webhooks
```

Separating the handlers from the controller (in this case, specifying expected phrases
in `attachHandlers.js`) allows us to test the pattern matching (in `tests/attachHandlersTest.js`)
separate from the functionality of the handler (in `tests/handlers/*.js`).

# JIRA bot for Cisco Spark

[![CircleCI](https://circleci.com/gh/promptworks/ciscospark-jira.svg?style=svg)](https://circleci.com/gh/promptworks/ciscospark-jira)

This is a self-hosted bot for Cisco Spark that integrates with JIRA.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

# Features

This bot allows developers and project managers to work seamlessly with JIRA directly from
Cisco Spark.

With this bot, you can:

* create new tickets
* list assigned tickets
* get requested details about a ticket
* assign, comment on, or update the status of a ticket
* receive updates on JIRA tickets as they happen

without having to leave your Spark channel.

![example use](https://user-images.githubusercontent.com/1062277/27293924-d3e1b5b2-54e5-11e7-8243-5fc8fa1cdd3a.png)

The bot is designed so that you can deploy the bot yourself so you can maintain
full control over the bot and its access to your data.

## Spark Configuration

In order for the bot to communicate with Cisco Spark, a couple configuration values
are expected to exist in the environment (or `.env` or `.env.local` files):

* `PUBLIC_ADDRESS` - the address at which your bot can be reached.
* `ACCESS_TOKEN` - the bot's access token from Cisco Spark
* `SPARK_SECRET` - [secret for validating the origin of
  webhooks](https://developer.ciscospark.com/webhooks-explained.html#auth)
* `LIMIT_TO_ORG` - (optional) ID of the organization that the bot should reply
  to. Users not in this org sending messages to the bot will receive no reply.
* `LIMIT_TO_DOMAIN` - (optional) Email domain(s) of users that can message the
  bot. Users whose email is not in one of these domains are ignored by the bot.
  If multiple domains are supported, they should be specified as a space-separated
  list of domains (`"example.com example2.com"`).

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
the webhook via the JIRA administration console](https://developer.atlassian.com/jiradev/jira-apis/webhooks#Webhooks-jiraadmin).

If the bot's JIRA account is an administrator, the bot can do this itself when
you tell it to `setup webhooks`.

If the bot is not an administrator, you must setup up webhooks manually.
The URL should be `<PUBLIC_ADDRESS>/jira/receive`, where `<PUBLIC_ADDRESS>` is
the same URL as specified above. Be sure to select the notifications that you
want to receive in the administration console.

Once the webhooks are setup in JIRA, you can use the `watch` command with the bot
to receive notifications of updates to the watched issues. The updates will be
posted to whichever room the command was given in.

Additionally, you can specify a room to receive all webhook notifications.
This is done using the `JIRA_WEBHOOK_ROOM` environment variable and should
be the ID of the room you want notifications posted to. A script to list rooms
and their IDs (`yarn list-rooms`) has been included to make finding the desired
room ID easier.

## Deploying your own bot

Here are instructions for deploying on Heroku, but this can be adapted to any host.

1. [Create a new bot account](https://developer.ciscospark.com/add-bot.html) on Cisco Spark
1. Clone this repo
1. Create a new app on heroku

        heroku apps:create my-spark-bot

1. Add a Redis addon

        heroku addons:create heroku-redis:hobby-dev

1. Add environment variables to the heroku app to match those in `.env`.
   e.g.

        heroku config:add PUBLIC_ADDRESS=https://my-spark-bot.herokuapp.com
        heroku config:add JIRA_HOST=https://test.atlassian.net

1. Push to heroku

        git push heroku

1. Add your bot to your space.

## Running the bot via Docker

A Dockerfile has been included to run the bot via Docker. Here are some basic
instructions on running the bot via Docker locally.

1. [Create a new bot account](https://developer.ciscospark.com/add-bot.html) on Cisco Spark
1. Clone this repo
1. Build the Docker image:

        docker build -t myjirabot .

1. Copy `.env` to `.env.local` and customize

        cp .env .env.local

1. Run the Docker image, specifying the newly created env file:

        docker run -it --env-file .env.local myjirabot

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

1. If using Docker, you can run the image specifying the environment file and
   exposing port 3000:

        docker run -it --env-file .env.local --publish 3000:3000 myjirabot

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


### Adding more commands

Adding a new command requires two steps: writing a new handler and attaching that handler to the bot.

#### 1. Write a new handler

Add a function in `src/handlers/` that will handle the message from Spark. The
function should take two arguments, the `bot` (the botkit instance) and the
`message` (that invoked this handler).

The handler will be passed as the `callback` argument to [the botkit
`hears`](https://github.com/howdyai/botkit/blob/fca645275c8d3ed462110062dcda8e804da77bb0/docs/readme.md#matching-patterns-and-keywords-with-hears)
function, so the `message` argument will contain any available "match" information.

To send a reply to the message, you can use the `bot.reply` method, passing in the
original message (so the bot knows where to send the reply to) and the intended
reply: `bot.reply(message, "Hello World")`.

#### 2. Attach the new handler

Now that we have a function to reply to a message, we need to tell the botkit
controller when to invoke the function. This is accomplished by adding to
`src/attachHandlers.js`.

For example, if we added a `helloWorldHandler` in `src/handlers/index.js`, we could
add the following line to invoke our new command when a user says "hello" to our bot:

```javascript
controller.hears(['hello'], 'direct_mention,direct_message', handlers.helloWorldHandler)
```


### Adding more webhooks

Similar to adding a new command, adding a new webhook is a two-step process. First,
we need to add a handler for the incoming webhook notification and then tell
botkit when to invoke our handler.

#### 1. Write a new handler

You can add a new function in `src/handlers/webhooks.js` that accepts two parameters:
`bot`, the botkit instance and `event` the JSON body of the webhook notification
from JIRA.

In order to send a message, we need to know which room to post the webhook notifications
to, specified by the `JIRA_WEBHOOK_ROOM` environment variable. For your convenience,
a `replyToWebhook` function exists that accepts the `bot` and the intended reply
and looks up the correct room to post to for you.

#### 2. Attach the webhook handler

Now that we have the webhook handler, we need to tell botkit when to invoke our
handler. This is again done in `src/attachHandlers.js`.

Rather than using `hears`, we can use the `on` function to invoke our handler
when the webhook event comes in. When a webhook is received, an event is triggered
with the name of the webhook event.

For example, to respond to a `issue_created` event, we can add the following line:

```javascript
controller.on('jira:issue_created', handlers.webhooks.issueCreatedHandler)
```

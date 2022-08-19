// Require the Bolt package (github.com/slackapi/bolt)
require('dotenv').config({ path: __dirname + '/.env' });
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.BOT_TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: 'debug',
  socketMode: true
});

app.event('app_home_opened', async ({ event, client, context }) => {
  console.log('app_home_opened');
  try {
    /* view.publish is the method that your app uses to push a view to the Home tab */
    const result = await client.views.publish({

      /* the user that opened your app's app home */
      user_id: event.user,

      /* the view object that appears in the app home*/
      view: {
        type: 'home',
        callback_id: 'home_view',

        /* body of the view */
        blocks: [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Welcome to your _App's Home_* :tada:"
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "This button won't do much for now but you can set up a listener for it using the `actions()` method and passing its unique `action_id`. See an example in the `examples` folder within your Bolt app."
            }
          },
          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "Click me!"
                }
              }
            ]
          }
        ]
      }
    });
  }
  catch (error) {
    console.error(error);
  }
});
app.event("message", async (event) => {
  if (!event.subtype && !event.bot_id) {
    console.log(event);
    client.chat.postMessage({
      token,
      channel: event.channel,
      thread_ts: event.ts,
      text: "Hello World!"
    })
  }
});

// All the room in the world for your code



(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log(app.client);
  console.log('⚡️ Bolt app is running!');
})();

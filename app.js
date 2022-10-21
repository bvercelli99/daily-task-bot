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

let activeUsers = {};

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log(app.client);
  console.log('⚡️ Bolt app is running!');

  //get all systems, get all projects, get all actions

  //get all user's who are member of app/channel
  //get all user's who have PTO on current day
  //get all 


})();

app.event('app_home_opened', async ({ event, client, body, context }) => {

  activeUsers[event.user] = [];
  console.log(activeUsers);
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
        blocks: getBlocksForUser(event)
      }
    });
  }
  catch (error) {
    console.error(error);
  }
});
app.action('!addTime', async ({ ack, client, body, logger }) => {
  try {
    await ack();
    const result = await client.views.open({

      trigger_id: body.trigger_id,
      // View payload
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'view_add',
        title: {
          type: 'plain_text',
          text: 'Add some time'
        },
        blocks: [
          {
            "type": "input",
            "dispatch_action": true,
            "element": {
              "type": "static_select",
              "action_id": "!textSystem",
              "placeholder": {
                "type": "plain_text",
                "text": "Select a System"
              },
              "options": [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "*this is plain_text text*"
                  },
                  "value": "value-0"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "*this is plain_text text*"
                  },
                  "value": "value-1"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "*this is plain_text text*"
                  },
                  "value": "value-2"
                }
              ]
            },
            "label": {
              "type": "plain_text",
              "text": "System"
            }
          },
          {
            "type": "input",
            "dispatch_action": true,
            "element": {
              "type": "static_select",
              "action_id": "!textProject",
              "placeholder": {
                "type": "plain_text",
                "text": "Select a Project"
              },
              "options": [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "*this is plain_text text*"
                  },
                  "value": "value-0"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "*this is plain_text text*"
                  },
                  "value": "value-1"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "*this is plain_text text*"
                  },
                  "value": "value-2"
                }
              ]
            },
            "label": {
              "type": "plain_text",
              "text": "Project"
            }
          },
          {
            "type": "input",
            "dispatch_action": true,
            "element": {
              "type": "static_select",
              "action_id": "!textAction",
              "placeholder": {
                "type": "plain_text",
                "text": "Select a Action"
              },
              "options": [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "*this is plain_text text*"
                  },
                  "value": "value-0"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "*this is plain_text text*"
                  },
                  "value": "value-1"
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "*this is plain_text text*"
                  },
                  "value": "value-2"
                }
              ]
            },
            "label": {
              "type": "plain_text",
              "text": "Action"
            }
          },
          {
            type: 'input',
            optional: false,
            label: {
              type: 'plain_text',
              text: 'Hours:'
            },
            element: {
              type: 'plain_text_input',
              multiline: false
            },
          },
          {
            type: 'input',
            block_id: 'block_inputurl',
            optional: true,
            label: {
              type: 'plain_text',
              text: 'Description:'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'action_desc',
              multiline: true
            }
          }
        ],
        submit: {
          type: 'plain_text',
          text: 'Add'
        }
      }
    });
    console.log(result);
  } catch (error) {
    logger.error(error);
    // handle error
  }
});
app.action('!textSystem', async ({ ack, body, view, logger }) => {
  try {
    await ack();
    console.log(body);
    console.log(body.user.id + " chose a System!");

  } catch (error) {
    logger.error(error);
    // handle error
  }
});
app.action('!textProject', async ({ ack, body, logger }) => {
  try {
    await ack();
    console.log(body.user.id + " chose a Project!");

  } catch (error) {
    logger.error(error);
    // handle error
  }
});
app.action('!textAction', async ({ ack, action, body, logger }) => {
  try {
    await ack();
    console.log(body.user.name + " chose an Action - " + action.selected_option.value);

  } catch (error) {
    logger.error(error);
    // handle error
  }
});
app.event("message", async (event) => {
  console.log("************MESSAGE************");
  if (!event.subtype && !event.bot_id) {
    //console.log(event.event.channel);

    const result = await app.client.chat.postMessage({
      token: process.env.BOT_TOKEN,
      channel: event.event.channel,
      thread_ts: event.event.ts,
      text: "Hello World!"
    });
  }
});


function getBlocksForUser(event) {

  return [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*:wave: Hey <@" + event.user + ">, let's log some time!* "
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "actions",
      "block_id": "actionblock789",
      "elements": [
        {
          "type": "datepicker",
          "action_id": "datepicker123",
          "initial_date": "2022-10-20",
          "placeholder": {
            "type": "plain_text",
            "text": "Select a date"
          }
        },
      ]
    },
    ///Dynamic Items Start///
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "System: *ROL*\nProject: *ROL5*\nAction: *Supporting*\nHours: *2.5*\nDesc: *Researching Sprint Items*"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Edit",
            "emoji": true
          },
          "value": "edit_me_123",
          "action_id": "actionId-321"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Delete",
            "emoji": true
          },
          "style": "danger",
          "value": "delete_me_123",
          "action_id": "actionId-123"
        }
      ]
    },
    ///Dynamic Items END///
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "System: *ROL*\nProject: *ROL5*\nAction: *Researching*\nHours: *2.5*\nDesc: *Researching Sprint Items*"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Edit",
            "emoji": true
          },
          "value": "edit_me_123",
          "action_id": "actionId-321"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Delete",
            "emoji": true
          },
          "style": "danger",
          "value": "delete_me_123",
          "action_id": "actionId-123"
        }
      ]
    },
    {
      "type": "divider"
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Log Some Time"
          },
          "action_id": "!addTime"
        }
      ]
    }
  ];

}



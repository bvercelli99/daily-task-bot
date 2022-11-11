// Require the Bolt package (github.com/slackapi/bolt)
require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./db');

const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.BOT_TOKEN,
  signingSecret: process.env.SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: 'debug',
  socketMode: true
});

let availableSystems = null;
let availableProjects = null;
let availableActions = null;

let activeUsers = {};
let userViewId = "";

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');

  availableSystems = await db.getSystems();
  availableProjects = await db.getProjects();
  availableActions = await db.getActions();

  //get all systems, get all projects, get all actions

  //get all user's who are member of app/channel
  //get all user's who have PTO on current day
  //get all 


})();

app.event('app_home_opened', async ({ event, client, body, context }) => {

  activeUsers[event.user] = [];


  //let dbUser = await db.getEmployeeBySlackId(event.user);
  const a = new Date();
  let stringDate = a.getFullYear() + "-" + (a.getMonth() + 1) + "-" + a.getDate();

  let tasks = await db.getTasksForDateByUserSlackId(stringDate, event.user);

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
        blocks: getBlocksForUser(event.user, tasks, stringDate)
      }
    });
  }
  catch (error) {
    console.error(error);
  }
});
app.view('view_add', async ({ ack, body, view, client, logger }) => {
  // Acknowledge the view_submission request
  await ack();

  //write to db, update current tasks on app_home_opened

  try {
    await client.chat.postMessage({
      channel: body['user']['id'],
      text: "Dude you did it!"
    });
  }
  catch (error) {
    logger.error(error);
  }
});

app.action('!addTime', async ({ ack, client, body, logger }) => {
  try {
    await ack();
    //console.log(availableSystems);
    //console.log(availableProjects);
    //console.log(availableActions);

    const systems = [];
    for (let sys of availableSystems) {
      systems.push({
        "text": {
          "type": "plain_text",
          "text": sys.system_name
        },
        "value": sys.system_id.toString()
      });
    }

    const actions = [];
    for (let act of availableActions) {
      actions.push({
        "text": {
          "type": "plain_text",
          "text": act.action_name
        },
        "value": act.action_id.toString()
      });
    }
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
              "options": systems
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
                    "text": "abc"
                  },
                  "value": "-1"
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
              "options": actions
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

    userViewId = result.view.id;

  } catch (error) {
    logger.error(error);
    // handle error
  }
});
app.action('!textSystem', async ({ ack, action, body, client, logger }) => {
  try {
    await ack();
    console.log(body.user.name + " chose an System - " + action.selected_option.value);
    /*
    "initial_option": {
                "text": {
                    "type": "plain_text",
                    "text": "*this is plain_text text*",
                    "emoji": true
                },
                "value": "value-1"
            },
    */
    //update existing modal view with projects for selected system
    const projBlocks = getProjectBlocksForSystem(parseInt(action.selected_option.value));
    let newBodyBlocks = body.view.blocks;
    newBodyBlocks[1].element.options = projBlocks;

    console.log(newBodyBlocks);
    const result = await client.views.update({
      view_id: userViewId,
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'view_add',
        title: {
          type: 'plain_text',
          text: 'Add some time'
        },
        blocks: newBodyBlocks,//body.view.blocks,
        submit: body.view.submit
      }
    });



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
app.action('!dateChange', async ({ ack, action, client, body, logger }) => {
  try {
    await ack();
    let tasks = await db.getTasksForDateByUserSlackId(action.selected_date, body.user.id);

    console.log(body.user.name + " changed a date - " + action.selected_date);

    const result = await client.views.publish({

      /* the user that opened your app's app home */
      user_id: body.user.id,

      /* the view object that appears in the app home*/
      view: {
        type: 'home',
        callback_id: 'home_view',

        /* body of the view */
        blocks: getBlocksForUser(body.user.id, tasks, action.selected_date)
      }
    });

  } catch (error) {
    logger.error(error);
    // handle error
  }

});


function getBlocksForUser(slackId, tasks, searchDate) {
  let blocks = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*:wave: Hey <@" + slackId + ">, let's log some time!* "
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
          "action_id": "!dateChange",
          "initial_date": searchDate,
          "placeholder": {
            "type": "plain_text",
            "text": "Select a date"
          }
        },
      ]
    }
  ];

  let taskSystem = "";
  let taskProject = "";
  let taskAction = "";

  for (let task of tasks) {
    taskSystem = availableSystems.find(s => s.system_id === task.system_id);
    taskProject = task.project_id ? availableProjects.find(s => s.project_id === task.project_id) : null;
    taskAction = availableActions.find(s => s.action_id === task.action_id);

    console.log(taskSystem.system_name + " " + taskProject.project_name + " " + taskAction.action_name);
    console.log("System: *" + taskSystem.system_name + "*\nProject: *" + taskProject ? taskProject.project_name : '' + "*\nAction: *" + taskAction.action_name + "*\nHours: *" + task.hours + "*\nDesc: *" + task.description + "*");


    blocks.push(
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "System: *" + taskSystem.system_name + "*\nProject: *" + (taskProject ? taskProject.project_name : "") + "*\nAction: *" + taskAction.action_name + "*\nHours: *" + task.hours + "*\nDesc: *" + task.description + "*"
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
      }
    );
  }

  blocks.push(//////add at the end
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
    });


  return blocks;
}

function getProjectBlocksForSystem(systemId) {
  let projs = availableProjects.filter(a => -1 !== a.allowed_systems.indexOf(systemId));
  let projBlocks = [];

  for (let p of projs) {
    projBlocks.push({
      "text": {
        "type": "plain_text",
        "text": p.project_name
      },
      "value": p.project_id.toString()
    })

  }
  return projBlocks;
}



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
let userDialogViewIds = {};
let userHomeViewIds = {};

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

app.event('app_home_opened', async ({ event, client, body, context, logger }) => {

  activeUsers[event.user] = [];

  const a = new Date();
  let stringDate = a.getFullYear() + "-" + (a.getMonth() + 1) + "-" + a.getDate();

  try {
    await refreshHomeViewForUser(client, stringDate, event.user, logger);
  }
  catch (error) {
    console.error(error);
  }
});

app.view('view_add', async ({ ack, body, view, client, logger }) => {
  // Acknowledge the view_submission request
  await ack();
  const system = view['state']['values']['block_system']['!textSystem']['selected_option']["value"];
  const project = (view['state']['values']['block_project']['!textProject']['selected_option'] === null ? null : view['state']['values']['block_project']['!textProject']['selected_option']["value"]);
  const action = view['state']['values']['block_action']['!textAction']['selected_option']["value"];
  const hours = view['state']['values']['block_hours']['action_hours']['value'];
  const desc = view['state']['values']['block_desc']['action_desc']['value'];
  const meta = body.view.private_metadata;
  const taskDate = userHomeViewIds[body.user.id];

  console.log({
    system, project, action, hours, desc, meta, userHomeViewIds
  });

  //write to db, update current tasks on app_home_opened
  let newTaskId = await db.addTaskForSlackUser(body.user.id, parseInt(system), null != project ? parseInt(project) : null, parseInt(action), parseInt(hours), desc, taskDate);
  //let tasks = await db.getTasksForDateByUserSlackId(taskDate, body.user.id);

  try {
    /*
    await client.chat.postMessage({
      channel: body['user']['id'],
      text: "Dude you did it!"
    });
    */
    /* view.publish is the method that your app uses to push a view to the Home tab */

    /*
    const result = await client.views.publish({

      user_id: body.user.id,

      
      view: {
        type: 'home',
        callback_id: 'home_view',        
        blocks: getBlocksForUser(body.user.id, tasks, taskDate)
      }
    });
    */

    await refreshHomeViewForUser(client, taskDate, body['user']['id'], logger);

  }
  catch (error) {
    logger.error(error);
  }
});

app.view('view_edit', async ({ ack, body, view, client, logger }) => {
  // Acknowledge the view_submission request
  await ack();
  const system = view['state']['values']['block_system']['!textSystem']['selected_option']["value"];
  const selectedProjectId = view['state']['values']['block_project']['!textProject']['selected_option'];
  const project = (selectedProjectId === null ? null : (selectedProjectId["value"] === '-1' ? null : selectedProjectId["value"]));
  const action = view['state']['values']['block_action']['!textAction']['selected_option']["value"];
  const hours = view['state']['values']['block_hours']['action_hours']['value'];
  const desc = view['state']['values']['block_desc']['action_desc']['value'];
  const meta = body.view.private_metadata;
  const taskDate = userHomeViewIds[body.user.id];

  try {
    /*
    await client.chat.postMessage({
      channel: body['user']['id'],
      text: "Dude you did it!"
    });
    */
    const taskId = meta.split("_").length > 1 ? parseInt(meta.split("_")[1]) : -1;
    //write to db to edit existing task, update current tasks on app_home_opened
    const updatedTaskId = await db.editTaskForSlackUser(body.user.id, taskId, parseInt(system), null === project ? null : parseInt(project), parseInt(action), parseInt(hours), desc);

    await refreshHomeViewForUser(client, taskDate, body.user.id, logger);

  }
  catch (error) {
    logger.error(error);
  }
});

app.action('!addTime', async ({ ack, client, body, logger }) => {
  try {
    await ack();

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
            "block_id": "block_system",
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
            "optional": true,
            "block_id": "block_project",
            "dispatch_action": false,
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
            "block_id": "block_action",
            "dispatch_action": false,
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
            block_id: 'block_hours',
            optional: false,
            label: {
              type: 'plain_text',
              text: 'Hours:'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'action_hours',
              multiline: false
            },
          },
          {
            type: 'input',
            block_id: 'block_desc',
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
        },
        private_metadata: "adding"
      },
    });

    //
    userDialogViewIds[body.user.id] = result.view.id;
    console.log(userDialogViewIds);

  } catch (error) {
    logger.error(error);
    // handle error
  }
});
app.action('!textSystem', async ({ ack, action, body, client, logger }) => {
  try {
    await ack();

    //update existing modal view with projects for selected system
    const projBlocks = getProjectBlocksForSystem(parseInt(action.selected_option.value));
    let newBodyBlocks = body.view.blocks;
    newBodyBlocks[1].element.options = projBlocks;

    //TODO find way on system change, clear previous project if one was selected
    //body.view['state']['values']['block_project']['!textProject']['selected_option'] = null;

    const adding = body.view.private_metadata === "adding";

    const result = await client.views.update({
      view_id: userDialogViewIds[body.user.id], //update last used viewId store for user
      view: {
        type: 'modal',
        // View identifier
        callback_id: adding ? 'view_add' : 'view_edit',
        title: {
          type: 'plain_text',
          text: adding ? 'Add some time' : 'Edit some time'
        },
        blocks: newBodyBlocks,//body.view.blocks,
        submit: body.view.submit,
        private_metadata: body.view.private_metadata
      }
    });
    userDialogViewIds[body.user.id] = result.view.id;

  } catch (error) {
    logger.error(error);
    // handle error
  }
});
/*
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
*/

app.event("message", async (event) => {
  console.log("************MESSAGE************");
  if (!event.subtype && !event.bot_id) {

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
    userHomeViewIds[body.user.id] = action.selected_date;

  } catch (error) {
    logger.error(error);
    // handle error
  }

});

app.action('!deleteTask', async ({ ack, action, client, body, logger }) => {
  try {
    await ack();

    const num = await db.deleteTaskForSlackUser(body.user.id, parseInt(action.value));

    const taskDate = userHomeViewIds[body.user.id];

    await refreshHomeViewForUser(client, taskDate, body.user.id, logger);
  }
  catch (error) {

  }

});

app.action('!editTask', async ({ ack, action, client, body, logger }) => {
  try {
    await ack();

    const userTask = await db.getTaskByTaskId(body.user.id, parseInt(action.value));
    const taskDate = userHomeViewIds[body.user.id];
    const projBlocks = getProjectBlocksForSystem(userTask.system_id);
    console.log(userTask);

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
        callback_id: 'view_edit',
        title: {
          type: 'plain_text',
          text: 'Add some time'
        },
        blocks: [
          {
            "type": "input",
            "block_id": "block_system",
            "dispatch_action": true,
            "element": {
              "type": "static_select",
              "action_id": "!textSystem",
              "placeholder": {
                "type": "plain_text",
                "text": "Select a System"
              },
              "options": systems,
              "initial_option": {
                "text": {
                  "type": "plain_text",
                  "text": -1 != userTask.system_id ? availableSystems.find(a => a.system_id === userTask.system_id).system_name : "<None>"
                },
                "value": -1 != userTask.system_id ? availableSystems.find(a => a.system_id === userTask.system_id).system_id.toString() : "-1"
              }
            },
            "label": {
              "type": "plain_text",
              "text": "System"
            }
          },
          {
            "type": "input",
            "optional": true,
            "block_id": "block_project",
            "dispatch_action": false,
            "element": {
              "type": "static_select",
              "action_id": "!textProject",
              "placeholder": {
                "type": "plain_text",
                "text": "Select a Project"
              },
              "options": projBlocks,
              "initial_option": {
                "text": {
                  "type": "plain_text",
                  "text": null != userTask.project_id ? availableProjects.find(a => a.project_id === userTask.project_id).project_name : "<None>"
                },
                "value": null != userTask.project_id ? availableProjects.find(a => a.project_id === userTask.project_id).project_id.toString() : "-1"
              }
            },
            "label": {
              "type": "plain_text",
              "text": "Project"
            }
          },
          {
            "type": "input",
            "block_id": "block_action",
            "dispatch_action": false,
            "element": {
              "type": "static_select",
              "action_id": "!textAction",
              "placeholder": {
                "type": "plain_text",
                "text": "Select a Action"
              },
              "options": actions,
              "initial_option": {
                "text": {
                  "type": "plain_text",
                  "text": availableActions.find(a => a.action_id === userTask.action_id).action_name
                },
                "value": availableActions.find(a => a.action_id === userTask.action_id).action_id.toString()
              }
            },
            "label": {
              "type": "plain_text",
              "text": "Action"
            }
          },
          {
            type: 'input',
            block_id: 'block_hours',
            optional: false,
            label: {
              type: 'plain_text',
              text: 'Hours:'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'action_hours',
              multiline: false,
              initial_value: userTask.hours.toString()
            },
          },
          {
            type: 'input',
            block_id: 'block_desc',
            optional: true,
            label: {
              type: 'plain_text',
              text: 'Description:'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'action_desc',
              multiline: true,
              initial_value: userTask.description ? userTask.description : ""
            }
          }
        ],
        submit: {
          type: 'plain_text',
          text: 'Edit'
        },
        private_metadata: "editing_" + action.value
      },
    });


    //await refreshHomeViewForUser(client, taskDate, body.user.id, logger);
  }
  catch (error) {

  }

});



function getBlocksForUser(slackId, tasks, searchDate) {
  let blocks = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": ":wave: Hey *<@" + slackId + ">*, let's log some time!"
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
  const taskBlocks = [];
  let dailyHours = 0;
  let task;

  for (let i = 0; i < tasks.length; i++) {
    //for (let task of tasks) {
    task = tasks[i];
    taskSystem = availableSystems.find(s => s.system_id === task.system_id);
    taskProject = task.project_id ? availableProjects.find(s => s.project_id === task.project_id) : null;
    taskAction = availableActions.find(s => s.action_id === task.action_id);

    //console.log(taskSystem.system_name + " " + taskProject.project_name + " " + taskAction.action_name);
    //console.log("System: *" + taskSystem.system_name + "*\nProject: *" + taskProject ? taskProject.project_name : '' + "*\nAction: *" + taskAction.action_name + "*\nHours: *" + task.hours + "*\nDesc: *" + task.description + "*");
    dailyHours += task.hours;

    taskBlocks.push(
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
            "value": task.task_id.toString(),
            "action_id": "!editTask"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Delete",
              "emoji": true
            },
            "style": "danger",
            "value": task.task_id.toString(),
            "action_id": "!deleteTask"
          }
        ]
      }
    );

    if (i === tasks.length - 1) {
      taskBlocks.push({
        "type": "divider"
      });
    }

  }

  //daily hours
  blocks.push({
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "Daily Hours: *" + dailyHours + "*"
    }
  },
    {
      "type": "divider"
    });

  //all tasks
  blocks = blocks.concat(taskBlocks);

  //////add at the end
  blocks.push(
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

  if (projs.length > 0) {

    for (let p of projs) {
      projBlocks.push({
        "text": {
          "type": "plain_text",
          "text": p.project_name
        },
        "value": p.project_id.toString()
      })

    }
  }
  projBlocks.push({
    "text": {
      "type": "plain_text",
      "text": "<None>"
    },
    "value": '-1'
  });

  return projBlocks;
}

async function refreshHomeViewForUser(client, selectedDate, userId, logger) {
  try {
    let tasks = await db.getTasksForDateByUserSlackId(selectedDate, userId);

    const result = await client.views.publish({

      /* the user that opened your app's app home */
      user_id: userId,

      /* the view object that appears in the app home*/
      view: {
        type: 'home',
        callback_id: 'home_view',

        /* body of the view */
        blocks: getBlocksForUser(userId, tasks, selectedDate)
      }
    });
    userHomeViewIds[userId] = selectedDate;

  } catch (error) {
    logger.error(error);
    // handle error
  }

}


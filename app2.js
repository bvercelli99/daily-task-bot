require('dotenv').config({ path: __dirname + '/.env' })
const express = require("express")

const app = express()
const PORT = process.env.PORT || 3000


const token = process.env.BOT_TOKEN
const eventsApi = require('@slack/events-api')
const slackEvents = eventsApi.createEventAdapter(process.env.SIGNING_SECRET)
const { WebClient, LogLevel } = require("@slack/web-api");
const client = new WebClient(token, {
  logLevel: LogLevel.DEBUG
});
app.use('/', slackEvents.expressMiddleware())

slackEvents.on("message", async (event) => {
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
slackEvents.on("app_home_opened", async (event) => {
  //console.log(app.client.users.identity);
  console.log('app_home_opened for:' + event);
});
app.action

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`)
})

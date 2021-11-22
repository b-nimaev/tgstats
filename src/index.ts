// Прокси
import * as localtnl from './utils/serv-loc'
import * as express from "express"

const app = express()

// Телеграф
import { session } from 'telegraf'
import { Telegraf } from 'telegraf'
import { context } from "./utils/context"
import controller from './controller/index'

// Переменные окружения
import * as dotenv from 'dotenv'

dotenv.config();
let token = process.env.BOT_TOKEN;

if (token === undefined) {
    throw new Error('Токен не действителен')
}

const bot = new Telegraf<context>(token)
bot.use(session())
bot.use(controller.middleware())
const secretPath = `/path/${bot.secretPathComponent()}`;
if (process.env.mode === "development") {
    localtnl.getTunnel().then(url => {
        bot.telegram.setWebhook(`${url}${secretPath}`)
    })
} else {
    bot.telegram.setWebhook(`https://tgstat.say-an.ru${secretPath}`)
}
app.use(bot.webhookCallback(secretPath))
app.listen(80, () => {
    console.log('Example app listening on port 80!')
})

// Прокси
import * as localtunnel from 'localtunnel'
import * as express from "express"

// Телеграф
import {Telegraf, session } from 'telegraf'
import { context } from "./types"
import controller from './controller'

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

// Define webhook >> Launch server on 80 port
const secretPath = `/sq/${bot.secretPathComponent()}`;
if (process.env.mode === "development") {
    localtunnel({ port: 80 }).then(url => {
        bot.telegram.setWebhook(`${url}${secretPath}`)
    })
} else {
    bot.telegram.setWebhook(`https://tgstat.say-an.ru${secretPath}`)
}

const app = express()
app.use(bot.webhookCallback(secretPath))
app.listen(80, () => {
    console.log('Telegram bot launched')
})

// Прокси
import * as localtunnel from 'localtunnel'
import * as express from "express"

// Телеграф
import {Telegraf, Context, Scenes, session } from 'telegraf'
import { Chat } from 'typegram'
import controller from './controller'

// Переменные окружения
import * as dotenv from 'dotenv'

dotenv.config();

interface MyWizardSession extends Scenes.WizardSessionData {
    myWizardSessionProp: number,
}

const bot = new Telegraf<context>(token)

bot.use(session())
bot.use(controller.middleware());

const secretPath = `/sq/${bot.secretPathComponent()}`;

if (process.env.mode === "development") {
    localtunnel({ port: 443 }).then(result => {
        bot.telegram.setWebhook(`${result.url}${secretPath}`)
    })
} else {
    bot.telegram.setWebhook(`//tgstat.say-an.ru${secretPath}`)
}

bot.use(session())
bot.use(controller.middleware());

localtunnel({ port: 443 }).then(result => bot.telegram.setWebhook(`${result.url}${secretPath}`))


app.use(bot.webhookCallback(secretPath))
app.get('/', (req, res) => res.send('Прочь отсюда'))
app.listen(443, () => console.log('Telegram bot launched'))

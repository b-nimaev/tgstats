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

interface MySession extends Scenes.WizardSession<MyWizardSession> {
    mySessionProp: number,
    channel: Chat.GetChat
}

interface context extends Context {
    session: MySession
    scene: Scenes.SceneContextScene<context, MyWizardSession>
    wizard: Scenes.WizardContextWizard<context>
}

const token = process.env.BOT_TOKEN;
const bot = new Telegraf<context>(token)
const app = express()
const secretPath: string = `/${bot.secretPathComponent()}/`

if (token === undefined) {
    throw new Error('Токен не действителен')
}

bot.use(session())
bot.use(controller.middleware());

localtunnel({ port: 443 }).then(result => bot.telegram.setWebhook(`${result.url}${secretPath}`))


app.use(bot.webhookCallback(secretPath))
app.get('/', (req, res) => res.send('Прочь отсюда'))
app.listen(443, () => console.log('Telegram bot launched'))

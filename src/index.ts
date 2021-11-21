// Прокси
import * as localtnl from './utils/serv-loc'
import express from 'express'
const app = express()

// Телеграф
import { session } from 'telegraf'
import { Telegraf, Markup, } from 'telegraf'
import { context } from "./utils/context"
import controller from './controller/index'

// Логика


// Переменные окружения
import * as dotenv from 'dotenv'

dotenv.config();
let token = process.env.BOT_TOKEN

/*
    let insertOrUpdate = async function (ctx: context) {
        await client.connect()
        console.log(ctx.session.channel)

        let collection = await client.db("tgstats").collection("channels")
        let result = await collection.findOne({ id: ctx.session.channel['id'] })

        let message = ctx.update['message'],
            message_id = message.message_id

        if (!result) {
            return await collection.insertOne(ctx.session.channel).then(async () => {
                await client.close()
                await ctx.telegram.editMessageText(message.chat.id, message_id, `${message_id}`, 'Канал добавлен', { ...back })
            }).catch(async (err) => {
                await ctx.telegram.editMessageText(message.chat.id, message_id, `${message_id}`, 'Непредвиденная ошибка', { ...back })
            })
        }

        await client.close()
        return await ctx.telegram.editMessageText(message.chat.id, message_id, `${message_id}`, 'Канал существует', { ...back })
    }
*/

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

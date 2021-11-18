// Прокси
import * as localtnl from './utils/serv-loc'
import express from 'express'
const app = express()

// Телеграф
import { session } from 'telegraf'
import { Telegraf, Markup, } from 'telegraf'
import { context } from "./utils/context"

// Логика


// Переменные окружения
import * as dotenv from 'dotenv'
import controller from './controller'
import { Update, Message } from 'typegram'

dotenv.config();

let uri: String = <string>process.env.DB_CONN_STRING;
let bot_id = 1031007063,
    token = process.env.BOT_TOKEN

const { MongoClient } = require("mongodb");
const client = new MongoClient(uri);

let back = Markup.inlineKeyboard([
    Markup.button.callback('Назад', 'back')
])


async function channels (ctx: context) {
    await client.connect()
    let documents = await client.db("tgstats").collection("channels").find()
    let cursor = await documents.toArray()
    let count = await documents.count()
    await client.close()
    
    var keyboard: any = {
        'reply_markup': {
            'inline_keyboard': []
        }
    }

    if (count) {
        for (let index = 0; index < cursor.length; index++) {
            keyboard.reply_markup.inline_keyboard.push([{
                text: cursor[index].title,
                callback_data: 'link' + cursor[index].id,
                hide: false
            }])
        }
    }

    keyboard.reply_markup.inline_keyboard.push([
        {
            text: 'Добавить канал',
            callback_data: 'newchannel'
        },
        {
            text: '🏠 Домой',
            callback_data: 'home'
        }
    ])
    return keyboard
}

let insertOrUpdate = async function (ctx: context, value: (Update.Edited & Message.TextMessage)) {
    await client.connect()
    console.log(ctx.session.channel)

    let collection  =   await client.db("tgstats").collection("channels")
    let result      =   await collection.findOne({
                            id: ctx.session.channel['id']
                        })

    if (!result) {
        return await collection.insertOne(ctx.session.channel).then(async () => {
            await client.close()
            await ctx.telegram.editMessageText(value.chat.id, value.message_id, `${value.message_id}`, 'Канал добавлен', { ...back })
        }).catch(async (err) => {
            await ctx.telegram.editMessageText(value.chat.id, value.message_id, `${value.message_id}`, 'Непредвиденная ошибка', { ...back })
        })
    }

    await client.close()
    return await ctx.telegram.editMessageText(value.chat.id, value.message_id, `${value.message_id}`, 'Канал существует', { ...back })
}

let new_admin = async function (ctx: context) {
    await client.connect()
    
    if (!await client.db("tgstats").collection("admins").find({ id: ctx.update['message'].from.id }).count()) {
        await client.db("tgstats").collection("admins").insertOne(ctx.update['message'].from)
        await client.close()
        return true
    } else {
        await client.close()
        return false
    }
}

let is_user = async function (ctx: context) {

    await client.connect()
    let collection      = await client.db("tgstats").collection("users"),
        document        = await collection.findOne({id: ctx.update['message'].from.id})        

    await client.close()
    if (document.trust) {
        return document
    } else {
        return null
    }
}

let send_connect = async function (ctx: context) {
    
    await client.connect()

    let collection      = await client.db("tgstats").collection("users"),
        document        = await collection.findOne({ id: ctx.update['from'].id })

    await client.close()
    await is_user(ctx).then(async data => {
        ctx.answerCbQuery()
        ctx.scene.enter('user')
    })


    let insert      = ctx.update['callback_query'].from
    insert.trust    = false

    await collection.insertOne(insert).then(async (res: any) => {
        await client.close()
        await ctx.answerCbQuery(res)
    }).catch(async (err) => {
        console.log(err)
        await ctx.answerCbQuery(err.discription)
    })
    return true
}

let participant = async function (ctx: context) {

    await client.connect()
    let db      = await client.db("tgstats"),
        admin   = db.collection("admins"),
        user    = db.collection("users")

    if (typeof(ctx.update['message']) !== 'undefined') {

        let document    = await admin.findOne({ id: ctx.update['message'].from.id })

        if ( document ) {
            return 'admin'
        } else {
            let document = await user.findOne({ id: ctx.update['message'].from.id })

            if (document) {
                return 'user'
            }

            return false
        }
    }

    if (typeof(ctx.update['callback_query'])) {

        let foo = await admin.findOne({ id: ctx.update['callback_query'].message.from.id }),
            bar = await user.findOne({ id: ctx.update['callback_query'].message.from.id })
        
        if (foo) {
            return 'admin'
        }

        if (bar) {
            return 'user'
        }

        return false
    }

    return undefined
}

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

export { participant, channels, insertOrUpdate, new_admin, is_user, send_connect }
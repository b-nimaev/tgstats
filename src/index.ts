// Прокси
import * as localtnl from './utils/serv-loc'
import express from 'express'
const app = express()

// Телеграф
import { Context, session } from 'telegraf'
import { Telegraf, Scenes, Markup, Composer } from 'telegraf'
import { context } from "./utils/context"

// Логика


// Переменные окружения
import * as dotenv from 'dotenv'
import { controller } from './controller'

dotenv.config();

let uri: String = <string>process.env.DB_CONN_STRING;
let bot_id = 1031007063,
    token = process.env.BOT_TOKEN

const { MongoClient } = require("mongodb");
const client = new MongoClient(uri);

export let channels = async function (ctx: context) {
    let greeting = `Секция: Каналы`

    await client.connect()
    let documents = await client.db("tgstats").collection("channels").find()
    let count = await documents.count()
    await client.close()
    
    if (count == 0) {    
        return false
    } else {
        var keyboard: any = {
            'reply_markup': {
                'inline_keyboard': []
            }
        }
        documents.toArray().forEach(async (element: any) => {
            keyboard.reply_markup.inline_keyboard.push([{
                text: element.title,
                callback_data: 'link' + element.id,
                hide: false
            }])
        })
        return await ctx.editMessageText(greeting, keyboard)
    }
}

export let new_admin = async function (ctx: context) {
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

export let is_user = async function (ctx: context) {

    // let update = null
    var value: string    
    if (ctx.update['callback_query']) {
        value = 'callback_query'        
    } else {
        value = 'message'
    }

    await client.connect()
    let collection  = await client.db("tgstats").collection("users"),
        document      = await collection.findOne({id: ctx.update[`${value}`].from.id})        

    await client.close()

    if (document) {
        if (document.trust) {
            return true
        } else {
            return false
        }
    }

    return false
}

export let send_connect = async function (ctx: context) {
    
    await client.connect()

    let collection      = await client.db("tgstats").collection("users"),
        document        = await collection.findOne({ id: ctx.update['callback_query'].from.id })

    await client.close()
    
    if (await is_user(ctx)) {
        ctx.answerCbQuery()
        return ctx.scene.enter('user')
    }

    if (document) {
        return ctx.answerCbQuery('Ваша заявка у админа')
    }

    let insert      = ctx.update['callback_query'].from
    insert.trust    = false
    await collection.insertOne(insert).then(async (res: any) => {
        ctx.answerCbQuery(res)
        await client.close()
    })
    return true
}

export let participant = async function (ctx: context) {
    await client.connect();
    let db = await client.db("tgstats"),
        admin_collection = db.collection("admins"),
        is_admin = await admin_collection.find({ id: ctx.update['message'].from.id }).count()

    await client.close()
    
    if (is_admin) {
        return 'admin'
    } else if (await is_user(ctx)) {
        return 'user'
    } else {
        return false
    }
}

if (token === undefined) {
    throw new Error('Токен не действителен')
}

const bot = new Telegraf<context>(token)
bot.use(session())
bot.use(controller.middleware())
const secretPath = `/secret-path/${bot.secretPathComponent()}`;
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
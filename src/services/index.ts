import { Db, MongoClient } from "mongodb"
import { config } from "dotenv"
import { Markup } from "telegraf"

import { context } from "../types"
import { Chat } from "telegraf/typings/core/types/typegram"
import { text } from "stream/consumers"

config()

let uri = <string>process.env.DB_CONN_STRING
let keys = {
    'back': { text: '« Назад', callback_data: 'back' },
    'inbox': { text: `Входящие`, callback_data: 'inbox' },
    'newmanager': { text: 'Добавить менеджера', callback_data: 'newmanager' },
    'stats': { text: 'Статистика', callback_data: 'stats' },
}

let back = Markup.inlineKeyboard([
    Markup.button.callback('Назад', 'back')
])

const client = new MongoClient(uri)

export const connect = async () => {

    let client = new MongoClient(uri)
    
    try {

        return await client.connect().then((connection) => { return connection.db("tgstats") })
    
    } catch (err) {
        // return err
        console.log(err)
        return err
    }

}

export const checkUser = async function (ctx: context) {

    try {
        
        await client.connect();
        
        await client.db("tgstats").collection("admins").findOne({ id: ctx.message.from.id }).then(async (result) => {
            if (result) {
                return ctx.scene.enter("admin")
            } else {
                await client.db("tgstats").collection("users").findOne({ id: ctx.message.from.id }).then(async (doc) => {
                    if (doc) {
                        if (doc.trust) {
                            return ctx.scene.enter("user")
                        } else {
                            await client.db("tgstats").collection("users").insertOne(ctx.message.from).then(() => {
                                ctx.reply("Ваша заявка на рассмотрении, ожидайте")
                            }, err => {
                                ctx.reply("Вышла ошибочка")
                            })
                        }
                    }
                })
            }
        })
        
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

const upsertChannel = async (channel: Chat.ChannelGetChat) => {
    try {
        return await connect().then(async (Db: Db) => {
            return await Db.collection("channels").findOne({ id: channel.id }).then(async (document) => {
                if (document) {
                    console.log(`Документ существует ${document.username}`)
                    return 'Документ существует'
                } else {
                    await Db.collection("channels").insertOne(channel).then((document) => {
                        console.log(`New Channel created - ${document.insertedId}!`)
                        return 'Документ создан'
                    })
                }
            })       
        })
    } catch (err) {
        console.log(err)
    }
}

export async function getUsers () {

    return await connect().then(async (Db: Db) => {
        
        let cursor = await Db.collection("users").find({ trust: true }).toArray()
        let keyboardOnSceneOfUsers = {
            'reply_markup': {
                'inline_keyboard': [
                    [keys.stats, keys.newmanager],
                    [keys.back, keys.inbox]
                ]
            }
        }

        if (cursor.length > 0) {
            for (let index = 0; index < cursor.length; index++ ) {
                keyboardOnSceneOfUsers.reply_markup.inline_keyboard.push([{
                    text: cursor[index].first_name,
                    callback_data: "user" + cursor[index].id
                }])
            }
        }

        return keyboardOnSceneOfUsers
    })
}

export const channelRender = async function (ctx: context) {

    let chat: any

    if (ctx.message) {
        chat = ctx.session.single
    } else {
        if (!ctx.session.single) {
            chat = await ctx.telegram.getChat("@" + ctx.update['callback_query']['data'].replace(/link/g, ''))
        }
    }

    ctx.session.single = chat
    
    let message = `Секция: Канал \n\n`

    message += `<b>Title</b>: <code> ${chat['title']}</code>\n`
    message += `<b>Username</b>: <code> @${chat['username']}</code>\n`
    message += `<b>ID</b>: <code> ${chat.id}</code>\n`
    message += `<b>Description</b>: <code> ${chat['description']}</code>`

    let keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback('Ссылки', 'links'),
            Markup.button.callback('Менеджеры', 'managers')
        ],
        [
            Markup.button.callback('« Назад', 'back'),
            Markup.button.callback('⚙️ Настройки', 'settings')
        ]
    ])

    if (ctx.message) {
        ctx.reply(message, { parse_mode: 'HTML', ...keyboard })
    } else {
        ctx.editMessageText(message, { parse_mode: 'HTML', ...keyboard })
        ctx.answerCbQuery()
    }

}
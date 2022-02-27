import { Db, MongoClient } from "mongodb"
import { config } from "dotenv"
import { Markup } from "telegraf"

import { context } from "./types"
import { Chat, ChatFromGetChat } from "telegraf/typings/core/types/typegram"

config()
const dbname = "tgstats"
const users = "users"
const admins = "admins"
const channels = "channels"

let uri = <string>process.env.DB_CONN_STRING
const client = new MongoClient(uri)
async function run () {
    try {
        await client.connect()
        console.log('Connected to db!')
    } catch (error) {
        console.log(error)
    }
}
run()

// Создание ссылки на подлючение
const Database = client.db("tgstatz")
const CollectionOfChannels = Database.collection("channels")
const CollectionOfUsers = Database.collection("users")

async function upsertChannel (Channel: Chat.ChannelGetChat) {
    try {

        if (!CollectionOfChannels.findOne({ id: Channel.id })) {
            await CollectionOfChannels.insertOne(Channel).then(result => {
                console.log(result)
            })
        }

    } catch (err) {
        console.log(err)
    }
}

async function GetKeyboardManagersScene(ctx: context) {
    
    let message     =   'Секция: Менеджеры \n'
    let cursor      =   await CollectionOfUsers.find({ trust: true }).toArray()
    let keys        =   {
                            'back':         { text: '« Назад',              callback_data: 'back'       },
                            'inbox':        { text: `Входящие`,             callback_data: 'inbox'      },
                            'newmanager':   { text: 'Добавить менеджера',   callback_data: 'newmanager' },
                            'stats':        { text: 'Статистика',           callback_data: 'stats'      }
                        }

    let keyboard    =   { 'reply_markup': { 'inline_keyboard': [[keys.stats, keys.newmanager], [keys.back, keys.inbox]] } }

    if (cursor.length > 0) {
        for (let index = 0; index < cursor.length; index++) {
            keyboard.reply_markup.inline_keyboard.push([{
                text: cursor[index].first_name,
                callback_data: "user" + cursor[index].id
            }])
        }
    }

    try {
        await ctx.editMessageText(message, keyboard)
    } catch {
        await ctx.reply(message, keyboard)
    }
}

async function ChatGet (ctx: context) {
    let chat: any
    try {
        chat = ctx.telegram.getChat("@" + ctx.update['callback_query']['data'].replace(/link/g, ''))
        ctx.session.single = chat
    } catch {
        chat = await ctx.session.single
    }

    
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

    try {
        ctx.editMessageText(message, { parse_mode: 'HTML', ...keyboard })
        ctx.answerCbQuery()
    } catch {
        ctx.reply(message, { parse_mode: 'HTML', ...keyboard })
    }

}

async function inbox (ctx: context) {

    let documents = CollectionOfUsers.find({ trust: false })
    let cursor = await documents.toArray()
    let count = await documents.count()
    
    let table: string
    let keyboard: any = {
        'reply_markup': {
            'inline_keyboard': []
        }
    }

    if (count) {

        for (let index = 0; index < cursor.length; index++) {
            let user = cursor[index]
            table = `${table}${index + 1}) <b>ID ${user.id}</b>`
            if (user.username) {
                table += ` / <b> @${user.username}</b>`
            }
            if (user.first_name) {
                table += `\n<b>Имя: ${user.first_name}</b>`
            }
            if (user.last_name) {
                table += ` <b>${user.last_name}</b>`
            }
            if (user.phone) {
                table += ` / <b>phone ${user.phone}</b> \n`
            }
            let data = { text: cursor[index].first_name, callback_data: 'link' + cursor[index].id }
            keyboard.reply_markup.inline_keyboard.push([data])
        }

        console.log(table)
    }

    let keys = [
        { text: '« Назад', callback_data: 'back' },
        { text: 'Пригласить', callback_data: 'invite' }
    ]

    keyboard.reply_markup.inline_keyboard.push([keys[0], keys[1]])

    try {
        await ctx.editMessageText(`Входящие заявки \n\n ${table} \n\n <b><u>ID пользователя всегда доступен, в отличие от других персональных данных</u></b>`, { parse_mode: 'HTML', ...keyboard }).then(async () => {
            await ctx.answerCbQuery(`Получено ${count} заявок`)
        })
    } catch (err) {
        await ctx.reply(`Входящие заявки \n\n ${table} \n\n <b><u>ID пользователя всегда доступен, в отличие от других персональных данных</u></b>`, { parse_mode: 'HTML', ...keyboard })
    } finally {
        return ctx.wizard.selectStep(1)
    }
}

async function CheckUser (ctx: context) {
    await client.db(dbname).collection(users).findOne({ id: ctx.from.id }).then(async (result) => {
        if (result === null) {
            await client.db(dbname).collection(admins).findOne({ id: ctx.from.id }).then(async (result) => {
                if (result === null) {
                    console.log(ctx.from)
                    ctx.reply('You are not a found!', Markup.inlineKeyboard([
                        Markup.button.callback('Register', 'register')
                    ]))
                } else {
                    ctx.scene.enter('admin')
                }
            })
        }
    })
}

async function RegisterUser (ctx: context) {
    try {
        let CheckUser = await client.db(dbname).collection(users).findOne({ id: ctx.from.id })
        
        if (CheckUser) {
            ctx.reply('You already exist')
        } else {
            let data = ctx.from
            console.log(data)
            await client.db(dbname).collection(users).insertOne(ctx.from).then(result => {
                ctx.editMessageText('Your data is recorded \nwait for admin approval')
            })
        }
    } catch (err) {
        console.log(err)
    }
    ctx.answerCbQuery()
}

export { GetKeyboardManagersScene, ChatGet, CheckUser, RegisterUser }
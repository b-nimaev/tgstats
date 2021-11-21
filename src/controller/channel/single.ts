import * as dotenv from 'dotenv'
import { Composer, Markup } from 'telegraf';
import { chat, context } from '../../utils/context';

dotenv.config();
let single = new Composer<context>()

let uri: String = <string>process.env.DB_CONN_STRING;
const { MongoClient } = require("mongodb");
const client = new MongoClient(uri);

export async function singleChannel (ctx: context) {
    await client.connect()
    let username = (ctx.update['callback_query']['data'].replace(/link/g, ''))
    return await client.db("tgstats").collection('channels').findOne({ username: username }).then(async (channels: chat) => {        
        let message = `Секция: Канал \n\n`
        message += `<b>Title</b>: <code> ${channels.title}</code>\n`
        message += `<b>Username</b>: <code> @${channels.username}</code>\n`
        message += `<b>ID</b>: <code> ${channels.id}</code>\n`
        message += `<b>Description</b>: <code> ${channels.description}</code>`
        ctx.wizard.selectStep(2)

        let keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('Ссылки', 'links'),
                Markup.button.callback('⚙️ Настройки', 'settings')
            ],
            [Markup.button.callback('Назад', 'back')]
        ])

        return await ctx.editMessageText(message, { parse_mode: 'HTML', ...keyboard }).then(async (result) => {
            await ctx.answerCbQuery()
            await client.close()
        })
    })
}

export default single

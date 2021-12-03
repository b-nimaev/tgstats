import * as dotenv from 'dotenv'
import { Composer, Markup } from 'telegraf';
import { context } from '../../types';

dotenv.config();
let uri = <string>process.env.DB_CONN_STRING;

const single = new Composer<context>()

import { MongoClient } from "mongodb";
const client = new MongoClient(uri);

export async function singleChannel (ctx: context) {
    await client.connect()

    if (ctx.message) {
        await singleChannel(ctx)
    }

    let username = (ctx.update['callback_query']['data'].replace(/link/g, ''))
    await client.db("tgstats").collection('channels').findOne({ username: username }).then(async (channels) => {
        let message = `Секция: Канал \n\n`
        message += `<b>Title</b>: <code> ${channels.title}</code>\n`
        message += `<b>Username</b>: <code> @${channels.username}</code>\n`
        message += `<b>ID</b>: <code> ${channels.id}</code>\n`
        message += `<b>Description</b>: <code> ${channels.description}</code>`
        ctx.wizard.selectStep(2)

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

        return await ctx.editMessageText(message, { parse_mode: 'HTML', ...keyboard }).then(async (result) => {
            await ctx.answerCbQuery()
            await client.close()
        })
    })
}

single.action('links', async (ctx) => {
    ctx.editMessageText('Статистика по ссылкам', Markup.inlineKeyboard([
        Markup.button.callback('« Назад', 'back')
    ]))
})

single.action('managers', async (ctx) => {
    ctx.editMessageText('Менеджеры канала!', Markup.inlineKeyboard([
        Markup.button.callback('« Назад', 'back')
    ]))
})

single.action('links', async (ctx) => {
    ctx.editMessageText('Настройки канала', Markup.inlineKeyboard([
        Markup.button.callback('« Назад', 'back')
    ]))
})

single.on("message", async (ctx) => singleChannel(ctx))

export default single

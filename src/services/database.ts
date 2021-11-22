import * as dotenv from 'dotenv'
import { context } from "../utils/context";

dotenv.config();

import { MongoClient } from "mongodb";
import { Markup } from 'telegraf';
const client = new MongoClient(<string>process.env.DB_CONN_STRING);

let back = Markup.inlineKeyboard([
    Markup.button.callback('Назад', 'back')
])

const isUser = async (ctx: context) => {
    try {
        await client.connect()

        let collection = client.db("tgstats").collection("admins")
        let cursor = await collection.findOne({ id: ctx.message.from.id })

        if (cursor) {
            return ctx.scene.enter("admin")
        }

    } catch (err) {
        console.log(err)
    } finally {
        await client.close()
    }
}

const login = async (ctx: context) => {
    try {
        await client.connect()

        let admin = client.db("tgstats").collection("admins")
        let user = client.db("tgstats").collection("users")
        let cursor = await admin.findOne({ id: ctx.message.from.id })
        let cursor2 = await user.findOne({ id: ctx.message.from.id })

        if (cursor) {
            return ctx.scene.enter("admin")
        }

        if (cursor2) {
            return ctx.scene.enter("user")
        }
    
    } catch (err) {
        console.log(err)
    } finally {
        await client.close() }
}

const upsertChannel = async (ctx: context) => {
    try {
        await client.connect()

        let collection = client.db("tgstats").collection("channels")
        let cursor = await collection.findOne({ id: ctx.session.channel["id"] })

        let item = ctx.update['message']

        if (cursor) {
            return ctx.telegram.editMessageText(item.chat.id, item.message_id, `${item.message_id}`, 'Канал существует!', { ...back })
        }

        collection.insertOne(ctx.session.channel)
        return ctx.telegram.editMessageText(item.chat.id, item.message_id, `${item.message_id}`, `@${ctx.session.channel["username"]}  добавлен!`, { ...back })
    } catch (err) {
        console.log(err)
    } finally {
        await client.close()
    }
}

export { login, upsertChannel }
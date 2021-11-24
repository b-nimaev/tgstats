import { MongoClient } from "mongodb"
import { config } from "dotenv"
import { Markup } from "telegraf"

import { context } from "../types"

config()

let database: MongoClient
let back = Markup.inlineKeyboard([
    Markup.button.callback('Назад', 'back')
])

export const connect = async () => {    
    let uri = <string>process.env.DB_CONN_STRING

    if (database) {
        return
    }

    database = await new MongoClient(uri).connect()
    database.once("open", async () => { console.log("Connected to database") })
    database.on("error", () => { console.log("Error connecting to database") })

    return database
}

export const disconnect = async () => {
    if (!database) { return }
    await database.close()
}

const checUser = async (ctx: context) => {
    try {
        await connect()

        let collection = database.db("tgstats").collection("admins")
        let cursor = await collection.findOne({ id: ctx.message.from.id })

        if (cursor) {
            return ctx.scene.enter("admin")
        }

        

    } catch (err) {
        console.log(err)
    } finally {
        await disconnect()
    }
}

const upsertChannel = async (ctx: context) => {
    try {
        await connect()

        let collection = database.db("tgstats").collection("channels")
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
        await disconnect()
    }
}

async function checkRoot(ctx: context): Promise<Boolean> {
    let user = ctx.message.from
    
    await connect()
    let root = await database.db("tgstats").collection("users").findOne({ id: user.id })

        if (root.trust) {
            return true
        }

        return false
}
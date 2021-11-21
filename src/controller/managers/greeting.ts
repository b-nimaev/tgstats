import * as dotenv from 'dotenv'
import { context } from '../../utils/context';
dotenv.config();

let uri: String = <string>process.env.DB_CONN_STRING;
const { MongoClient } = require("mongodb");
const client = new MongoClient(uri);

export default async function (ctx: context) {
    await client.connect()

    let documents = await client.db("tgstats").collection("users").find({ trust: true })
    let cursor = await documents.toArray()
    let count = await documents.count()

    let inboxCount = await client.db("tgstats").collection("users").find({ trust: false }).count()

    await client.close()

    let text = `Секция: Менеджеры \n`
    var keyboard: any = {
        'reply_markup': {
            'inline_keyboard': []
        }
    }

    if (count) {
        for (let index = 0; index < cursor.length; index++) {
            keyboard.reply_markup.inline_keyboard.push([{
                text: cursor[index].first_name,
                callback_data: 'link' + cursor[index].id,
                hide: false
            }])
        }
    }
    let keys = [
        { text: `Входящие ${inboxCount}`, callback_data: 'inbox' },
        { text: 'Добавить менеджера', callback_data: 'newmanager'},
        { text: 'Статистика', callback_data: 'stats' },
        { text: '🏡 Домой', callback_data: 'home' }
    ]

    keyboard.reply_markup.inline_keyboard.push([keys[0], keys[1]],[keys[2], keys[3]])

    try {
        return await ctx.editMessageText(text, keyboard)
    } catch (err) {
        return await ctx.reply(text, keyboard)
    }
}
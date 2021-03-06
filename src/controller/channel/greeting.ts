import * as dotenv from 'dotenv'
import { context } from '../../types';

dotenv.config();

let uri: string = <string>process.env.DB_CONN_STRING;

import { MongoClient } from "mongodb";
import { channel } from '../../keyboard';
import { Composer } from 'telegraf';

const client = new MongoClient(uri);

export async function greeting (ctx: context) {
    return await client.connect().then(async (client) => {
        await client.db("tgstats").collection("channels").find().toArray().then(async (cursor) => {

            await channel.list(cursor).then(async (message) => {
                if (ctx.message) {
                    return await ctx.reply(message.text, message.keyboard)
                }
                await ctx.editMessageText(message.text, message.keyboard)
            }).finally(async () => {
                await client.close()
            })
        })
    }).catch(err => {
        console.log(err)
        return err
    })
}
export default new Composer<context>()
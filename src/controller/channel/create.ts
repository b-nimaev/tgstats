import * as dotenv from 'dotenv'
import { Composer } from 'telegraf';
import { context } from '../../types';

dotenv.config();
let single = new Composer<context>()
import { cancel } from '../../keyboard'

import { MongoClient } from "mongodb";
const client = new MongoClient(<string>process.env.DB_CONN_STRING);

export default async function (ctx: context) {
    if (ctx.update['message']) {
        return await ctx.telegram.getChat(ctx.update['message'].text).then(async (channels) => {
            await ctx.telegram.getChatMember(channels.id, 1272270574).then(async (member) => {
                ctx.telegram.promoteChatMember(channels.id, member.user.id, {
                    can_manage_chat: true,
                    can_invite_users: true
                }).then(data => {
                    console.log(data)
                }).catch(async (err) => {
                    if (err.response.description == 'Bad Request: USER_NOT_MUTUAL_CONTACT') {
                        return await ctx.reply('Назначьте серверного бота админом вручную. Потому что он ранее покидал Указанный канал.', cancel.back())
                    } else {
                        return await ctx.reply(err.response.description, cancel.back())
                    }
                    console.log(err.response.description)
                })
            }).catch(async (err) => {
                console.log('not a member')
            })
        }).catch(async (err) => {
            console.log(err)
            if (err.response.description == 'Bad Request: chat not found') {
                return ctx.reply('Чат не найден. 404 ошибка.', cancel.back())
            }
            return await ctx.reply(err.response.description)
        })
    }
}
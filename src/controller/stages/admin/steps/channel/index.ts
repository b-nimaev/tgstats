import { Composer, Markup, Scenes } from "telegraf"
import { Chat } from "typegram"
import { insertOrUpdate, channels as list } from "../../../../.."
import { context } from "../../../../../utils/context"

const greeting = async function (ctx: context) {
    let greeting = `Секция: Каналы\n`,
        keyboard = await list(ctx)

    try {
        return await ctx.editMessageText(greeting, keyboard).then(() => { ctx.answerCbQuery() })
    } catch (err) {
        return await ctx.reply(greeting, keyboard)
    }
}

let channels = new Composer<context>()
let createc = new Composer<context>()
let createl = new Composer<context>()

const wizard = new Scenes.WizardScene('channels',
    channels,
    createc,
    createl
)

let back = Markup.inlineKeyboard([
    Markup.button.callback('Назад', 'back')
])

wizard.enter(async (ctx: context) => greeting (ctx))
wizard.action('newchannel', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.editMessageText('Отправьте ссылку на канал в формате @channelusername', Markup.inlineKeyboard([ Markup.button.callback('Отмена', 'back') ]))
    return ctx.wizard.selectStep(1)
})

wizard.action('home', async (ctx) => {
    if (ctx.session.__scenes.current) {
        ctx.prevWizard = ctx.session.__scenes.current
        ctx.scene.enter('home')
    }
})

createc.on('message', async (ctx: context) => {
    return await ctx.telegram.getChat(ctx.update['message'].text).then(async (channels) => {
        await ctx.telegram.getChatMember(channels.id, ctx.update['message'].from.id).then(async (member) => {
            console.log('member')
        }).catch(async (err) => {
            console.log('not a member')
        })
    }).catch(async (err) => {
        console.log(err)
        if (err.response.description == 'Bad Request: chat not found') {
            return ctx.reply('Чат не найден. 404 ошибка.', back)
        }
        return await ctx.reply(err.response.description)
    })

    await ctx.telegram.getChatMember(ctx.update['message'].text, ctx.botInfo.id).then(async (value) => {
        if (value['can_invite_users']) {
            // let invite = await ctx.telegram.createChatInviteLink(ctx.update['message'].text, { name: 'test' })
            await ctx.telegram.promoteChatMember(ctx.update['message'].text, 1272270574, {
                can_invite_users: true
            }).then((async (result) => {
                console.log(result)
                ctx.session.channel = await ctx.telegram.getChat(ctx.update['message'].text)
                await ctx.reply('У вас есть права приглашать участников . . .').then(async (value) => {
                    await ctx.telegram.editMessageText(value.chat.id, value.message_id, `${value.message_id}`, 'Проверка базы данных').then(async () => {
                        await insertOrUpdate(ctx)
                    })
                })
            }))
        } else {
            await ctx.reply('У меня нет прав приглашать участников на этот канал ', back)
        }
    }, async (err) => {
        return await ctx.reply(err.response.description, back)
    })
})

createc.action('back', async (ctx) => {
    ctx.answerCbQuery()
    ctx.wizard.selectStep(0)
    return greeting(ctx)
})

export default wizard
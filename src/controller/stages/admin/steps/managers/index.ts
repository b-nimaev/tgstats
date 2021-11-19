import { Markup, Composer, Scenes } from "telegraf"
import { context } from "../../../../../utils/context"

import inbox from './inbox'
import greeting from './greeting'



let handler = new Composer<context>()
let inner = new Composer<context>()

let invite = async function (ctx) {
    if (ctx.update['message'].text) {
        return ctx.reply(ctx.update['message'].text)
    }
    return await ctx.reply('Отправьте ссылку на пользователя в формате @username', Markup.inlineKeyboard([Markup.button.callback('Назад', 'back')]))
}

let single = new Composer<context>()

const manager = new Scenes.WizardScene('managers', handler, inner, invite, single)

handler.on('message', async (ctx) => await greeting(ctx))
manager.enter(async (ctx: context) => await greeting (ctx))

manager.action('inbox', async (ctx: context) => { await inbox(ctx).then((data) => { return ctx.wizard.selectStep(1) }) })
manager.action('back', async (ctx: context) => { 
    await greeting(ctx)
    await ctx.answerCbQuery()
    return await ctx.wizard.selectStep(0)
})
manager.action('newmanager', async (ctx: context) => {
    await ctx.editMessageText('Отправьте ссылку на пользователя в формате @username', Markup.inlineKeyboard([ Markup.button.callback('Назад', 'back') ]))
    await ctx.answerCbQuery()
    ctx.wizard.selectStep(2)
})

manager.action('home', async (ctx: context) => {
    await ctx.scene.enter('admin')
    await ctx.answerCbQuery()
})

manager.action('stats', async (ctx) => {
    await ctx.answerCbQuery('Заявка отправлена!')
})

inner.on('message', async (ctx) => await inbox(ctx))
inner.action('back', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.wizard.selectStep(0)
    return await greeting(ctx)
})
export default manager
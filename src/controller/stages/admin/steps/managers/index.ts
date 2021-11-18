import { Composer, Markup, Scenes } from "telegraf"
import { context } from "../../../../../utils/context"

let handler = new Composer<context>()
const manager = new Scenes.WizardScene('managers', handler)

const greeting = async function (ctx: context) {
    let greeting = `Секция: Менеджеры \n`,
        keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('Входящие', 'inbox')
            ],
            [
                Markup.button.callback('Добавить менеджера', 'newmanager'),
                Markup.button.callback('Статистика', 'stats'),
                Markup.button.callback('🏠 Домой', 'home')
            ],
        ])

    if (typeof (ctx.update['callback_query']) !== 'undefined') {
        await ctx.editMessageText(greeting, keyboard)
        return ctx.answerCbQuery()
    } else {
        return await ctx.reply(greeting, keyboard)
    }
}

manager.enter(async (ctx: context) => await greeting (ctx))

manager.action('inbox', async (ctx: context) => {
    await ctx.editMessageText('Входящие')
    await ctx.answerCbQuery()
    ctx.wizard.next()
})

manager.action('newmanager', async (ctx: context) => {
    await ctx.editMessageText('Отправьте ссылку на пользователя в формате @username')
    await ctx.answerCbQuery()
    ctx.wizard.next()
})

manager.action('home', async (ctx: context) => {
    await ctx.scene.enter('admin')
    await ctx.answerCbQuery()
})

manager.on('message', async (ctx: context) => await greeting(ctx))

export default manager
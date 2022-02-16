import { Markup, Composer, Scenes } from "telegraf"
import { context } from "../../types"
import { GetKeyboardManagersScene } from '../../services'

let handler = new Composer<context>()
let inner = new Composer<context>()

let invite = async function (ctx: context) {
    if (ctx.update['message'].text) {
        return ctx.reply(ctx.update['message'].text)
    }
    return await ctx.reply('Отправьте ссылку на пользователя в формате @username', Markup.inlineKeyboard([Markup.button.callback('Назад', 'back')]))
}

let single = new Composer<context>()

const manager = new Scenes.WizardScene('managers', handler, inner, invite, single)
handler.on('message', async (ctx) => GetKeyboardManagersScene(ctx))
manager.enter(async (ctx: context) => {
    return await GetKeyboardManagersScene(ctx)
})

manager.action('inbox', async (ctx: context) => { 
    
})

manager.action('newmanager', async (ctx: context) => {
    let text = 'Отправьте ссылку на пользователя в формате @username'
    let keyboard = Markup.inlineKeyboard([Markup.button.callback('Назад', 'back')])

    return await ctx.editMessageText(text, keyboard).then(async (result) => {
        ctx.wizard.selectStep(2)
        await ctx.answerCbQuery(`${result}`)
    })
})

manager.action('back', async (ctx: context) => {
    return await ctx.scene.enter('admin').then(() => {
        ctx.answerCbQuery()
    })
})

manager.action('home', async (ctx: context) => ctx.scene.enter('admin'))

manager.action('stats', async (ctx) => {
    return await ctx.answerCbQuery('Заявка отправлена!')
})

inner.action('back', async (ctx) => {
    await ctx.answerCbQuery()
    ctx.wizard.selectStep(0)
    await GetKeyboardManagersScene(ctx)
})

export default manager
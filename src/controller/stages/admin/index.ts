import { Context, Markup, Scenes } from "telegraf"
import { context } from "../../../utils/context"
import { handler } from './handler'

import { main as home, create, channel as single } from './steps/channel'
let greeting = `Приветствую\n`,
    keyboard = Markup.inlineKeyboard([
        Markup.button.callback('Каналы', 'channels'),
        Markup.button.callback('Менеджеры', 'managers'),
        Markup.button.callback('Статистика', 'stats')
    ])


// WizardScene
const admin = new Scenes.WizardScene('admin', handler, home, create, single)

admin.enter(async (ctx: Context) => {
    if (ctx.update['message'].text == '/start' || ctx.update['message'].text == '/callmeadmin') {
        await ctx.reply(greeting, keyboard)
    } else {
        await ctx.editMessageText(greeting, keyboard)
    }
})

admin.action('home', async (ctx: context) => {
    ctx.answerCbQuery()
    ctx.editMessageText(greeting, keyboard)
    ctx.wizard.selectStep(0)
})

admin.command('home', async (ctx) => {
    await ctx.reply(greeting, keyboard)
})

// Module export
export default admin
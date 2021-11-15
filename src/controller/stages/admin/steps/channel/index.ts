import { Composer, Markup } from "telegraf"
import { context } from "../../../../../utils/context"

var greetingChannel = `Секция: Каналы`,
    markupChannel = [
        [
            Markup.button.callback('Добавить канал', 'appendChannel'),
            Markup.button.callback('🏠 Домой', 'home')
        ]
    ]


// export const main = async (ctx: context) => { }
export const main = new Composer<context>()
main.on('message', async (ctx) => {
    await ctx.reply(greetingChannel, Markup.inlineKeyboard(markupChannel))
})

main.action('appendChannel', async (ctx) => {
    await ctx.wizard.selectStep(2)
})

export const create = async (ctx: context) => { }
export const channel = async (ctx: context) => { }
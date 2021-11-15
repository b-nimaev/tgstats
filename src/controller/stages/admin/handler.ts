import { Composer, Markup } from "telegraf";
import { channels } from "../../..";
import { context } from '../../../utils/context'

let handler = new Composer<context>()
let greeting = `Приветствую\n`,
    keyboard = Markup.inlineKeyboard([
        Markup.button.callback('Каналы', 'channels'),
        Markup.button.callback('Менеджеры', 'managers'),
        Markup.button.callback('Статистика', 'stats')
    ])

var footer = [
    {
        text: 'Добавить канал',
        callback_data: 'newChannel',
        hide: false
    },
    {
        text: '🏠 Домой',
        callback_data: 'home',
        hide: false
    }
]

handler.action('channels', async (ctx: context) => {
    await channels(ctx).then(channels => {
        console.log(channels)
    })
    ctx.wizard.selectStep(1)
    ctx.answerCbQuery()
})

handler.on('message', async (ctx) => {
    ctx.reply(greeting, keyboard)
})

export { handler }
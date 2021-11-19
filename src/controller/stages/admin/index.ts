import { Composer, Context, Markup, Scenes } from "telegraf"
import { bot_id } from "../../.."
import { context } from "../../../utils/context"


import channel from './steps/channel'
import manager from './steps/managers'

let greeting = async function (ctx: context) {
    let text = `Главная\n`,
        keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback('Каналы', 'channels')
            ],
            [
                Markup.button.callback('Менеджеры', 'managers'),
                Markup.button.callback('Статистика', 'stats')
            ]
        ])

    if (typeof (ctx.update['message']) !== 'undefined') {
        await ctx.reply(text, keyboard)
    } else {
        await ctx.editMessageText(text, keyboard)
        ctx.wizard.selectStep(0)
        try {
            return ctx.answerCbQuery()
        } catch (err) {
            return console.log(err)
        }
    }
}

let handler = new Composer<context>()


// WizardScene
const admin = new Scenes.WizardScene('admin', handler)

admin.enter(async (ctx: context) => greeting(ctx))

admin.command('newchannel', async (ctx) => {
    Promise.all([
        await ctx.reply('Отправьте ссылку на канал в формате @channelusername'),
    ]).then(() => {
        ctx.wizard.selectStep(2)
    })
})

admin.action('managers', async (ctx) => {
    await ctx.scene.enter('managers').then(() => { ctx.answerCbQuery() })
})
admin.action('channels', async (ctx) => {
    await ctx.scene.enter('channels').then(() => { ctx.answerCbQuery() })
})
admin.action('stats', async (ctx) => {
    await ctx.telegram.sendMessage(bot_id, 'Выгрузить таблицу').then(() => { ctx.answerCbQuery('Заявка отправлена!') })
})
admin.on('message', async (ctx) => {
    return await greeting(ctx)
})

export { channel, manager }
export default admin
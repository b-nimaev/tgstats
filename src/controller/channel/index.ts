import { Scenes, Markup, Composer } from "telegraf"

import handler, { greeting } from './greeting'
import create from './create'
import single, { singleChannel } from './single'

const channels = new Scenes.WizardScene('channels',
    handler,
    single,
    create
)

handler.on('message', async (ctx) => {
    await greeting(ctx)
})

channels.action(RegExp('link *', 'g'), async (ctx) => {
    await singleChannel(ctx).then(() => {
        ctx.wizard.selectStep(1)
        ctx.answerCbQuery()
    })
})

channels.action('add', async (ctx) => {
    await ctx.editMessageText('Отправьте ссылку на канал в формате @channelusername', Markup.inlineKeyboard([Markup.button.callback('Отмена', 'back')]))
    await ctx.answerCbQuery()
    return ctx.wizard.selectStep(2)
})

channels.enter(async (ctx) => greeting(ctx))
channels.action("back", async (ctx) => greeting(ctx))
channels.action('home', async (ctx) => ctx.scene.enter('admin'))

export default channels
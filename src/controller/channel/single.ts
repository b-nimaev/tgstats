import { Composer, Markup } from 'telegraf';
import { channelRender } from '../../services';
import { context } from '../../types';

const single = new Composer<context>()

single.action('links', async (ctx) => {
    ctx.editMessageText('Статистика по ссылкам', Markup.inlineKeyboard([
        Markup.button.callback('« Назад', 'back')
    ]))
})

single.action('managers', async (ctx) => {
    ctx.editMessageText('Менеджеры канала!', Markup.inlineKeyboard([
        Markup.button.callback('« Назад', 'back')
    ]))
})

single.action('links', async (ctx) => {
    ctx.editMessageText('Настройки канала', Markup.inlineKeyboard([
        Markup.button.callback('« Назад', 'back')
    ]))
})

single.on("message", async (ctx) => {
    await channelRender(ctx)
})

export default single

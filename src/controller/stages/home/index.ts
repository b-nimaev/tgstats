import { Composer, Markup, Scenes } from "telegraf"
import { is_user, new_admin, participant, send_connect } from '../../../index'
import { context } from "../../../utils/context"

const greeting = `Главная страница\n`

// Hanlder
const handler = new Composer<context>()
handler.action('login', async (ctx) => {
    ctx.answerCbQuery()
    /* 
        1. У вас нет доступа. Свяжитесь с админом - @alexandrbnimaev
    */
    if (await is_user(ctx)) {
        await ctx.scene.enter('user')
    }
})

// WizardScene
const home = new Scenes.WizardScene('home', handler
)

// Scene Callbacks
home.enter(async (ctx) => {
    await ctx.reply('Приветствую')
})

home.start(async (ctx: context) => {
    switch (await participant(ctx)) {
        case 'admin':
            ctx.scene.enter('admin');
            break;
        case 'user':
            ctx.scene.enter('user');
            break;
        default:
            await ctx.reply(greeting, Markup.inlineKeyboard([
                Markup.button.callback('Зарегистрироваться', 'register')
            ]))
    }
})

home.leave(async (ctx) => {
    console.log('You are leaved home WizardScene!')
})

home.command('/callmeadmin', async (ctx) => {
    await new_admin(ctx)
    await ctx.scene.enter('admin')
})

home.action('register', async (ctx) => {
    await send_connect(ctx)
})

home.on('message', async (ctx) => {
    await ctx.deleteMessage(ctx.update['message'].message_id-1).then(() => {
        ctx.reply(greeting, Markup.inlineKeyboard([
            Markup.button.callback('Зарегистрироваться', 'register')
        ]))
    })
})

// Module export
export default home
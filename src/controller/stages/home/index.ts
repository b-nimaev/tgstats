import { Composer, Markup, Scenes } from "telegraf"
import { is_user, new_admin, participant } from '../../../index'
import { context } from "../../../utils/context"
import register from "./register"


const handler = new Composer<context>()

async function greeting (ctx: context) {
    let greeting = `Главная страница\n`
    console.log(await participant(ctx))
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
}

// WizardScene
const home = new Scenes.WizardScene('home', handler)

// Scene Callbacks
home.enter(async (ctx) => {
    if (ctx.prevWizard == 'channels') {
        ctx.scene.enter('admin')
    }
})

home.start(async (ctx: context) => {
    greeting(ctx)
})

home.leave(async (ctx) => {
    console.log('You are leaved home WizardScene!')
})

home.command('/callmeadmin', async (ctx) => {
    await new_admin(ctx)
    await ctx.scene.enter('admin')
})

home.action('login', async (ctx) => {
    ctx.answerCbQuery()
    if (await is_user(ctx)) {
        await ctx.scene.enter('user')
    }
})
home.action('register', async (ctx) => {
    ctx.answerCbQuery('Заявка отправлена')
    await register(ctx)
})
home.on('message', async (ctx) => greeting(ctx))
export default home
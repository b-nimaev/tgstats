import { Composer, Scenes } from "telegraf"
import { context } from "../../types"
import keyboard from '../../keyboard'

import * as dotenv from 'dotenv'
dotenv.config();

async function greeting (ctx: context) {
    try {
        await ctx.editMessageText(keyboard.admin.text, keyboard.admin.extra).then(() => {
            ctx.answerCbQuery()
        })
    } catch (err) {
        await ctx.reply(keyboard.admin.text, keyboard.admin.extra)
    }
}

let handler = new Composer<context>()

// WizardScene
const admin = new Scenes.WizardScene('admin', handler)

admin.enter(async (ctx: context) => greeting(ctx))

admin.action('managers', async (ctx) => {
    await ctx.scene.enter('managers').then(() => { 
        ctx.answerCbQuery() 
    })
})

admin.action('channels', async (ctx) => {
    await ctx.scene.enter('channels').then(() => { 
        ctx.answerCbQuery() 
    })
})

admin.action('stats', async (ctx) => {
    await ctx.telegram.sendMessage(parseInt(<string>process.env.BOT_ID), 'Выгрузить таблицу')
    await ctx.answerCbQuery()
})

export default admin
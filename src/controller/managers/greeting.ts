import { context } from '../../types';
import { getUsers } from '../../services';

export default async function (ctx: context) {
    let text = `Секция: Менеджеры \n`
    
    // keyboard.reply_markup.inline_keyboard.push([keys[0], keys[1]],[keys[2], keys[3]])

    return await getUsers().then(async (keyboard) => {
        if (ctx.message) {
            await ctx.reply(text, keyboard)
        } else {
            await ctx.editMessageText(text, keyboard)
            ctx.answerCbQuery()
        }
    }).catch(err => {
        console.log(err)
    })

}
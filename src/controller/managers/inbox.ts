import { context } from "../../types"
import { connect } from "../../services"

export default async (ctx: context) => {

    return await connect().then(async (client) => {
        let documents = client.db("tgstats").collection("users").find({ trust: false })
        let cursor = await documents.toArray()
        let count = await documents.count()
        var table: string = ``
        await client.close()
    
        var keyboard: any = {
            'reply_markup': {
                'inline_keyboard': []
            }
        }
        if (count) {
    
            for (let index = 0; index < cursor.length; index++) {
                let user = cursor[index]
                table = `${table}${index+1}) <b>ID ${user.id}</b>`
                if (user.username) {
                    table += ` / <b> @${user.username}</b>`
                }
                if (user.first_name) {
                    table += `\n<b>Имя: ${user.first_name}</b>`
                }
                if (user.last_name) {
                    table += ` <b>${user.last_name}</b>`
                }
                if (user.phone) {
                    table += ` / <b>phone ${user.phone}</b> \n`
                }
                let data = { text: cursor[index].first_name, callback_data: 'link' + cursor[index].id }
                keyboard.reply_markup.inline_keyboard.push([data])
            }
    
            console.log(table)
        }
    
        let keys = [
            { text: '« Назад', callback_data: 'back' },
            { text: 'Пригласить', callback_data: 'invite' }
        ]
        
        keyboard.reply_markup.inline_keyboard.push([keys[0], keys[1]])

        try {
            await ctx.editMessageText(`Входящие заявки \n\n ${table} \n\n <b><u>ID пользователя всегда доступен, в отличие от других персональных данных</u></b>`, { parse_mode: 'HTML', ...keyboard }).then(async () => {
                await ctx.answerCbQuery(`Получено ${count} заявок`)
            })
        } catch (err) {
            await ctx.reply(`Входящие заявки \n\n ${table} \n\n <b><u>ID пользователя всегда доступен, в отличие от других персональных данных</u></b>`, { parse_mode: 'HTML', ...keyboard })
        } finally {
            return ctx.wizard.selectStep(1)
        }
    })
}
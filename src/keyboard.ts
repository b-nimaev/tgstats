import { Markup } from "telegraf";

type MessageT = {
    text: string,
    keyboard: any
}

let back = { text: '« Назад', callback_data: 'back' }
let home = { text: '« Назад', callback_data: 'home' }
let add = { text: 'Добавить', callback_data: 'add' }

let keys = {
    'back': { text: '« Назад', callback_data: 'back' },
    'inbox': { text: `Входящие`, callback_data: 'inbox' },
    'newmanager': { text: 'Добавить менеджера', callback_data: 'newmanager'},
    'stats': { text: 'Статистика', callback_data: 'stats' },
}


/**
 * Секция Менеджеры, Роль Админ
 */
export const keyboardOnSceneOfUsers = {
    'reply_markup': {
        'inline_keyboard': [
            [keys.stats, keys.newmanager],
            [keys.back, keys.inbox]
        ]
    }
}

export const channel = new class {
    async list (cursor: any) {
        let Message: MessageT = {
            text: 'Секция: Каналы',
            keyboard: {
                reply_markup: {
                    inline_keyboard: []
                }
            }
        }


        let keys = Message.keyboard.reply_markup.inline_keyboard
        for (let index = 0; index < cursor.length; index++) {
            keys.push([{
                text: cursor[index].username,
                callback_data: 'link' + cursor[index].username,
                hide: false
            }])
        }
        keys.push([home, add])

        return Message
    }
}

export const managers = new class {
    async list (cursor: any) {
        let Message: MessageT = {
            text: 'Секция: Менеджеры',
            keyboard: {
                reply_markup: {
                    inline_keyboard: []
                }
            }
        }

        let keys = Message.keyboard.reply_markup.inline_keyboard
        for (let index = 0; index < cursor.length; index++) {
            keys.push([{
                text: cursor[index].username,
                callback_data: 'link' + cursor[index].username,
                hide: false
            }])
        }
        keys.push([home, add])

        return Message
    }
}

export const cancel = new class {
    back() {
        let Message: MessageT = {
            text: 'Секция: Каналы',
            keyboard: {
                reply_markup: {
                    inline_keyboard: []
                }
            }
        }
        let keys = Message.keyboard.reply_markup.inline_keyboard
        keys.push([back])
        return Message.keyboard
    }
}

export const admin = Markup.inlineKeyboard([
    [
        Markup.button.callback('Каналы', 'channels')
    ],
    [
        Markup.button.callback('Менеджеры', 'managers'),
        Markup.button.callback('Статистика', 'stats')
    ]
])

const keyboard = new class {
    admin = {
        text: 'Главная',
        extra: admin
    }
}

export default keyboard

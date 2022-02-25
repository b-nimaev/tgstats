import { Scenes } from 'telegraf'
import { context } from './types'

import admin from './controller/admin'

import channels from './controller/channel'
import managers from './controller/managers'
import home from './controller/home'

let controller = new Scenes.Stage<context>(
    [
        admin,
        channels,
        managers,
        home
    ],
    { default: 'home' }
)

export default controller
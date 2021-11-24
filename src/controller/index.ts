import { Scenes } from 'telegraf'
import { context } from '../types'

import admin from './admin'

import channels from './channel'
import managers from './managers'
import home from './home'

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
import { Scenes } from 'telegraf'
import { context } from '../utils/context'

import * as admin from './stages/admin'
import * as home from './stages/home'

let controller = new Scenes.Stage<context>(
    [
        admin.default,
        admin.manager, 
        admin.channel, 
        
        home.default
    ],
    {
        default: 'home'
    }
)

export default controller
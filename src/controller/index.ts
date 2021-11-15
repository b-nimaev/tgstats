import { Scenes } from 'telegraf'
import { context } from '../utils/context'
import { admin, user, home } from './stages'

export const controller = new Scenes.Stage<context>([admin, user, home], {
    default: 'home'
})
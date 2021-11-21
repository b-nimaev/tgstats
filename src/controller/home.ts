import { Composer, Scenes } from "telegraf"
import { context } from "../utils/context"
import register from "./home/register"
import greeting from "./home/validate"


const handler = new Composer<context>()

// WizardScene
const home = new Scenes.WizardScene('home', handler)
home.action('register', async (ctx) => await register(ctx))
home.on('message', async (ctx) => await greeting(ctx))

export default home
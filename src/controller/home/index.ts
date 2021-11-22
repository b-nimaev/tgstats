import { Composer, Scenes } from "telegraf"
import { login } from "../../services/database"
import { context } from "../../utils/context"
import register from "./register"

const handler = new Composer<context>()

// WizardScene
const home = new Scenes.WizardScene('home', handler)
home.action('register', async (ctx) => await register(ctx))

home.start(async (ctx) => await login(ctx))


export default home
import { config } from "dotenv"
import { Composer, Scenes } from "telegraf"
import { checkUser } from "../../services"
import { context } from "../../types"

config()

const handler = new Composer<context>()
const home = new Scenes.WizardScene('home', handler)

home.start(async (ctx) => await checkUser(ctx))

export default home
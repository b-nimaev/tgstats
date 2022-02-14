import { config } from "dotenv"
import { Composer, Scenes } from "telegraf"
import { context } from "../../types"
import "../../services"
config()

const handler = new Composer<context>()
const home = new Scenes.WizardScene('home', handler)

home.start(async (ctx) => {
    console.log('is home scene!')
})

export default home
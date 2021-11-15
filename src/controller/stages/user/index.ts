import { Composer, Scenes } from "telegraf"
import { context } from "../../../utils/context"


// Hanlder
const handler = new Composer<context>()

// WizardScene
const user = new Scenes.WizardScene('user', handler)

// Module export
export default user
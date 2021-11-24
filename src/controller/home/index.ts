import { config } from "dotenv"
import { Composer, Scenes } from "telegraf"
import { connect } from "../../services"
import { context } from "../../types"

config()

let handler = new Composer<context>()
const login = async (ctx: any) => {
    try {
        await connect().then(async (connection) => {
            let db = connection.db(<string>process.env.DB_CONN_STRING)
            let data = ctx.from
            
            db.collection("users").insertOne(data)
            return connection.close()
        })
    } catch (err) {
        console.log(err)
    }
}

const home = new Scenes.WizardScene('home', handler)

home.action('register', async (ctx) => {
    await login(ctx)
})

home.start(async (ctx) => {
    await login(ctx)
})

export default home
import * as dotenv from 'dotenv'
dotenv.config();

let uri: string = <string>process.env.DB_CONN_STRING;
import { MongoClient } from "mongodb";
import { User } from 'typegram';
import { context } from '../../utils/context';
interface user extends User {
    trust?: boolean
}

const client = new MongoClient(uri);

export default async function (ctx: context) {
    try {
        await client.connect();
        const database = client.db("tgstats");
        const users = database.collection<user>("users");
        const result = await users.findOne(ctx.update['callback_query'].from)

        if (!(result['trust'])) {
            return false
        } else {
            return ctx.scene.enter('user')
        }
    } finally {
        await client.close();
    }
}
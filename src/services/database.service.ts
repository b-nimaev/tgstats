// Переменные окружения
import * as mongoDB from "mongodb";
import * as dotenv from 'dotenv'

dotenv.config();
export const collection: { admins?: mongoDB.Collection, users?: mongoDB.Collection } = {}

export async function connectToDatabase() {
    dotenv.config();
   
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(<string>process.env.DB_CONN_STRING);
    
    await client.connect();
    
    const db: mongoDB.Db = client.db(process.env.DB_NAME);

    const adminCollection: mongoDB.Collection = db.collection(<string>process.env.admins);
    const usersCollection: mongoDB.Collection = db.collection(<string>process.env.users);
    
    collection.admins = adminCollection;
    collection.users = usersCollection;

    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${adminCollection.collectionName}`);
}

/*
let insertOrUpdate = async function (ctx: context) {
    await client.connect()
    console.log(ctx.session.channel)

    let collection = await client.db("tgstats").collection("channels")
    let result = await collection.findOne({ id: ctx.session.channel['id'] })

    let message = ctx.update['message'],
        message_id = message.message_id

    if (!result) {
        return await collection.insertOne(ctx.session.channel).then(async () => {
            await client.close()
            await ctx.telegram.editMessageText(message.chat.id, message_id, `${message_id}`, 'Канал добавлен', { ...back })
        }).catch(async (err) => {
            await ctx.telegram.editMessageText(message.chat.id, message_id, `${message_id}`, 'Непредвиденная ошибка', { ...back })
        })
    }

    await client.close()
    return await ctx.telegram.editMessageText(message.chat.id, message_id, `${message_id}`, 'Канал существует', { ...back })
}
*/
import { context } from '../../utils/context';
import { collection } from '../../services/database.service'
import { User } from 'typegram';

export default async function (ctx: context) {
    let admin = (collection.admins)
    console.log(collection.admins)
    try {
        var update = await ctx.update['message']
    } catch (err) {
        var update = await ctx.update['callback_query'].message
    }

    // return await admin.findOne({ id: update.from.id }).then(async (isadmin) => {
    //     if (isadmin) {
    //         return 'admin'
    //     }

    //     await user.findOne({ id: update.from.id }).then(async (isuser) => {
    //         if (isuser) {
    //             if (isuser.trust) {
    //                 return 'user'
    //             }
    //         }
    //     })

    //     return false
    // })
}
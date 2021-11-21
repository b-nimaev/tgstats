import { Context, Scenes } from "telegraf";
import { Chat, Update } from "typegram";

interface MyWizardSession extends Scenes.WizardSessionData {
    // will be available under `ctx.scene.session.myWizardSessionProp`
    myWizardSessionProp: number,
}

interface MySession extends Scenes.WizardSession<MyWizardSession> {
    // will be available under `ctx.session.mySessionProp`
    mySessionProp: number,
    channel: Chat.GetChat
}

export interface context extends Context {
    ctx: Scenes.BaseScene<context>;
    // will be available under `ctx.myContextProp`
    prevWizard: string | undefined
    // declare session type
    session: MySession
    // declare scene type
    scene: Scenes.SceneContextScene<context, MyWizardSession>
    // declare wizard type
    wizard: Scenes.WizardContextWizard<context>
}

export interface chat extends Chat.ChannelGetChat {

}
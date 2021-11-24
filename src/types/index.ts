import { Context, Scenes } from "telegraf";
import { Chat } from "typegram";

interface MyWizardSession extends Scenes.WizardSessionData {
    myWizardSessionProp: number,
}

interface MySession extends Scenes.WizardSession<MyWizardSession> {
    mySessionProp: number,
    channel: Chat.GetChat
}

export interface context extends Context {
    session: MySession
    scene: Scenes.SceneContextScene<context, MyWizardSession>
    wizard: Scenes.WizardContextWizard<context>
}
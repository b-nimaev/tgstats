import { Context, Scenes } from "telegraf";

interface MyWizardSession extends Scenes.WizardSessionData {
    // will be available under `ctx.scene.session.myWizardSessionProp`
    myWizardSessionProp: number,
}

interface MySession extends Scenes.WizardSession<MyWizardSession> {
    // will be available under `ctx.session.mySessionProp`
    mySessionProp: number
}

export interface context extends Context {
    // will be available under `ctx.myContextProp`
    myContextProp: string
    // declare session type
    session: MySession
    // declare scene type
    scene: Scenes.SceneContextScene<context, MyWizardSession>
    // declare wizard type
    wizard: Scenes.WizardContextWizard<context>
}

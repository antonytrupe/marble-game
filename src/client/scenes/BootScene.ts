import { Scene } from "phaser"
import { Login } from "./Login";

export class BootScene extends Scene {

    static key = "BOOT"

    constructor() {
        // console.log('BootScene constructor')
        super({
            key: BootScene.key,
            //active: true
        })
    }

   

    async create() {
        // console.log('BootScene create')

        // this.scene.launch(HudScene.key)

        const params = new URLSearchParams(document.location.search);

        if (!!params.get('scene')) {
            BootScene.runScene(this.scene, params.get('scene'), params.get('room'))
        }
        else {
            console.log('no url info')
            BootScene.runScene(this.scene, Login.key)

        }

        // this.client.auth.onChange((authData: { user: string; token: string }) => {
        //     // console.log('BootScene client.auth.onChange', authData)
        //     this.registry.set('auth.email', authData.user)
        //     this.registry.events.emit('auth.email', authData.user)
        //     if (authData.user) {
        //         this.registry.events.emit('worldselect.visible', true)
        //     }
        // })

        // this.registry.events.on('path', async (sceneName: string, roomName: string) => {
        //     // console.log(sceneName, roomName)
        //     // window.location.hash = `${sceneName}|${roomName}`
        //     this.runScene(sceneName, roomName)
        // })

        // this.registry.events.on('auth.logout', async () => {
        //     // console.log('log out')
        //     if (this.client) {
        //         window.location.hash = ''
        //         await this.client.auth.signOut()
        //         this.registry.events.emit('worldselect.visible', false)
        //     }
        // })

        // this.registry.events.on('auth.login', async () => {
        //     if (this.client) {
        //         await this.client.auth.signInWithProvider('google')
        //         this.registry.events.emit('worldselect.visible', true)
        //     }
        // })

        //connect with the lobby
        // await this.joinLobby()
    } 
    static runScene(sceneManager: Phaser.Scenes.ScenePlugin, sceneName: string | null, roomName?: string | null) {
        // console.log('runScene', sceneName, roomName)
        // console.log(this.game.scene)
        if (sceneName) {
            sceneManager.launch(sceneName, { roomName })
        }
        sceneManager.stop()

        // window.location.hash = sceneName + (!!roomName ? '|' + roomName : '')
        // this.registry.events.emit('worldselect.visible', false)
    }
}
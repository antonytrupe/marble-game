import { GameObjects, Scene } from "phaser"
import { BACKEND_URL } from "../BACKEND_URL"
import { Client } from "colyseus.js"
import { BootScene } from "./BootScene"
import { CharacterSelect } from "./CharacterSelect"

export class Login extends Scene {
    static key = "LOGIN"
    google: GameObjects.Text
    characterName: GameObjects.Text
    switchCharacter: GameObjects.Text
    charactersGroup: GameObjects.Group

    constructor() {
        super({
            key: Login.key,
        })
    }

    create() {
        console.log('Login create')

        const client = new Client(BACKEND_URL)
       
        // client.auth.getUserData()
        //     .then(userData => {
        //         console.log(userData)
        //     })
        //     .catch(e => {
        //         console.log(e)
        //     })
        client.auth.onChange(async (authData: { user: string; token: string }) => {
            // console.log('auth onchange', authData)
            if (!!authData.user) {
                console.log('logged in', authData)

                const params = new URLSearchParams(document.location.search);
                params.set('scene', CharacterSelect.key)
                BootScene.runScene(this.scene, params.get('scene'), params.get('room'))
                window.history.pushState(null, '', `?${params.toString()}`)
            }
        })

        this.google = this.add.text(10, 10, "GOOGLE LOG IN", { color: '#black' }).setInteractive().on('pointerdown', async () => {
            console.log('log in click')
            client.auth.signInWithProvider('google')
            //this.registry.events.emit('auth.login')
        })
    }
}
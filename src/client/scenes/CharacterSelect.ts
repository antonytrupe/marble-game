import { GameObjects, Scene } from "phaser"
import { BACKEND_URL } from "../BACKEND_URL"
import { Client } from "colyseus.js"
import { TacticalScene } from "./TacticalScene"
import { Login } from "./Login"
import { BootScene } from "./BootScene"

export class CharacterSelect extends Scene {
    static key = "CHARACTERSELECT"
    debug: GameObjects.Text
    emailText: GameObjects.Text
    logout: GameObjects.Text
    characterName: GameObjects.Text
    switchCharacter: GameObjects.Text
    charactersGroup: GameObjects.Group

    constructor() {
         super({
            key: CharacterSelect.key,
         })
    } 

    init(): void {
        console.log('CharacterSelect init')

        this.debug = this.add.text(0, 0, 'DEBUG', { color: '#ff0000' }).setScrollFactor(0)
        this.debug.y = Math.floor(this.cameras.main.height - this.debug.height - 100)
      }

    create() {
        console.log('CharacterSelect create')
        this.emailText = this.add.text(10, 10, "", { color: 'black' }) 

        const client = new Client(BACKEND_URL)
        client.auth.onChange(async (authData: { user: string; token: string }) => {
            // console.log('auth onchange', authData)
            this.registry.set('auth.email',authData.user)

            if (!authData.user) {

                console.log('logged out')

                const params = new URLSearchParams(document.location.search);
                params.set('scene', Login.key)
                window.history.pushState(null, '', `?${params.toString()}`)
                BootScene.runScene(this.scene, params.get('scene'), params.get('room'))
            }
            else{
                // this.emailText.setText(authData.user)

            }
        })

        this.logout = this.add.text(10, 30, "LOG OUT", { color: 'black' }).setInteractive().on('pointerdown', async () => {
            console.log('log out click')
            //this.registry.events.emit('auth.logout')
            // client.auth.token = ''
            client.auth.signOut()
        }) 

        const params = new URLSearchParams(document.location.search)

        if (!params.get('room')) {
            this.add.text(100, 100, 'JOIN', { color: 'black' })
                .setInteractive()
                .setPadding(6)
                .on("pointerdown", () => {
                    console.log('TACTICAL', 'TACTICAL')
                    // this.runScene('TACTICAL', 'TACTICAL')
                    params.set('scene', 'TACTICAL')
                    params.set('room', 'TACTICAL')
                    window.location.search = params.toString()

                })
        } 
    }

    private loggedOut() {
        //not logged in
        //show the login button
        //hide the log out button
        this.logout.removeFromDisplayList()
        //hide the email button
        this.emailText.removeFromDisplayList()
    }

    private loggedIn(email: string) {
        //logged in
        //hide the log in button
        // this.login.removeFromDisplayList()
        //show and set the email button
        this.emailText.setText(email)
        this.emailText.addToDisplayList()
        //show the log out button
        this.logout.addToDisplayList()
    }


    update(time: number, delta: number): void {
        // console.log('hud update')
        const email = this.registry.get('auth.email')
        if (email) {
            this.loggedIn(email)
        }
        else {
            this.loggedOut()
        }
    }
}

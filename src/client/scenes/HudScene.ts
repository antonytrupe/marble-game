import { Client } from "colyseus.js"
import { GameObjects, Scene } from "phaser"
import { BACKEND_URL } from "../BACKEND_URL"

export class HudScene extends Scene {
    debug: GameObjects.Text
    emailText: GameObjects.Text
    login: GameObjects.Text
    logout: GameObjects.Text

    constructor() {
        super({
            key: 'HUD',
        })
    }

    preload() {
    }

    init(): void {
    }

    create() {
        this.debug = this.add.text(0, 0, 'DEBUG', { color: 'black' }).setScrollFactor(0)
        this.debug.y = this.cameras.main.height - this.debug.height

        const client = new Client(BACKEND_URL)

        client.auth.onChange((authData) => {
            if (!!authData.user) {
                //logged in
                this.registry.set('currentPlayer.email',authData.user)
                this.registry.events.emit('currentPlayer.email',authData.user)
                //hide the log in button
                this.login.removeFromDisplayList()
                //show and set the email button
                this.emailText.setText(authData.user)
                this.emailText.addToDisplayList()
                //show the log out button
                this.logout.addToDisplayList()
            }
            else {
                //not logged in
                //show the login button
                this.login.addToDisplayList()
                //hide the log out button
                this.logout.removeFromDisplayList()
                //hide the email button
                this.emailText.removeFromDisplayList()
            }
        })

        this.emailText = this.add.text(10, 10, "")

        this.logout = this.add.text(10, 30, "LOG OUT").setInteractive().on('pointerdown', async () => {
            try {
                await client.auth.signOut()
            } catch (e) {
                console.error(e)
            }
        })

        this.login = this.add.text(10, 10, "LOG IN").setInteractive().on('pointerdown', async () => {
            try {
                await client.auth.signInWithProvider('google')
            } catch (e) {
                console.error(e)
            }
        })
    }

    update(time: number, delta: number): void {
        // console.log('hud update')
        this.debug.text = 'turn ' + this.registry.get('turnNumber')

    }
}
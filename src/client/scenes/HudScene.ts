import { GameObjects, Scene } from "phaser"

export class HudScene extends Scene {
    debug: GameObjects.Text
    emailText: GameObjects.Text
    login: GameObjects.Text
    logout: GameObjects.Text

    constructor() {
        // console.log('HudScene constructor')
        super({
            key: 'HUD',
        })
    }

    preload() {
        // console.log('HudScene preload')
    }

    init(): void {
        // console.log('HudScene init')
    }

    create() {
        // console.log('HudScene create')
        this.debug = this.add.text(0, 0, 'DEBUG', { color: 'black' }).setScrollFactor(0)
        this.debug.y = this.cameras.main.height - this.debug.height

        this.registry.events.on('auth.email', (email: any) => {
            // console.log('hudscene', email)
            if (!!email) {
                //logged in
                //hide the log in button
                this.login.removeFromDisplayList()
                //show and set the email button
                this.emailText.setText(email)
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

        this.emailText = this.add.text(10, 10, "").removeFromDisplayList()

        this.logout = this.add.text(10, 30, "LOG OUT").setInteractive().on('pointerdown', async () => {
            this.registry.events.emit('auth.logout')
        }).removeFromDisplayList()

        this.login = this.add.text(10, 10, "LOG IN").setInteractive().on('pointerdown', async () => {
            this.registry.events.emit('auth.login')
        }).removeFromDisplayList()
    }

    update(time: number, delta: number): void {
        // console.log('hud update')
        this.debug.text = 'turn ' + this.registry.get('turnNumber')

    }
}
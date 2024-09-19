import { GameObjects, Scene } from "phaser"
import { MarbleGameScene } from "./MarbleGameScene"
import { WorldSelectScene } from "./WorldSelectScene"

export class HudScene extends Scene {
    static key = "HudScene"
    debug: GameObjects.Text
    emailText: GameObjects.Text
    login: GameObjects.Text
    logout: GameObjects.Text

    constructor() {
        // console.log('HudScene constructor')
        super({
            key: HudScene.key,
            active: true,
        })
    }

    preload() {
        // console.log('HudScene preload')
    }

    leave() {
        // console.log('HudScene leave')
    }

    init(): void {
        // console.log('HudScene init')
        this.debug = this.add.text(0, 0, 'DEBUG', { color: 'white' }).setScrollFactor(0)
        this.debug.y = this.cameras.main.height - this.debug.height - 20
        this.emailText = this.add.text(10, 10, "").removeFromDisplayList()

        this.logout = this.add.text(10, 30, "LOG OUT").setInteractive().on('pointerdown', async () => {
            console.log('log out click')
            this.registry.events.emit('auth.logout')
        }).removeFromDisplayList()

        this.login = this.add.text(10, 10, "LOG IN").setInteractive().on('pointerdown', async () => {
            this.registry.events.emit('auth.login')
        }).removeFromDisplayList()
        // console.log('HudScene init end')

    }

    create() {
        // console.log('HudScene create')

        this.scene.moveUp()

        this.registry.events.on('auth.email', (email: any) => {
            // console.log('HudScene auth.email event', email)
            if (!!email) {
                this.loggedIn(email)
            }
            else {
                this.loggedOut()
            }
        })

        //remove the listener when the scene is destroyed
        this.events.on('destroy', () => {
            // console.log('HudScene destroy')
            this.registry.events.removeListener('auth.email', undefined, this)
        })

        const email = this.registry.get('auth.email')
        if (email) {
            this.loggedIn(email)
        }
        else {
            this.loggedOut()
        }
        // console.log('HudScene create end')

    }

    private loggedOut() {
        //not logged in
        //show the login button
        this.login.addToDisplayList()
        //hide the log out button
        this.logout.removeFromDisplayList()
        //hide the email button
        this.emailText.removeFromDisplayList()
    }

    private loggedIn(email: string) {
        //logged in
        //hide the log in button
        this.login.removeFromDisplayList()
        //show and set the email button
        this.emailText.setText(email)
        this.emailText.addToDisplayList()
        //show the log out button
        this.logout.addToDisplayList()
    }




    update(time: number, delta: number): void {
        // console.log('hud update')
        const turnNumber = this.registry.get('turnNumber')
        if (turnNumber) {
            const day = Math.floor(turnNumber / HOURS_PER_DAY / MINUTES_PER_HOUR / TURNS_PER_MINUTE)
            const hour = Math.floor(turnNumber / MINUTES_PER_HOUR / TURNS_PER_MINUTE)
            const min = Math.floor(turnNumber / TURNS_PER_MINUTE)
            const turn = turnNumber % (TURNS_PER_MINUTE)
            this.debug.text = `day: ${day}\n` +
                `hour: ${hour}\n` +
                `min: ${min}\n` +
                `turn: ${turn}\n` +
                `turn: ${turnNumber}`
            this.debug.y = this.cameras.main.height - this.debug.height - 20
        }
    }
}

const TURNS_PER_MINUTE = 10
const MINUTES_PER_HOUR = 100
const HOURS_PER_DAY = 10
const DAYS_PER_YEAR = 100
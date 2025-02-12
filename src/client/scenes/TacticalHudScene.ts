import { GameObjects, Scene } from "phaser"
import { BACKEND_URL } from "../BACKEND_URL"
import { Client } from "colyseus.js"
import { TacticalScene } from "./TacticalScene"

export class TacticalHudScene extends Scene {
    static key = "TACTICALHUD"
    debug: GameObjects.Text
    emailText: GameObjects.Text
    login: GameObjects.Text
    logout: GameObjects.Text
    characterName: GameObjects.Text
    switchCharacter: GameObjects.Text
    charactersGroup: GameObjects.Group

    constructor() {
        // console.log('HudScene constructor')
        super({
            key: TacticalHudScene.key,
            //active: true,
        })
    }

    preload() {
        // console.log('HudScene preload')
    }

    leave() {
        // console.log('HudScene leave')
    }

    init(): void {
        console.log('HudScene init')

        this.debug = this.add.text(0, 0, 'DEBUG', { color: '#ff0000' }).setScrollFactor(0)
        this.debug.y = Math.floor(this.cameras.main.height - this.debug.height - 100)

        this.emailText = this.add.text(10, 10, "", { color: 'black' }).removeFromDisplayList()



        // console.log('HudScene init end')

    }

    create() {
        console.log('HudScene create')

        const client = new Client(BACKEND_URL)
        client.auth.onChange(async (authData: { user: string; token: string }) => {
            // console.log('auth onchange', authData)
            if (!!authData.user) {
                console.log('logged in', authData)
                // this.registry.set('auth.email', authData.user)
                this.emailText.setText(authData.user)
                this.emailText.addToDisplayList()
                this.logout.addToDisplayList()
                this.login.removeFromDisplayList()

                // console.log('logged in',authData)
                //logged in
                // // this.registry.events.emit('auth.email', authData.user)
                // if (this.room && this.client) {
                //     this.client.auth.token = authData.token
                //     // console.log(this.client.auth.token)
                //     this.room.send('auth', 'login')
                //     // this.room.leave(false)
                //     // this.room = await this.client.joinOrCreate(this.roomName)
                // }
            }
            else {
                console.log('logged out')
                this.emailText.setText('')
                this.emailText.removeFromDisplayList()
                this.logout.removeFromDisplayList()
                this.login.addToDisplayList()

                window.location.search=''


                // console.log(this.client.auth.token)
                // this.registry.events.emit('auth.email', authData.user)
                // if (this.room && this.client) {
                //     this.client.auth.token = ''
                //     console.log(this.client.auth.token)
                //     this.room.send('auth', 'logout')
                //     // this.room.leave(false)
                //     // this.room = await this.client.joinOrCreate(this.roomName)
                // }
            }
        })

        
        this.login = this.add.text(10, 10, "LOG IN", { color: '#black' }).setInteractive().on('pointerdown', async () => {
            console.log('log in click')
            client.auth.signInWithProvider('google')
            //this.registry.events.emit('auth.login')
        }).removeFromDisplayList()

        this.logout = this.add.text(10, 30, "LOG OUT", { color: 'black' }).setInteractive().on('pointerdown', async () => {
            console.log('log out click')
            //this.registry.events.emit('auth.logout')
            // client.auth.token = ''
            client.auth.signOut()
        }).removeFromDisplayList()

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

        // this.scene.moveAbove(TacticalScene.key)
        // this.scene.moveUp()

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
            // console.log(turnNumber)
            const day = Math.floor(turnNumber / HOURS_PER_DAY / MINUTES_PER_HOUR / TURNS_PER_MINUTE)
            const hour = Math.floor(turnNumber / MINUTES_PER_HOUR / TURNS_PER_MINUTE)
            const min = Math.floor(turnNumber / TURNS_PER_MINUTE)
            const turn = turnNumber % (TURNS_PER_MINUTE)
            this.debug.text = `day: ${day}\n` +
                `hour: ${hour}\n` +
                `min: ${min}\n` +
                `turn: ${turn}\n` +
                `turn: ${turnNumber}`
            this.debug.y = Math.floor(this.cameras.main.height - this.debug.height - 20)
        }
    }
}

const TURNS_PER_MINUTE = 10
const MINUTES_PER_HOUR = 100
const HOURS_PER_DAY = 10
const DAYS_PER_YEAR = 100
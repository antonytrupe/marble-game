import { Client } from "colyseus.js"
import { Scene } from "phaser"
import { BACKEND_URL } from "../BACKEND_URL"

export class AuthTestScene extends Scene {
    emailText: Phaser.GameObjects.Text

    constructor() {
        // console.log('test constructor')
        super({
            key: 'AUTHTEST',
        })
    }

    preload() {
    }

    init() {
    }

    async create() {
        const client = new Client(BACKEND_URL)

        this.emailText = this.add.text(100, 200, ".______.")
        // if (client.auth.token) {
        //     const userdata = await client.auth.getUserData()
        //     // console.log(userdata.user)
        //     this.emailText.setText(userdata?.user)
        // }

        this.add.text(100, 100, "LOGIN").setInteractive().on('pointerdown', async () => {
            // console.log('click')
            try {
                const userdata = await client.auth.signInWithProvider('google')
                // const userdata = await client.auth.signInAnonymously()
                // console.log(userdata)
                // console.log(client.auth.token)
                if (typeof userdata === 'object' && !!userdata && "user" in userdata && typeof userdata?.user === "string") {
                    this.emailText.setText(userdata?.user)
                }

            } catch (e) {
                console.error(e)
            }
        })

        this.add.text(100, 300, "GETUSER").setInteractive().on('pointerdown', async () => {
            // console.log('click')
            // console.log(client.auth.token)
            if (client.auth.token) {
                try {
                    // console.log("Tl1cUbGXr4J2o1cEQJt5l2W6aLYytA8kRZc8ejUNiBc=")
                    const userdata = await client.auth.getUserData()
                    // console.log(userdata.user)
                    this.emailText.setText(userdata?.user)

                    // this.emailText.setText(userdata.email)
                    if (typeof userdata === 'object' && !!userdata && "user" in userdata && typeof userdata?.user === "string") {
                        this.emailText.setText(userdata?.user)
                    }

                } catch (e) {
                    console.error(e)
                }
            }
        })
 
        client.auth.onChange((authData) => {
            // console.log(authData)
            // console.log(authData.user)
            // console.log(authData.token)
            if (!!authData.user) {
                this.emailText.setText(authData.user)
            }
        })
    }

    update(time: number, delta: number): void {
    }
}
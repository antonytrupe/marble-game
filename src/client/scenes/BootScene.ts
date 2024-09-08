import { Scene } from "phaser"
import { Client } from "colyseus.js"
import { BACKEND_URL } from "../BACKEND_URL"

export class BootScene extends Scene {

    client: Client

    constructor() {
        // console.log('BootScene constructor')
        super({
            key: "BootScene",
            active: true
        })
    }

    preload() {
        // console.log('BootScene preload')
        // update menu background color
        // this.cameras.main.setBackgroundColor(0xf0f0f0)
    }

    init() {
        // console.log('BootScene init')
    }

    async create() {
        // console.log('BootScene create')
        this.client = this.createClient()
        //console.log(window.location.hash)
        //console.log(window.location.pathname)
        //automatically navigate to hash scene if provided
        if (window.location.hash) {
            // console.log('hash')
            const hashParts = window.location.hash.substring(1).split('|')
            // console.log(hashParts)
            this.runScene(hashParts[0], hashParts[1])
        }
        else {
            this.registry.events.emit('worldselect.visible', false)
        }

        this.client.auth.onChange((authData: { user: string; token: string }) => {
            // console.log('BootScene client.auth.onChange', authData)
            this.registry.set('auth.email', authData.user)
            this.registry.events.emit('auth.email', authData.user)
            if (authData.user) {
                this.registry.events.emit('worldselect.visible', true)
            }
        })

        this.registry.events.on('path', async (sceneName: string, roomName: string) => {
            // console.log(sceneName, roomName)
            // window.location.hash = `${sceneName}|${roomName}`
            this.runScene(sceneName, roomName)
        })

        this.registry.events.on('auth.logout', async () => {
            // console.log('log out')
            if (this.client) {
                window.location.hash = ''
                await this.client.auth.signOut()
                this.registry.events.emit('worldselect.visible', false)
            }
        })

        this.registry.events.on('auth.login', async () => {
            if (this.client) {
                await this.client.auth.signInWithProvider('google')
                this.registry.events.emit('worldselect.visible', true)
            }
        })

        //connect with the lobby
        await this.joinLobby()
    }

    createClient() {
        return new Client(BACKEND_URL)
    }

    async joinLobby() {
        // console.log('BootScene connect')

        const lobby = await this.client.joinOrCreate("lobby")

        // let allRooms: any[] = []

        lobby.onMessage("rooms", (rooms) => {
            this.registry.events.emit("rooms", rooms)
        })

        lobby.onMessage("+", ([roomId, room]) => {
            this.registry.events.emit("+", roomId, room)
        })

        lobby.onMessage("-", (roomId) => {
            this.registry.events.emit("-", roomId)
        })
        return lobby
    }

    update() {
        // console.log('update')
    }

    runScene(sceneName: string, roomName: string) {
        // console.log('runScene', sceneName, roomName)
        window.location.hash = `${sceneName}|${roomName}`
        // this.scene.stop()
        // console.log(this.game.scene)
        this.scene.launch(sceneName, { roomName, token: this.client.auth.token })
        // window.location.hash = sceneName + (!!roomName ? '|' + roomName : '')
        this.registry.events.emit('worldselect.visible', false)
    }
}
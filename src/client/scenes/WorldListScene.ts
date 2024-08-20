import Phaser from "phaser"
import { MarbleGameScene } from "./MarbleGameScene"
import { Client, RoomAvailable } from "colyseus.js"
import { BACKEND_URL } from "../backend"

export class WorldListScene extends Phaser.Scene {

    worlds: RoomAvailable[] = []
    worldsGroup: Phaser.GameObjects.Group

    constructor() {
        super({ key: "selector", active: true })
    }

    preload() {
        // update menu background color
        this.cameras.main.setBackgroundColor(0xf0f0f0)
        this.worldsGroup = this.add.group()
    }

    async create() {
        // automatically navigate to hash scene if provided
        if (window.location.hash) {
            // console.log('hash')
            const hashParts = window.location.hash.substring(1).split('|')
            console.log(hashParts)
            this.runScene(hashParts[0], hashParts[1])
            return
        }

        //connect with the room
        await this.connect()
    }

    async connect() {
        // console.log('connect')
        const client = new Client(BACKEND_URL)

        const lobby = await client.joinOrCreate("lobby")

        // let allRooms: any[] = []

        lobby.onMessage("rooms", (rooms) => {
            this.worlds = rooms
        })

        lobby.onMessage("+", ([roomId, room]) => {
            const roomIndex = this.worlds.findIndex((room) => room.roomId === roomId)
            if (roomIndex !== -1) {
                this.worlds[roomIndex] = room

            } else {
                this.worlds.push(room)
            }
        })

        lobby.onMessage("-", (roomId) => {
            this.worlds = this.worlds.filter((room) => room.roomId !== roomId)
        })
    }

    update() {
        // console.log('update')

        this.worldsGroup.clear(true)

        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            color: "#ff0000",
            fontSize: "32px",
            fontFamily: "Arial"
        }

        this.worlds.forEach((room, i) => {
            //TODO keep track of what rooms we've already added
            const description = room.metadata.description
            const sceneName = room.metadata.sceneName
            const roomName = room.name

            const t = this.make.text({ x: 130, y: 150 + 70 * i, text: `${description}`, style: textStyle })
                .setInteractive()
                .setPadding(6)
                .on("pointerdown", () => {
                    console.log(sceneName, roomName)
                    this.runScene(sceneName, roomName)
                })

            this.worldsGroup.add(t)
        })
    }

    runScene(sceneName: string, roomName: string) {
        // console.log('run scene', sceneName, roomName)
        // this.game.scene.switch("selector", key)
        this.scene.stop()
        // console.log(this.game.scene)
        this.scene.run(sceneName, { roomName })
        window.location.hash = sceneName + (!!roomName ? '|' + roomName : '')
    }

}
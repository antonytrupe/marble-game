import Phaser from "phaser"
import { MarbleGameScene } from "./MarbleGameScene"
import { Client, RoomAvailable } from "colyseus.js"
import { BACKEND_URL } from "../backend"

export class WorldListScene extends Phaser.Scene {

    parts = [
        // '1': {description:"Basic Player Movement",name:'part1'},
        // '2': {description:"Interpolation",name:'part4'},
        // '3': {description:"Client-predicted Input",name:'part3'},
        // '4': { description: "Fixed Tickrate", name: 'part4' },
        { description: 'Marble Game 1', sceneName: 'marbleGame', roomName: 'marbleGame1' },
        { description: 'Marble Game 2', sceneName: 'marbleGame', roomName: 'marbleGame2' }
    ]
    worldsGroup: Phaser.GameObjects.Group

    constructor() {
        super({ key: "selector", active: true })
    }

    preload() {
        // update menu background color
        this.cameras.main.setBackgroundColor(0xf0f0f0)
        this.worldsGroup = this.add.group()

        // preload demo assets
        // this.load.image('ship_0001')
        // this.load.image('background' )

        // this.load.image('ship_0001', 'https://cdn.glitch.global/3e033dcd-d5be-4db4-99e8-086ae90969ec/ship_0001.png?v=1649945243288')
    }

    async create() {
        // automatically navigate to hash scene if provided
        if (window.location.hash) {
            // console.log('hash')
            const hashParts = window.location.hash.substring(1).split('|')
            // console.log(hashParts)
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

        let allRooms: any[] = []

        lobby.onMessage("rooms", (rooms) => {
            // console.log(rooms)
            allRooms = rooms.map((r: { metadata: { description: any; sceneName: any }; name: any }) => {
                // console.log(r)
                return {
                    description: r.metadata.description,
                    sceneName: r.metadata.sceneName,
                    roomName: r.name
                }
            })
            // console.log(allRooms)
            //  this.parts = allRooms
        })

        lobby.onMessage("+", ([roomId, room]) => {
            // console.log('new room', roomId, room)
            const roomIndex = allRooms.findIndex((r) => {
                // console.log(r.roomName)
                // console.log(room.name)
                return r.roomName === room.name
            })
            if (roomIndex !== -1) {
                allRooms[roomIndex] = room

            } else {
                allRooms.push({
                    description: room.metadata.description,
                    sceneName: room.metadata.sceneName,
                    roomName: room.name
                })
            }
            // console.log(allRooms)
        })

        lobby.onMessage("-", (roomId) => {
            // console.log('old room', roomId)
            allRooms = allRooms.filter((room) => room.roomId !== roomId)
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

        this.parts.forEach((part, i) => {

            const description = part.description
            const sceneName = part.sceneName
            const roomName = part.roomName

            const t = this.make.text({ x: 130, y: 150 + 70 * i, text: `${description}`, style: textStyle })
                .setInteractive()
                .setPadding(6)
                .on("pointerdown", () => {
                    this.runScene(sceneName, roomName)
                })

            this.worldsGroup.add(t)
        })
    }

    runScene(sceneName: string, roomName: string) {
        // console.log('run scene', sceneName, roomName)
        // this.game.scene.switch("selector", key)
        this.game.scene.start(sceneName, { roomName })
        window.location.hash = sceneName + '|' + roomName
    }

}
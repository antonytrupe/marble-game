import { RoomAvailable } from "colyseus.js"
import { GameObjects, Scene, Types } from "phaser"

export class WorldSelectScene extends Scene {
    static key = "WorldSelectScene"
    worlds: RoomAvailable[] = []
    worldsGroup: GameObjects.Group

    constructor() {
        // console.log('WorldSelectScene constructor')
        super({
            key: WorldSelectScene.key,
            //active: true,
        })
    }

    preload() {
        // console.log('WorldSelectScene preload')
        this.worldsGroup = this.add.group()
    }

    init(): void {
        // console.log('WorldSelectScene init')
        this.scene.setVisible(false)
    }

    create() {
        // console.log('WorldSelectScene create')

        this.registry.events.on('worldselect.visible', (visible: boolean) => {
            // console.log('WorldSelectScene worldselect.visible', visible)
            this.scene.setVisible(visible)
        })

        this.registry.events.on("rooms", (rooms: RoomAvailable<any>[]) => {
            this.worlds = rooms
        })

        this.registry.events.on("+", (roomId: string, room: RoomAvailable<any>) => {
            const roomIndex = this.worlds.findIndex((room) => room.roomId === roomId)
            if (roomIndex !== -1) {
                this.worlds[roomIndex] = room

            } else {
                this.worlds.push(room)
            }
        })

        this.registry.events.on("-", (roomId: string) => {
            this.worlds = this.worlds.filter((room) => room.roomId !== roomId)
        })

    }

    update(time: number, delta: number): void {
        // console.log('WorldSelectScene update')

        const textStyle: Types.GameObjects.Text.TextStyle = {
            color: "#ff0000",
            fontSize: "32px",
            fontFamily: "Arial"
        }

        this.worldsGroup.clear(true)
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
                    // this.runScene(sceneName, roomName)
                    this.registry.events.emit('path', sceneName, roomName)
                    this.scene.setVisible(false)
                })

            this.worldsGroup.add(t)
        })
    }
}
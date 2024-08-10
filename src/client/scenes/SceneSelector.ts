import Phaser from "phaser"
import { MarbleGameScene } from "./MarbleGameScene"

export class SceneSelector extends Phaser.Scene {

    parts = {
        // '1': {description:"Basic Player Movement",name:'part1'},
        // '2': {description:"Interpolation",name:'part4'},
        // '3': {description:"Client-predicted Input",name:'part3'},
        // '4': { description: "Fixed Tickrate", name: 'part4' },
        '1': { description: 'Marble Game 1', sceneName: 'marbleGame', roomName: 'marbleGame1' },
        '2': { description: 'Marble Game 2', sceneName: 'marbleGame', roomName: 'marbleGame2' }
    }

    constructor() {
        super({ key: "selector", active: true })
    }

    preload() {
        // update menu background color
        this.cameras.main.setBackgroundColor(0xf0f0f0)

        // preload demo assets
        // this.load.image('ship_0001')
        // this.load.image('background' )

        // this.load.image('ship_0001', 'https://cdn.glitch.global/3e033dcd-d5be-4db4-99e8-086ae90969ec/ship_0001.png?v=1649945243288')
    }

    create() {
        // automatically navigate to hash scene if provided
        if (window.location.hash) {
            // console.log('hash')
            const hashParts = window.location.hash.substring(1).split('|')
            // console.log(hashParts)
            this.runScene(hashParts[0], hashParts[1])
            return
        }



        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            color: "#ff0000",
            fontSize: "32px",
            // fontSize: "24px",
            fontFamily: "Arial"
        }

        for (let partNum in this.parts) {
            const index = parseInt(partNum)
            const description = this.parts[partNum].description
            const sceneName = this.parts[partNum].sceneName
            const roomName = this.parts[partNum].roomName
            console.log(index)

            // this.add.text(32, 32 + 32 * index, `Part ${partNum}: ${label}`, textStyle)
            this.add.text(130, 150 + 70 * index, `${description}`, textStyle)
                .setInteractive()
                .setPadding(6)
                .on("pointerdown", () => {
                    this.runScene(sceneName, roomName)
                })
        }
    }

    runScene(sceneName: string, roomName: string) {
        // console.log('run scene', sceneName, roomName)
        // console.log(this.game.scene.scenes)
        //  if (!this.game.scene.getScene(key)) {
        //     console.log(this.game.scene.getScene(key))
        //     this.game.scene.add(key, MarbleGameScene)
        // }
        // this.game.scene.switch("selector", key)
        this.game.scene.start(sceneName, { roomName })
        window.location.hash = sceneName + '|' + roomName
    }

}
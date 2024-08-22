import {AUTO, Game, Scale, Types} from "phaser"

import { BootScene } from "./scenes/BootScene"
import { MarbleGameScene } from "./scenes/MarbleGameScene"
import { HudScene } from "./scenes/HudScene"
import { TestScene } from "./scenes/TestScene"

const matterContainer = document.querySelector('#matter-container') as HTMLElement

export const config: Types.Core.GameConfig = {
    type: AUTO,
    fps: {
        target: 60,
        forceSetTimeOut: true,
        smoothStep: false,
    },
    // width: matterContainer.clientWidth,
    // height: matterContainer.clientHeight,
    scale: { mode: Scale.RESIZE },
    // height: 200,
    backgroundColor: '#f8f8f0',
    parent: matterContainer,
    dom: {
        createContainer: true
    },
    physics: {
        default: "matter",
        matter: {
            enabled: true,
            autoUpdate: true,
            enableSleeping: false,
            frictionNormalMultiplier: 1,
            gravity: {
                y: 0,
                x: 0
            },

            debug: {
                showBody: true,
                // showVelocity:true,
                // showAxes:true,
                showAngleIndicator: true,
                // showCollisions:true,
                // showPositions:true,
                // showSensors:true,
                // showBody: true,
                // showStaticBody: true
            }
        },
        arcade: {
            debug: true,
            gravity: { x: 0, y: 0 }
        },
    },

    pixelArt: true,
    scene: [
        BootScene,
        MarbleGameScene,
        HudScene,
        TestScene,
    ],
}

const game = new Game(config)


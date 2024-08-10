import Phaser from "phaser"

import { SceneSelector } from "./scenes/SceneSelector"
import { MarbleGameScene } from "./scenes/MarbleGameScene"

const matterContainer = document.querySelector('#matter-container') as HTMLElement

export const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    fps: {
        target: 60,
        forceSetTimeOut: true,
        smoothStep: false,
    },
    width: matterContainer.clientWidth,
    height: matterContainer.clientHeight,
    scale:{mode:Phaser.Scale.RESIZE},
    // height: 200,
    backgroundColor: '#f8f8f0',
    parent: matterContainer,
     
    physics: {
        default: "matter",
        matter: {
            enabled: true,
            autoUpdate: true,
            enableSleeping: false,
            frictionNormalMultiplier: 0,

            gravity: {
                y: 0,
                x: 0
            },

            debug: {
                showVelocity:true,
                showAxes:true,
                showAngleIndicator:true,
                showCollisions:true,
                showPositions:true,
                showSensors:true,
                showBody: true,
                showStaticBody: true
            }
        },
        arcade: {
            debug: true,
            gravity: { x: 0, y: 0 }
        },
    },

    pixelArt: true,
    scene: [SceneSelector,
        // Part2Scene,
        // Part3Scene,
        // Part4Scene,
        MarbleGameScene,
    ],
}
 
const game = new Phaser.Game(config)
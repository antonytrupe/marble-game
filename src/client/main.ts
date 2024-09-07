import { AUTO, Game, Scale, Types } from 'phaser';
import { BootScene } from '@/client/scenes/BootScene';
import { MarbleGameScene } from '@/client/scenes/MarbleGameScene';
import { HudScene } from '@/client/scenes/HudScene';
import { TestScene } from '@/client/scenes/TestScene';
import { AuthTestScene } from './scenes/AuthTestScene';
import { WorldSelectScene } from './scenes/WorldSelectScene';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    scale: { mode: Scale.RESIZE },
    parent: 'phaser-container',
    dom: {
        createContainer: true
    },
    // backgroundColor: '#028af8',
    scene: [
        BootScene,
        HudScene,
        MarbleGameScene,
        WorldSelectScene,
        TestScene,
        AuthTestScene
    ],
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

            // debug: {
            //     showBody: true,
            //     // showVelocity:true,
            //     // showAxes:true,
            //     showAngleIndicator: true,
            //     // showCollisions:true,
            //     // showPositions:true,
            //     // showSensors:true,
            //     // showBody: true,
            //     // showStaticBody: true
            // }
        },
        arcade: {
            debug: true,
            gravity: { x: 0, y: 0 }
        },
    },
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
}

export default StartGame;

export const respondToVisibility = (element: HTMLElement | null, callback: any) => {
    // console.log('element',element)
    var options = {
        root: null,
    };

    var observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            callback(entry.intersectionRatio > 0)
        });
    }, options)
    if (!!element) {
        observer.observe(element)
    }
}
import { AUTO, Game, Scale, Types } from 'phaser';
import { BootScene } from '@/client/scenes/BootScene';
import { MarbleGameScene } from '@/client/scenes/MarbleGameScene';
import { TestScene } from '@/client/scenes/TestScene';
import { AuthTestScene } from './scenes/AuthTestScene';
import { WorldSelectScene } from './scenes/WorldSelectScene';
import { TacticalScene } from './scenes/TacticalScene';
import { TacticalHudScene } from './scenes/TacticalHudScene';
import { Login } from './scenes/Login';
import { CharacterSelect } from './scenes/CharacterSelect';

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
    backgroundColor: '0xffffff',
    scene: [
        BootScene,
        Login,
        CharacterSelect,
        TacticalHudScene,
        MarbleGameScene,
        TacticalScene,
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
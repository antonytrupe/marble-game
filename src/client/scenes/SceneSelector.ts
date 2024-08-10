import Phaser from "phaser";

export class SceneSelector extends Phaser.Scene {

    parts = {
        // '1': {description:"Basic Player Movement",name:'part1'},
        // '2': {description:"Interpolation",name:'part4'},
        // '3': {description:"Client-predicted Input",name:'part3'},
        // '4': { description: "Fixed Tickrate", name: 'part4' },
        '1': { description: 'Marble Game', name: 'marble_game' }
    };

    constructor() {
        super({ key: "selector", active: true });
    }

    preload() {
        // update menu background color
        this.cameras.main.setBackgroundColor(0x000000);

        // preload demo assets
        // this.load.image('ship_0001', 'assets/ship_0001.png');
        this.load.image('ship_0001', 'https://cdn.glitch.global/3e033dcd-d5be-4db4-99e8-086ae90969ec/ship_0001.png?v=1649945243288');
    }

    create() {
        // automatically navigate to hash scene if provided
        if (window.location.hash) {
            // console.log('hash')
            this.runScene(window.location.hash.substring(1));
            return;
        }

        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            color: "#ff0000",
            fontSize: "32px",
            // fontSize: "24px",
            fontFamily: "Arial"
        };

        for (let partNum in this.parts) {
            const index = parseInt(partNum) - 1;
            const label = this.parts[partNum].description;
            const name = this.parts[partNum].name;

            // this.add.text(32, 32 + 32 * index, `Part ${partNum}: ${label}`, textStyle)
            this.add.text(130, 150 + 70 * index, `${label}`, textStyle)
                .setInteractive()
                .setPadding(6)
                .on("pointerdown", () => {
                    this.runScene(name);
                });
        }
    }

    runScene(key: string) {
        // console.log('run scene')
        this.game.scene.switch("selector", key)
        window.location.hash=key
    }

}
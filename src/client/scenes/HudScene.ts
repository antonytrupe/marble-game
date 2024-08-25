import { GameObjects, Scene } from "phaser"

export class HudScene extends Scene {
    debug: GameObjects.Text
    // scaleSprite: GameObjects.TileSprite
 
    constructor() {
        super({
            key: 'HUD',
        })
    }

    preload() {
        // this.load.image('scale')
    }

    init(): void {
        // console.log('hud data')
        // this.room=data.room
    }

    create() {

        this.debug = this.add.text(0, 0, 'DEBUG', { color: 'black' }).setScrollFactor(0)
        this.debug.y = this.cameras.main.height - this.debug.height
        // this.scaleSprite = this.add.tileSprite(0, 0, 108, 10, 'scale').setOrigin(0,0).setScrollFactor(1)

    }

    update(time: number, delta: number): void {
        // console.log('hud update')
        this.debug.text='turn '+this.registry.get('turnNumber')
        // this.scaleSprite.setScale(this.cameras.main.zoom)
    }
}
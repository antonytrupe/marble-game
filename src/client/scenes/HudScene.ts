export class HudScene extends Phaser.Scene {
    debug: Phaser.GameObjects.Text
    // g: Phaser.GameObjects.Container
    scaleSprite: Phaser.GameObjects.TileSprite
 
    constructor() {
        super({
            key: 'HUD',
        })
    }

    preload() {
        this.load.image('scale')
    }

    init(): void {
        // console.log('hud data')
        // this.room=data.room
    }

    create() {
        // this.g.add()
        // this.g = this.add.container()

        this.debug = this.add.text(0, 0, 'DEBUG', { color: 'black' })//.setScale(1).setScrollFactor(0)
        // this.g.add(this.debug)

        // console.log(this.g.displayList)
        // console.log(this.debug.displayList)
        // console.log(this.cameras.main.height)
        // console.log(this.g.getAll())
        this.debug.y = this.cameras.main.height - this.debug.height
        this.scaleSprite = this.add.tileSprite(0, 0, 108, 10, 'scale').setOrigin(0).setScrollFactor(0)

    }

    update(time: number, delta: number): void {
        // console.log('hud update')
        this.debug.text='turn '+this.registry.get('turnNumber')
    }
}
import { getVelocity } from "@/functions"
import { Player } from "@/Player"
import { Keys } from "@/Keys"
import { SPEED, TURN_SPEED } from "@/SPEED"
import { Body, Composite } from "matter-js"

export class TestScene extends Phaser.Scene {
    keys: Keys
    player: Player = new Player({ x: 200, y: 250 })
    playerSprite: Phaser.Physics.Matter.Sprite

    constructor() {
        // console.log('test constructor')
        super({
            key: 'TEST',
            physics: {
                default: "matter",
                matter: {
                    debug: {
                        showBody: true,
                        // showVelocity:true,
                        // showAxes:true,
                        showAngleIndicator: true,
                        // showCollisions:true,
                        // showPositions:true,
                        // showSensors:true,
                        // showBody: true,
                        // showStaticBody: true}
                    }
                }
            }
        })
    }

    preload() {
        this.load.image('ship_0001')
    }

    init(): void {
    }

    create() {
        // this.keys = this.input.keyboard.addKeys('W,S,A,D,ENTER', false)
        this.keys = this.input.keyboard?.addKeys(
            {
                FORWARD: Phaser.Input.Keyboard.KeyCodes.W,
                BACKWARD: Phaser.Input.Keyboard.KeyCodes.S,
                LEFT: Phaser.Input.Keyboard.KeyCodes.A,
                RIGHT: Phaser.Input.Keyboard.KeyCodes.D,
            }) as Keys

        console.log(this.keys)
        // const playerCollider = this.matter.bodies.circle(this.player.position.x, this.player.position.y, 16, { isSensor: false, label: 'playerCollider' })
        // const playerSensor = this.matter.bodies.circle(this.player.position.x, this.player.position.y, 20, { isSensor: true, label: 'playerCollider' })
        // const compoundBody = this.matter.body.create({ parts: [playerCollider, playerSensor] })

        this.playerSprite = new Phaser.Physics.Matter.Sprite(this.matter.world, this.player.position.x, this.player.position.y, 'ship_0001', undefined, { shape: 'circle' })
        // playerSprite.setExistingBody(compoundBody, true)
        this.add.existing(this.playerSprite)
        this.playerSprite.setRotation(0)
        this.playerSprite.setAngle(0)


        //some dummies
        const a = new Phaser.Physics.Matter.Sprite(this.matter.world, 200, 200, 'ship_0001', undefined, { shape: 'circle' })
        // a.setFriction(1)//0-1
        // a.setFrictionAir(1)//1-2?
        // a.setFrictionStatic(100)
        a.setStatic(true)
        // this.matter.body.setStatic(a.body as BodyType, true)
        
        // this.matter.composite.add(this.matter.world,a.body)
        this.add.existing(a)

    }

    update(time: number, delta: number): void {
     

        //forward/backward
        if (Phaser.Input.Keyboard.JustDown(this.keys.FORWARD)) {
            this.player.speed = SPEED
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.BACKWARD)) {
            this.player.speed = -SPEED
        }

        if (Phaser.Input.Keyboard.JustUp(this.keys.FORWARD) && this.player.speed === SPEED) {
            if (this.keys.BACKWARD.isDown) {
                this.player.speed = -SPEED
            }
            else {
                this.player.speed = 0
            }
        }
        if (Phaser.Input.Keyboard.JustUp(this.keys.BACKWARD) && this.player.speed === -SPEED) {
            if (this.keys.FORWARD.isDown) {
                this.player.speed = SPEED
            }
            else {
                this.player.speed = 0
            }
        }

        //left/right
        if (Phaser.Input.Keyboard.JustDown(this.keys.LEFT)) {
            this.player.angularVelocity = -TURN_SPEED
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.RIGHT)) {
            this.player.angularVelocity = TURN_SPEED
        }

        if (Phaser.Input.Keyboard.JustUp(this.keys.LEFT)) {
            if (this.keys.RIGHT.isDown) {
                this.player.angularVelocity = TURN_SPEED
            }
            else {
                this.player.angularVelocity = 0
            }
        }
        if (Phaser.Input.Keyboard.JustUp(this.keys.RIGHT)) {
            if (this.keys.LEFT.isDown) {
                this.player.angularVelocity = -TURN_SPEED
            }
            else {
                this.player.angularVelocity = 0
            }
        }

        const [a] = this.matter.getMatterBodies([this.playerSprite]) as unknown as Body[]
        // this.matter.body.setAngularVelocity(a, this.player.angularVelocity)
        Body.setAngularVelocity(a,this.player.angularVelocity)
        const velocity = getVelocity(this.playerSprite.rotation, this.player.speed)
        // this.matter.body.setVelocity(a, velocity)
        Body.setVelocity(a,velocity)
    }
}
"use client"
import { Body } from "matter-js"
import { Input, Physics, Scene } from "phaser"
import { getVelocity } from "@/functions"
import { Keys } from "@/Keys"
import { SPEED, TURN_SPEED } from "@/CONSTANTS"
import { Character } from "@/Character"
import { Client } from "colyseus.js"
import { BACKEND_URL } from "../BACKEND_URL"
import { TestSchema } from "@/TestSchema"
import { Player } from "@/Player"

export class TestScene extends Scene {
    keys: Keys
    player: Character = new Character({ x: 200, y: 250 })
    playerSprite: Physics.Matter.Sprite
    roomName: string

    // room?: Room
    // client: Client

    constructor() {
        // console.log('TestScene constructor')
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

    init({ roomName }: { roomName: string }): void {
        this.roomName = roomName
    }

    async create() {
        // console.log('create')

        // this.keys = this.input.keyboard.addKeys('W,S,A,D,ENTER', false)
        this.keys = this.input.keyboard?.addKeys(
            {
                FORWARD: Input.Keyboard.KeyCodes.W,
                BACKWARD: Input.Keyboard.KeyCodes.S,
                LEFT: Input.Keyboard.KeyCodes.A,
                RIGHT: Input.Keyboard.KeyCodes.D,
            }) as Keys

        // console.log(this.keys)
        // const playerCollider = this.matter.bodies.circle(this.player.position.x, this.player.position.y, 16, { isSensor: false, label: 'playerCollider' })
        // const playerSensor = this.matter.bodies.circle(this.player.position.x, this.player.position.y, 20, { isSensor: true, label: 'playerCollider' })
        // const compoundBody = this.matter.body.create({ parts: [playerCollider, playerSensor] })

        this.playerSprite = new Physics.Matter.Sprite(this.matter.world, this.player.position.x, this.player.position.y, 'ship_0001', undefined, { shape: 'circle' })
        // playerSprite.setExistingBody(compoundBody, true)
        this.add.existing(this.playerSprite)
        this.playerSprite.setRotation(0)
        this.playerSprite.setAngle(0)


        //some dummies
        const a = new Physics.Matter.Sprite(this.matter.world, 200, 200, 'ship_0001', undefined, { shape: 'circle' })
        a.setStatic(true)
        this.add.existing(a)

        this.connect({ roomName: this.roomName })
    }

    private connect({ backoff, roomName }: { backoff?: number, roomName: string }) {
        console.log('connect')
        if (roomName) {
            new Client(BACKEND_URL)
                .joinOrCreate(roomName, {}, TestSchema)
                .then((room) => {
                    console.log('connected', room.sessionId)
                    console.log(room.state)
                    // this.room = room
                    room.onLeave((code: number) => {
                        this.onLeave(code, roomName)
                    })
                    room.onError((code, message) => {
                        // console.log('onerror', code, message)
                    })
                    room.onMessage('*', (type, message) => {
                        //console.log('room.onMessage', type, message)
                    })

                    // room.state.onChange(() => {
                    //     console.log('room.state.onChange')
                    // })
                    room.state.onRemove(() => {
                        // console.log('room.state.onRemove')
                    })
                    room.state.listen('turnNumber', (turnNumber, previousTurnNumber) => {
                        console.log('room.state.listen turnNumber', turnNumber)
                        console.log('matter body count', this.matter.world.getAllBodies().length)
                        console.log('character count', room.state.characters.size)
                        // console.log('connected players count', room.state.playersBySessionId.size)
                    })

                    room.state.playersByEmail.onAdd((player: Player, email: string) => {
                        // console.log('room.state.playersByEmail.onAdd')
                        this.onAddPlayer(room.state, player)
                    })

                    room.state.playersByEmail.onRemove((player: Player, email: string) => {
                        //  console.log('room.state.playersByEmail.onRemove')
                        this.onRemovePlayer(room.state, player)
                    })

                    room.state.playersBySessionId.onAdd((player: Player, sessionId: string) => {
                        // console.log('room.state.playersBySessionId.onAdd')
                        this.onAddPlayer(room.state, player)
                    })

                    room.state.playersBySessionId.onRemove((player: Player, sessionId: string) => {
                        //  console.log('room.state.playersBySessionId.onRemove')
                        this.onRemovePlayer(room.state, player)
                    })
                })
                .catch(e => {
                    this.onConnectError({ e, roomName, backoff })
                })
        }
    }

    private onConnectError({ e, backoff = 500, roomName }: { e: any, backoff?: number, roomName: string }) {
        console.log("JOIN ERROR", e, backoff)
        setTimeout(() => { this.connect({ backoff: backoff * 1.5, roomName }) }, backoff)
    }

    onLeave(code: number, roomName: string) {
        console.log('onleave', code)
        this.connect({ roomName })
    }

    private onRemovePlayer(schema: TestSchema, player: Player) {
        console.log('onRemovePlayer')
    }

    private onAddPlayer(schema: TestSchema, player: Player) {
        console.log('onAddPlayer')
    }

    update(time: number, delta: number): void {
        //forward/backward
        if (Input.Keyboard.JustDown(this.keys.FORWARD)) {
            this.player.speed = SPEED
        }

        if (Input.Keyboard.JustDown(this.keys.BACKWARD)) {
            this.player.speed = -SPEED
        }

        if (Input.Keyboard.JustUp(this.keys.FORWARD) && this.player.speed === SPEED) {
            if (this.keys.BACKWARD.isDown) {
                this.player.speed = -SPEED
            }
            else {
                this.player.speed = 0
            }
        }
        if (Input.Keyboard.JustUp(this.keys.BACKWARD) && this.player.speed === -SPEED) {
            if (this.keys.FORWARD.isDown) {
                this.player.speed = SPEED
            }
            else {
                this.player.speed = 0
            }
        }

        //left/right
        if (Input.Keyboard.JustDown(this.keys.LEFT)) {
            this.player.angularVelocity = -TURN_SPEED
        }
        if (Input.Keyboard.JustDown(this.keys.RIGHT)) {
            this.player.angularVelocity = TURN_SPEED
        }

        if (Input.Keyboard.JustUp(this.keys.LEFT)) {
            if (this.keys.RIGHT.isDown) {
                this.player.angularVelocity = TURN_SPEED
            }
            else {
                this.player.angularVelocity = 0
            }
        }
        if (Input.Keyboard.JustUp(this.keys.RIGHT)) {
            if (this.keys.LEFT.isDown) {
                this.player.angularVelocity = -TURN_SPEED
            }
            else {
                this.player.angularVelocity = 0
            }
        }

        const [a] = this.matter.getMatterBodies([this.playerSprite]) as unknown as Body[]
        // this.matter.body.setAngularVelocity(a, this.player.angularVelocity)
        Body.setAngularVelocity(a, this.player.angularVelocity)
        const velocity = getVelocity(this.playerSprite.rotation, this.player.speed)
        // this.matter.body.setVelocity(a, velocity)
        Body.setVelocity(a, velocity)
    }
}
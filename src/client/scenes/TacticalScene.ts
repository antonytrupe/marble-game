"use client"
import { Body } from "matter-js"
import { GameObjects, Input, Physics, Scene } from "phaser"
import { Client, Room } from "colyseus.js"
import { getVelocity } from "@/functions"
import { KEY_ACTION, Keys } from "@/Keys"
import { SPEED, TURN_SPEED } from "@/CONSTANTS"
import { Character } from "@/Character"
import { BACKEND_URL } from "@/client/BACKEND_URL"
import { Player } from "@/Player"
import { respondToVisibility } from "@/client/respondToVisibility"
import { TacticalHudScene } from "./TacticalHudScene"
import { TacticalSchema } from "@/TacticalSchema"
import { WorldSchema } from "@/WorldSchema"


//http://localhost:8080/?scene=TACTICAL&room=TACTICAL
export class TacticalScene extends Scene {
    static key = "TACTICAL"

    keys: Keys
    currentCharacter: Character = new Character({ x: 200, y: 250 })
    // playerSprite: Physics.Matter.Sprite
    roomName: string
    chatMode: boolean
    textInput: GameObjects.DOMElement
    static chatInput = { key: "input", url: "input.html" }
    currentPlayer: Player
    room: Room<TacticalSchema>

    constructor() {
        // console.log('TestScene constructor')
        super({
            key: TacticalScene.key,

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
        this.cameras.main.setBackgroundColor(0xf0f0f0)

        // this.load.image('ship_0001')
        Character.preload(this)
        this.load.html(TacticalScene.chatInput.key, TacticalScene.chatInput.url)
        this.load.image('background')

    }

    init({ roomName }: { roomName: string }): void {
        this.roomName = roomName
        this.keys = this.input.keyboard?.addKeys(
            {
                FORWARD: Input.Keyboard.KeyCodes.W,
                BACKWARD: Input.Keyboard.KeyCodes.S,
                LEFT: Input.Keyboard.KeyCodes.A,
                RIGHT: Input.Keyboard.KeyCodes.D,
                ENTER: Input.Keyboard.KeyCodes.ENTER,
                SLASH: Input.Keyboard.KeyCodes.FORWARD_SLASH,
                SHIFT: Input.Keyboard.KeyCodes.SHIFT
            }, false) as Keys
    }

    //, room:Room<TacticalSchema>
    private keyInputs(character: Character) {
        if (!character.inputQueue) {
            character.inputQueue = []
        }
        if (!this.room) {
            console.log('not connected')
            return
        }

        if (Input.Keyboard.JustDown(this.keys.SHIFT)) {
            character.inputQueue.push(KEY_ACTION.JUSTDOWN_SHIFT)
            this.room.send(0, KEY_ACTION.JUSTDOWN_SHIFT)
        }

        if (Input.Keyboard.JustUp(this.keys.SHIFT)) {
            this.room.send(0, KEY_ACTION.JUSTUP_SHIFT)
            character.inputQueue.push(KEY_ACTION.JUSTUP_SHIFT)
        }

        if (Input.Keyboard.JustDown(this.keys.FORWARD)) {
            this.room.send(0, KEY_ACTION.JUSTDOWN_FORWARD)
            character.inputQueue.push(KEY_ACTION.JUSTDOWN_FORWARD)
        }

        if (Input.Keyboard.JustDown(this.keys.BACKWARD)) {
            this.room.send(0, KEY_ACTION.JUSTDOWN_BACKWARD)
            character.inputQueue.push(KEY_ACTION.JUSTDOWN_BACKWARD)
        }

        if (Input.Keyboard.JustUp(this.keys.FORWARD) && character.speed === SPEED) {
            this.room.send(0, KEY_ACTION.JUSTUP_FORWARD)
            character.inputQueue.push(KEY_ACTION.JUSTUP_FORWARD)
        }
        if (Input.Keyboard.JustUp(this.keys.BACKWARD) && character.speed === -SPEED) {
            this.room.send(0, KEY_ACTION.JUSTUP_BACKWARD)
            character.inputQueue.push(KEY_ACTION.JUSTUP_BACKWARD)
        }

        //left/right
        if (Input.Keyboard.JustDown(this.keys.LEFT)) {
            this.room.send(0, KEY_ACTION.JUSTDOWN_LEFT)
            character.inputQueue.push(KEY_ACTION.JUSTDOWN_LEFT)
        }
        if (Input.Keyboard.JustDown(this.keys.RIGHT)) {
            this.room.send(0, KEY_ACTION.JUSTDOWN_RIGHT)
            character.inputQueue.push(KEY_ACTION.JUSTDOWN_RIGHT)
        }

        if (Input.Keyboard.JustUp(this.keys.LEFT)) {
            this.room.send(0, KEY_ACTION.JUSTUP_LEFT)
            character.inputQueue.push(KEY_ACTION.JUSTUP_LEFT)
        }
        if (Input.Keyboard.JustUp(this.keys.RIGHT)) {
            this.room.send(0, KEY_ACTION.JUSTUP_RIGHT)
            character.inputQueue.push(KEY_ACTION.JUSTUP_RIGHT)
        }
    }

    async create() {

        this.scene.launch(TacticalHudScene.key)
            .moveAbove(TacticalScene.key, TacticalHudScene.key)

        // console.log('create')
        Character.create(this)

        this.add.tileSprite(0, 0, 512, 512, 'background')//.setOrigin(0)

        this.setupZoom()

        this.textInput = this.add.dom(100, 100).createFromCache(TacticalScene.chatInput.key).setVisible(false)

        respondToVisibility(document.getElementById('text'), (visible: boolean) => {
            if (visible) {
                document.getElementById('text')?.focus()
            }
        })

        //some dummies
        // const a = new Physics.Matter.Sprite(this.matter.world, 500, 400, Character.spriteName, undefined, { shape: 'circle' }).setStatic(true)
        // a.setStatic(true)
        // this.add.existing(a)

        // this.cameras.main.startFollow(this.playerSprite, true, .05, .05)

        this.cameras.main.setBackgroundColor(0xf0f0f0)

        // this.cameras.main.postFX.addTiltShift(0.3, 1.0, 0.1);


        this.connect({ roomName: this.roomName })
    }

    private setupZoom() {
        const minZoom = 0.4

        this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: any, deltaY: number, deltaZ: any) => {
            if (deltaY > 0) {
                //console.log('zoom out')
                this.cameras.main.zoom *= .9
                if (this.cameras.main.zoom < minZoom) {
                    this.cameras.main.zoom = minZoom
                    console.log('switch to difference scene/room')
                }
            }

            if (deltaY < 0) {
                this.cameras.main.zoom /= .9
                if (this.cameras.main.zoom > 1) {
                    this.cameras.main.zoom = 1
                }
            }
        })
    }

    private connect({ backoff, roomName }: { backoff?: number, roomName: string }) {
        console.log('connect')
        if (roomName) {
            new Client(BACKEND_URL)
                .joinOrCreate(roomName, {}, TacticalSchema)
                .then((room) => {

                    console.log('connected', room.sessionId)
                    console.log(room.state)
                    this.room = room
                    room.onLeave((code: number) => {
                        this.onLeaveRoom(code, roomName)
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
                        this.registry.set('turnNumber', turnNumber)
                        // console.log('room.state.listen turnNumber', turnNumber)
                        console.log('matter body count', this.matter.world.getAllBodies().length)
                        console.log('character count', room.state.characters.size)
                        // console.log('connected players count', room.state.playersBySessionId.size)
                    })

                    room.state.characters.onAdd((character: Character, id: string) => {
                        // console.log('room.state.playersByEmail.onAdd')
                        this.onAddCharacter(character)
                    })

                    room.state.characters.onRemove((character: Character, id: string) => {
                        // console.log('room.state.playersByEmail.onAdd')
                        this.onRemoveCharacter(character)
                    })

                    room.state.playersByEmail.onAdd((player: Player, email: string) => {
                        // console.log('room.state.playersByEmail.onAdd')
                        this.onAddPlayer(player, room)
                    })

                    room.state.playersByEmail.onRemove((player: Player, email: string) => {
                        //  console.log('room.state.playersByEmail.onRemove')
                        this.onRemovePlayer(player)
                    })

                    room.state.playersBySessionId.onAdd((player: Player) => {
                        // console.log('room.state.playersBySessionId.onAdd')
                        this.onAddPlayer(player, room)
                    })

                    room.state.playersBySessionId.onRemove((player: Player, sessionId: string) => {
                        //  console.log('room.state.playersBySessionId.onRemove')
                        this.onRemovePlayer(player)
                    })
                })
                .catch(e => {
                    this.onConnectError({ e, roomName, backoff })
                })
        }
    }
    onRemoveCharacter(character: Character) {
        console.log('onRemoveCharacter')
    }

    private onRemovePlayer(player: Player) {
        console.log('onRemovePlayer')
    }

    private onAddPlayer(player: Player, room: Room<TacticalSchema>) {
        console.log('onAddPlayer')
        console.log(room.sessionId)
        console.log(player.sessionId)
        if (player.sessionId == room.sessionId) {
            console.log('current player')
            this.currentPlayer = player
        }

        //watch for players to change their sessionId
        player.onChange(() => {
            console.log('player change')

            if (player.sessionId == room.sessionId) {
                console.log('current player')
                this.currentPlayer = player

            }
        })
    }

    onAddCharacter(character: Character) {
        console.log('onAddCharacter', character)

        //TODO
        if (!character.body) {
            const playerCollider = this.matter.bodies.circle(character.position.x, character.position.y, 30, { isSensor: false, label: 'playerCollider' })
            const playerSensor = this.matter.bodies.circle(character.position.x, character.position.y, 32, { isSensor: true, label: 'playerCollider' })
            const compoundBody = this.matter.body.create({ parts: [playerCollider, playerSensor] })

            character.sprite = new Physics.Matter.Sprite(this.matter.world, this.currentCharacter.position.x, this.currentCharacter.position.y, Character.spriteName, undefined, { shape: 'circle' })

            character.sprite.play('marble-roll', true).anims.pause()


            character.sprite.setExistingBody(compoundBody, true)

            this.add.existing(character.sprite)
            character.sprite.setRotation(0)
            character.sprite.setAngle(0)
            character.body = character.sprite.body as unknown as Body
        }

        if (this.currentPlayer?.characterId == character.id) {
            this.cameras.main.startFollow(character.sprite, true, .05, .05)
        }

        character.velocity.onChange(() => {
            if (character.velocity !== undefined) {
                if (character.velocity.x !== 0 || character.velocity.y !== 0) {
                    // Body.setStatic(player.body, false)
                    // this.matter.body.setStatic(mb, false)
                    Character.move(character)
                }
                // this.matter.body.setVelocity(mb, character.velocity)

                // if (mb.speed > 0) {
                //     // playerSprite.play('marble-roll', true)
                //     // playerSprite.anims.exists
                //     // character.sprite.anims.reverse()
                //     if ((character.speed < 0 && !character.sprite.anims.inReverse) || character.speed > 0 && character.sprite.anims.inReverse) {
                //         character.sprite.anims.reverse()

                //     }
                //     character.sprite.anims.resume()
                //     // playerSprite.anims.resume()
                //     // playerSprite.anims.hasStarted
                // }
                // else {
                //     character.sprite.anims.pause()
                //     // playerSprite.stop()
                // }
            }
        })

        character.position.onChange(() => {
            if (character.position.x !== undefined && character.position.y != undefined) {
                Body.setPosition(character.body, character.position)
                // this.matter.body.setPosition(mb, { x: character.position.x, y: character.position.y }, false)
            }

            character.sprite.setData('serverX', character.position.x)
            character.sprite.setData('serverY', character.position.y)
        })

    }

    private onConnectError({ e, backoff = 500, roomName }: { e: any, backoff?: number, roomName: string }) {
        console.log("JOIN ERROR", e, backoff)
        console.log(`trying again in ${backoff / 1000} seconds`)
        setTimeout(() => { this.connect({ backoff: backoff * 1.5, roomName }) }, backoff)
    }

    onLeaveRoom(code: number, roomName: string) {
        console.log('onleave', code)
        // this.room.removeAllListeners()
        this.matter.world.remove(this.matter.world.getAllBodies())
        this.connect({ roomName })
    }

    update(time: number, delta: number): void {

        if (Phaser.Input.Keyboard.JustDown(this.keys.SLASH) && !this.chatMode) {
            this.chatMode = true
            const text: HTMLInputElement = this.textInput.getChildByName("text") as HTMLInputElement
            text.value = '/'
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.ENTER)) {
            this.chatMode = !this.chatMode

            if (!this.chatMode) {
                const text: HTMLInputElement = this.textInput.getChildByName("text") as HTMLInputElement
                console.log('chat', text.value)
                // this.room.send('chat', text.value)
                text.value = ''
            }
        }

        this.textInput.setVisible(this.chatMode)


        // this.textInput.x = this.currentCharacter.body.position.x * this.cameras.main.zoom - this.textInput.width / 2 + this.textInput.width / 2
        // this.textInput.y = this.currentCharacter.body.position.y * this.cameras.main.zoom + 60 / 2 + this.textInput.height / 2


        if (!this.chatMode && !!this.currentPlayer?.characterId) {
            // console.log(this.currentPlayer?.characterId)
            //forward/backward
            // const character = WorldSchema.getCharacter(this.room.state, this.currentPlayer.characterId)
            if (!!this.currentCharacter) {
                // console.log(character.body.id)
                this.keyInputs(this.currentCharacter)
                //Character.move(this.currentCharacter)
            }
        }


        //forward/backward
        if (Input.Keyboard.JustDown(this.keys.FORWARD)) {
            this.currentCharacter.speed = SPEED
        }

        if (Input.Keyboard.JustDown(this.keys.BACKWARD)) {
            this.currentCharacter.speed = -SPEED
        }

        if (Input.Keyboard.JustUp(this.keys.FORWARD) && this.currentCharacter.speed === SPEED) {
            if (this.keys.BACKWARD.isDown) {
                this.currentCharacter.speed = -SPEED
            }
            else {
                this.currentCharacter.speed = 0
            }
        }
        if (Input.Keyboard.JustUp(this.keys.BACKWARD) && this.currentCharacter.speed === -SPEED) {
            if (this.keys.FORWARD.isDown) {
                this.currentCharacter.speed = SPEED
            }
            else {
                this.currentCharacter.speed = 0
            }
        }

        //left/right
        if (Input.Keyboard.JustDown(this.keys.LEFT)) {
            this.currentCharacter.angularVelocity = -TURN_SPEED
        }
        if (Input.Keyboard.JustDown(this.keys.RIGHT)) {
            this.currentCharacter.angularVelocity = TURN_SPEED
        }

        if (Input.Keyboard.JustUp(this.keys.LEFT)) {
            if (this.keys.RIGHT.isDown) {
                this.currentCharacter.angularVelocity = TURN_SPEED
            }
            else {
                this.currentCharacter.angularVelocity = 0
            }
        }
        if (Input.Keyboard.JustUp(this.keys.RIGHT)) {
            if (this.keys.LEFT.isDown) {
                this.currentCharacter.angularVelocity = -TURN_SPEED
            }
            else {
                this.currentCharacter.angularVelocity = 0
            }
        }

        // const [a] = this.matter.getMatterBodies([this.currentCharacter.sprite]) as unknown as Body[]
        //  Body.setAngularVelocity(a, this.currentCharacter.angularVelocity)
        // const velocity = getVelocity(this.currentCharacter.sprite.rotation, this.currentCharacter.speed)
        //  Body.setVelocity(a, velocity)
    }
}
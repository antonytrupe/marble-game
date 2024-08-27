import { Body } from "matter-js"
import { Room, Client } from "colyseus.js"
import { GameObjects, Input, Physics, Scene, Types } from "phaser"
import { WorldSchema } from "@/WorldSchema"
import { Player } from "@/Player"
import { Message } from "@/Message"
import { KEY_ACTION, Keys } from "@/Keys"
import { SPEED } from "@/CONSTANTS"
import { respondToVisibility } from "@/client/respondToVisibility"
import ChatBubble from "@/client/ChatBubble"
import { BACKEND_URL } from "@/client/BACKEND_URL"

export class MarbleGameScene extends Scene {

    room: Room<WorldSchema>

    currentPlayerSprite: Physics.Matter.Sprite
    playerSprites: { [sessionId: string]: Physics.Matter.Image } = {}

    keys: Keys
    // world: World = new World()
    roomName: string

    textInput: GameObjects.DOMElement

    chatMode: boolean = false
    scaleSprite: GameObjects.TileSprite

    constructor() {
        // console.log('scene constructor')
        super({
            key: 'MarbleGameScene',
            physics: {
                default: "matter"
            }
        })
    }

    preload() {
        // console.log('MarbleGameScene preload')
        this.load.image('background')
        this.load.html("input", "input.html")
        Player.preload(this)
        this.load.image('scale')
    }

    init({ roomName }: { roomName: string }): void {
        console.log('MarbleGameScene init')
        this.roomName = roomName
    }

    async create() {
        console.log('MarbleGameScene create')

        Player.create(this)

        this.add.tileSprite(0, 0, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(512, 0, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(1024, 0, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(0, 512, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(512, 512, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(1024, 512, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(0, 1024, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(512, 1024, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(1024, 1024, 512, 512, 'background')//.setOrigin(0)

        this.scaleSprite = this.add.tileSprite(0, 0, 306, 60, 'scale').setOrigin(0, 0).setScrollFactor(1).setScale(1, 1)

        this.textInput = this.add.dom(100, 100).createFromCache("input").setVisible(false)

        respondToVisibility(document.getElementById('text'), (visible: boolean) => {
            if (visible) {
                document.getElementById('text')?.focus()
            }
        })

        this.cameras.main.setRotation(0)

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

        this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: any, deltaY: number, deltaZ: any) => {
            if (deltaY > 0) {
                //console.log('zoom out')
                this.cameras.main.zoom *= .9
                if (this.cameras.main.zoom < 0.1) {
                    this.cameras.main.zoom = 0.1
                }
            }

            if (deltaY < 0) {
                this.cameras.main.zoom /= .9
                if (this.cameras.main.zoom > 1) {
                    this.cameras.main.zoom = 1
                }
            }
            console.log(this.cameras.main.zoom)
            if (this.cameras.main.zoom <= .11) {
                console.log('switch to difference scene/room')
            }
        })

        //connect with the room
        await this.connect()
        this.scene.launch('HUD')
        this.cameras.main.setZoom(1)
        //this.cameras.main.useBounds = false
        //this.cameras.main.setBounds(0, 0, 800, 600)
    }

    update(time: number, delta: number): void {
        // console.log('update')

        if (!this.currentPlayerSprite) { return }

        const currentPlayer: Player | undefined = this.room.state.players.get(this.room.sessionId)

        if (Phaser.Input.Keyboard.JustDown(this.keys.ENTER)) {
            this.chatMode = !this.chatMode

            if (!this.chatMode) {
                const text: HTMLInputElement = this.textInput.getChildByName("text") as HTMLInputElement
                // console.log('chat', text.value)
                this.room.send('chat', text.value)
                text.value = ''
            }
        }

        this.textInput.setVisible(this.chatMode)
        this.textInput.x = this.currentPlayerSprite.x - this.textInput.width / 2 + this.textInput.width / 2
        this.textInput.y = this.currentPlayerSprite.y + this.currentPlayerSprite.height / 2 + this.textInput.height / 2

        if (!this.chatMode && !!currentPlayer) {
            //forward/backward
            this.keyInputs(currentPlayer)
            Player.move(currentPlayer)
        }

        //this.localRef.x = this.currentPlayer.x
        //this.localRef.y = this.currentPlayer.y

        // for (let sessionId in this.playerEntities) {
        //     //interpolate all player entities
        //     //(except the current player)
        //     if (sessionId === this.room.sessionId) {
        //         //continue
        //     }

        //     const entity = this.playerEntities[sessionId]
        //     const [mb] = this.matter.getMatterBodies([this.currentPlayerSprite])

        //     // this.matter.body.setVelocity(mb, getVelocity(mb.angle, mb.speed))

        //     //lerp
        //     const { serverX, serverY } = entity.data.values

        //     //entity.x = Phaser.Math.Linear(entity.x, serverX, 0.2)
        //     //entity.y = Phaser.Math.Linear(entity.y, serverY, 0.2)
        //     //this.matter.body.setPosition(mb, {
        //     //x: Phaser.Math.Linear(entity.x, serverX, 0.2),
        //     //y: Phaser.Math.Linear(entity.y, serverY, 0.2)
        //     //}, false)
        // }
    }

    private keyInputs(player: Player) {
        if (!player.inputQueue) {
            player.inputQueue = []
        }

        if (Input.Keyboard.JustDown(this.keys.SHIFT)) {
            player.inputQueue.push(KEY_ACTION.JUSTDOWN_SHIFT)
            this.room.send(0, KEY_ACTION.JUSTDOWN_SHIFT)
        }

        if (Input.Keyboard.JustUp(this.keys.SHIFT)) {
            this.room.send(0, KEY_ACTION.JUSTUP_SHIFT)
            player.inputQueue.push(KEY_ACTION.JUSTUP_SHIFT)
        }

        if (Input.Keyboard.JustDown(this.keys.FORWARD)) {
            this.room.send(0, KEY_ACTION.JUSTDOWN_FORWARD)
            player.inputQueue.push(KEY_ACTION.JUSTDOWN_FORWARD)
        }

        if (Input.Keyboard.JustDown(this.keys.BACKWARD)) {
            this.room.send(0, KEY_ACTION.JUSTDOWN_BACKWARD)
            player.inputQueue.push(KEY_ACTION.JUSTDOWN_BACKWARD)
        }

        if (Input.Keyboard.JustUp(this.keys.FORWARD) && player.speed === SPEED) {
            this.room.send(0, KEY_ACTION.JUSTUP_FORWARD)
            player.inputQueue.push(KEY_ACTION.JUSTUP_FORWARD)
        }
        if (Input.Keyboard.JustUp(this.keys.BACKWARD) && player.speed === -SPEED) {
            this.room.send(0, KEY_ACTION.JUSTUP_BACKWARD)
            player.inputQueue.push(KEY_ACTION.JUSTUP_BACKWARD)
        }

        //left/right
        if (Input.Keyboard.JustDown(this.keys.LEFT)) {
            this.room.send(0, KEY_ACTION.JUSTDOWN_LEFT)
            player.inputQueue.push(KEY_ACTION.JUSTDOWN_LEFT)
        }
        if (Input.Keyboard.JustDown(this.keys.RIGHT)) {
            this.room.send(0, KEY_ACTION.JUSTDOWN_RIGHT)
            player.inputQueue.push(KEY_ACTION.JUSTDOWN_RIGHT)
        }

        if (Input.Keyboard.JustUp(this.keys.LEFT)) {
            this.room.send(0, KEY_ACTION.JUSTUP_LEFT)
            player.inputQueue.push(KEY_ACTION.JUSTUP_LEFT)
        }
        if (Input.Keyboard.JustUp(this.keys.RIGHT)) {
            this.room.send(0, KEY_ACTION.JUSTUP_RIGHT)
            player.inputQueue.push(KEY_ACTION.JUSTUP_RIGHT)
        }
    }

    private onRemove(sessionId: string) {
        const entity = this.playerSprites[sessionId]
        if (entity) {
            entity.destroy()
            delete this.playerSprites[sessionId]
        }
    }

    private onAdd(sessionId: string, player: Player) {
        // console.log(sessionId, 'joined marblegame')

        let playerSprite: Physics.Matter.Sprite
        {
            const playerCollider = this.matter.bodies.circle(player.position.x, player.position.y, 30, { isSensor: false, label: 'playerCollider' })
            const playerSensor = this.matter.bodies.circle(player.position.x, player.position.y, 32, { isSensor: true, label: 'playerCollider' })
            const compoundBody = this.matter.body.create({ parts: [playerCollider, playerSensor] })

            playerSprite = new Physics.Matter.Sprite(this.matter.world,
                player.position.x, player.position.y,
                'marble', 0, {
                shape: 'circle',
                friction: .0,
                frictionAir: .00,
                frictionStatic: .0, isStatic: true
            })
            playerSprite.play('marble-roll', true).anims.pause()

            playerSprite.setExistingBody(compoundBody, true)

            player.body = playerSprite.body as unknown as Body

            this.add.existing(playerSprite)
        }

        playerSprite.on('pointerdown', () => {
            console.log('click', player.id)
        })

        Player.move(player)
        const [mb] = this.matter.getMatterBodies([playerSprite])
        this.matter.body.setAngle(mb, player.angle, true)
        this.matter.body.setAngularVelocity(mb, player.angularVelocity)
        this.playerSprites[sessionId] = playerSprite

        //is current player
        if (sessionId === this.room.sessionId) {
            this.currentPlayerSprite = playerSprite
            this.cameras.main.startFollow(playerSprite, true, .7, .7)
        }

        player.messages.onAdd((item) => {
            this.onChat(item, player)
        })

        player.velocity.onChange(() => {
            if (player.velocity !== undefined) {
                if (player.velocity.x !== 0 || player.velocity.y !== 0) {
                    // Body.setStatic(player.body, false)
                    // this.matter.body.setStatic(mb, false)
                    Player.move(player)
                }
                this.matter.body.setVelocity(mb, player.velocity)

                if (mb.speed > 0) {
                    // playerSprite.play('marble-roll', true)
                    // playerSprite.anims.exists
                    playerSprite.anims.resume()
                    // playerSprite.anims.resume()
                    // playerSprite.anims.hasStarted
                }
                else {
                    playerSprite.anims.pause()
                    // playerSprite.stop()
                }
            }
        })

        player.position.onChange(() => {
            if (player.position.x !== undefined && player.position.y != undefined) {
                this.matter.body.setPosition(mb, { x: player.position.x, y: player.position.y }, false)
            }

            playerSprite.setData('serverX', player.position.x)
            playerSprite.setData('serverY', player.position.y)
        })

        player.onChange(() => {
            Player.move(player)

            if (player.angle !== undefined) {
                this.matter.body.setAngle(mb, player.angle, true)
            }
            if (player.angularVelocity !== undefined) {
                if (player.angularVelocity !== 0) {
                    Player.move(player)
                }
                this.matter.body.setAngularVelocity(mb, player.angularVelocity)
            }
        })
    }

    private onChat(message: Message, player: Player) {
        // console.log('from server', item.message, item.time, key)
        this.add.existing(new ChatBubble({
            scene: this, message: message,
            player: player
        }))
    }

    async connect() {
        console.log('MarbleGameScene connect')
        //add connection status text
        const connectionStatusText = this.add
            .text(0, 0, "Trying to connect with the server...")
            .setStyle({ color: "#ff0000" })
            .setPadding(4)

        const client = new Client(BACKEND_URL)

        try {
            this.room = await client.joinOrCreate(this.roomName, {})

            this.room.state.onChange(() => {
                this.registry.set('turnNumber', this.room.state.turnNumber)
            })

            this.room.state.players.onAdd((player, sessionId: string) => {
                this.onAdd(sessionId, player)
            })

            //remove local reference when entity is removed from the server
            this.room.state.players.onRemove((player, sessionId) => {
                this.onRemove(sessionId)
            })
            connectionStatusText.destroy()

        } catch (e) {
            //couldn't connect
            console.log(e)
            connectionStatusText.text = "Could not connect with the server."
        }
    }
}
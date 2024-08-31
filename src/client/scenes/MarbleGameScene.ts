import { Body } from "matter-js"
import { Room, Client } from "colyseus.js"
import { GameObjects, Input, Physics, Scene } from "phaser"
import { WorldSchema } from "@/WorldSchema"
import { Player } from "@/Player"
import { Message } from "@/Message"
import { KEY_ACTION, Keys } from "@/Keys"
import { SPEED } from "@/CONSTANTS"
import { respondToVisibility } from "@/client/respondToVisibility"
import ChatBubble from "@/client/ChatBubble"
import { BACKEND_URL } from "@/client/BACKEND_URL"
import { Character } from "@/Character"

export class MarbleGameScene extends Scene {

    room: Room<WorldSchema>

    currentPlayerSprite: Physics.Matter.Sprite
    currentPlayer: Player
    currentCharacter: Character

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
        Character.preload(this)
        this.load.image('scale')
    }

    init({ roomName }: { roomName: string }): void {
        console.log('MarbleGameScene init')
        this.roomName = roomName
    }

    async create() {
        console.log('MarbleGameScene create')

        this.registry.events.addListener('currentPlayer.email', () => {
            // console.log('logged in')
            this.connect()
        })

        Character.create(this)

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
        // await this.connect()
        this.scene.launch('HUD')
        this.cameras.main.setZoom(1)
        //this.cameras.main.useBounds = false
        //this.cameras.main.setBounds(0, 0, 800, 600)
    }

    async update(time: number, delta: number): Promise<void> {
        // console.log('update')

        // if (!this.room && this.registry.get('currentPlayer.email')) {

        //     await this.connect()
        // }

        if (!this.currentPlayerSprite) { return }

        // const currentPlayer: Player | undefined = this.room.state.players.get(this.room.sessionId)

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
        this.textInput.x = this.currentPlayerSprite.x * this.cameras.main.zoom - this.textInput.width / 2 + this.textInput.width / 2
        this.textInput.y = this.currentPlayerSprite.y * this.cameras.main.zoom + this.currentPlayerSprite.height / 2 + this.textInput.height / 2

        if (!this.chatMode && !!this.currentCharacter) {
            //forward/backward
            this.keyInputs(this.currentCharacter)
            Character.move(this.currentCharacter)
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

    private keyInputs(character: Character) {
        if (!character.inputQueue) {
            character.inputQueue = []
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

    // private onRemove(sessionId: string) {
    //     const entity = this.playerSprites[sessionId]
    //     if (entity) {
    //         entity.destroy()
    //         delete this.playerSprites[sessionId]
    //     }
    // }

    private addPlayer(player: Player, sessionId: string) {
        // console.log(sessionId, JSON.stringify(player), 'joined marblegame')
        // console.log('this.room.sessionId', this.room.sessionId)
        if (sessionId == this.room.sessionId) {
            // console.log('setting current player')
            this.currentPlayer = player
            // const c = this.room.state.characters.get(this.currentPlayer.characterId)
            // if (c) {
            //     console.log('setting currentCharacter')
            //     this.currentCharacter = c
            // }
        }
    }

    private addCharacter(character: Character) {
        // console.log('addCharacter', character.id)
        // console.log('characters.size', JSON.parse(JSON.stringify(this.room.state.characters.size)))
        // console.log('world bodies count start', this.matter.world.getAllBodies().length)

        let playerSprite: Physics.Matter.Sprite
        {
            const playerCollider = this.matter.bodies.circle(character.position.x, character.position.y, 30, { isSensor: false, label: 'playerCollider' })
            const playerSensor = this.matter.bodies.circle(character.position.x, character.position.y, 32, { isSensor: true, label: 'playerCollider' })
            const compoundBody = this.matter.body.create({ parts: [playerCollider, playerSensor] })

            playerSprite = new Physics.Matter.Sprite(this.matter.world,
                character.position.x, character.position.y,
                'marble', 0, {
                shape: 'circle',
                friction: .0,
                frictionAir: .00,
                frictionStatic: .0,
                isStatic: true
            })

            playerSprite.play('marble-roll', true).anims.pause()

            playerSprite.setExistingBody(compoundBody, true)

            character.body = playerSprite.body as unknown as Body

            this.add.existing(playerSprite)
        }
        playerSprite.on('pointerdown', () => {
            console.log('click', character.id)
        })

        Character.move(character)
        const [mb] = this.matter.getMatterBodies([playerSprite])
        // this.matter.body.setAngle(mb, player.angle, true)
        // this.matter.body.setAngularVelocity(mb, player.angularVelocity)
        // this.playerSprites[sessionId] = playerSprite

        //TODO is current player's character
        // console.log('this.currentPlayer', JSON.stringify(this.currentPlayer))
        // console.log('character.id', character.id)
        if (this.currentPlayer?.characterId == character.id) {
            this.currentPlayerSprite = playerSprite
            this.currentCharacter = character
            this.cameras.main.startFollow(playerSprite, true, .7, .7)
        }
        character.messages.onAdd((item) => {
            this.onChat(item, character)
        })

        character.velocity.onChange(() => {
            if (character.velocity !== undefined) {
                if (character.velocity.x !== 0 || character.velocity.y !== 0) {
                    // Body.setStatic(player.body, false)
                    // this.matter.body.setStatic(mb, false)
                    Character.move(character)
                }
                this.matter.body.setVelocity(mb, character.velocity)

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

        character.position.onChange(() => {
            if (character.position.x !== undefined && character.position.y != undefined) {
                Body.setPosition(character.body, character.position)
                // this.matter.body.setPosition(mb, { x: character.position.x, y: character.position.y }, false)
            }

            playerSprite.setData('serverX', character.position.x)
            playerSprite.setData('serverY', character.position.y)
        })

        character.onChange(() => {
            Character.move(character)

            if (character.angle !== undefined) {
                // this.matter.body.setAngle(mb, character.angle, true)
                Body.setAngle(character.body, character.angle)
            }
            if (character.angularVelocity !== undefined) {
                if (character.angularVelocity !== 0) {
                    Character.move(character)
                }
                Body.setAngularVelocity(character.body, character.angularVelocity)
                this.matter.body.setAngularVelocity(mb, character.angularVelocity)
            }
        })

        // console.log('world bodies count end', this.matter.world.getAllBodies().length)
    }

    private onChat(message: Message, character: Character) {
        // console.log('from server', item.message, item.time, key)
        this.add.existing(new ChatBubble({
            scene: this, message: message,
            character: character
        }))
    }

    async disconnect() {
        await this.room.leave(true)
    }

    async connect() {
        console.log('MarbleGameScene connect')
        //add connection status text
        const connectionStatusText = this.add
            .text(300, 0, "Trying to connect with the server...")
            .setStyle({ color: "#ff0000" })
            .setPadding(4)

        const client = new Client(BACKEND_URL)

        try {
            this.room = await client.joinOrCreate(this.roomName, {})

            this.room.state.onChange(() => {
                this.registry.set('turnNumber', this.room.state.turnNumber)
            })

            this.room.state.playersBySessionId.onAdd((player, sessionId: string) => {
                this.addPlayer(player, sessionId)
            })

            this.room.state.characters.onAdd((character, characterId: string) => {
                // console.log('new character', characterId)
                this.addCharacter(character)
            })

            //remove local reference when entity is removed from the server
            this.room.state.playersBySessionId.onRemove((player, sessionId) => {
                // this.onRemove(sessionId)
            })
            connectionStatusText.destroy()

        } catch (e) {
            //couldn't connect
            console.log(e)
            connectionStatusText.text = "Could not connect with the server."
        }
    }
}
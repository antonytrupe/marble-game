import { Body } from "matter-js"
import { Room, Client } from "colyseus.js"
import{ GameObjects, Input, Physics, Scene, Types} from "phaser"
import { WorldSchema } from "@/WorldSchema"
import { Player } from "@/Player"
import { Message } from "@/Message"
import { getVelocity } from "@/functions"
import World from "@/World"
import { respondToVisibility } from "@/client/respondToVisibility"
import ChatBubble from "@/client/ChatBubble"
import { KEY_ACTION, Keys } from "@/Keys"
import { SPEED, TURN_SPEED } from "@/SPEED";
import { BACKEND_URL } from "@/client/BACKEND_URL"

export class MarbleGameScene extends Scene {

    room: Room<WorldSchema>

    currentPlayer: Physics.Matter.Sprite
    playerEntities: { [sessionId: string]: Physics.Matter.Image } = {}

    keys: Keys
    world: World = new World()
    roomName: string

    textInput: GameObjects.DOMElement

    chatMode: boolean = false

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
        console.log('MarbleGameScene preload')
        this.load.image('background')
        this.load.html("input", "input.html")
        Player.preload(this)

    }

    init({ multiplayer = false, roomName }: { multiplayer: boolean, roomName: string }): void {
        console.log('MarbleGameScene init')
        this.roomName = roomName
        // console.log(multiplayer)
    }

    async create() {
        console.log('MarbleGameScene create')

        Player.create(this)
        const textStyle: Types.GameObjects.Text.TextStyle = {
            color: "#000000",
            fontSize: "24px",
            fontFamily: "Arial",
            backgroundColor: "white"
        }

        this.add.tileSprite(0, 0, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(512, 0, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(1024, 0, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(0, 512, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(512, 512, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(1024, 512, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(0, 1024, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(512, 1024, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(1024, 1024, 512, 512, 'background')//.setOrigin(0)

        this.textInput = this.add.dom(100, 100).createFromCache("input").setVisible(false)

        respondToVisibility(document.getElementById('text'), (visible: boolean) => {
            // console.log('visible', visible)
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
                SLASH: Input.Keyboard.KeyCodes.FORWARD_SLASH
            }, false) as Keys

        this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: any, deltaY: number, deltaZ: any) => {
            if (deltaY > 0) {
                //console.log('zoom out')
                var newZoom = this.cameras.main.zoom - .1
                if (newZoom >= 0.6) {
                    this.cameras.main.zoom = newZoom
                }
            }

            if (deltaY < 0) {
                var newZoom = this.cameras.main.zoom + .1
                if (newZoom <= 4) {
                    this.cameras.main.zoom = newZoom
                }
            }
            console.log(this.cameras.main.zoom)
            //this.scaleSprite.setScrollFactor( this.cameras.main.zoom)
            //this.get.tileSprite(0, 0, 108, 10, 'scale').setOrigin(0).setScrollFactor(0)
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

        //this.room.connection.isOpen
        if (!this.currentPlayer) { return }

        //this.matter.composite.get(this.matter.world,this.currentPlayer,'body')
        const [body] = this.matter.getMatterBodies([this.currentPlayer]) as unknown as Body[]
        //const mb=this.matter.composite.get(this.matter.world.localWorld as unknown as CompositeType, this.currentPlayer., 'body')
        const currentPlayer: Player | undefined = this.room.state.players.get(this.room.sessionId)
        // console.log(currentPlayer)
        //console.log(mb.angle)

        if (Phaser.Input.Keyboard.JustDown(this.keys.ENTER)) {
            // console.log('enter down')
            // this.textInputToggle = !this.textInputToggle
            this.chatMode = !this.chatMode
            // const text: HTMLInputElement = this.textInput.getChildByName("text") as HTMLInputElement
            // console.log(document.activeElement)

            if (!this.chatMode) {
                const text: HTMLInputElement = this.textInput.getChildByName("text") as HTMLInputElement
                // console.log('chat', text.value)
                this.room.send('chat', text.value)
                text.value = ''
            }
        }

        this.textInput.setVisible(this.chatMode)
        // this.textInput.
        // console.log(this.currentPlayer.x)
        this.textInput.x = this.currentPlayer.x - this.textInput.width / 2 + this.textInput.width / 2
        this.textInput.y = this.currentPlayer.y + this.currentPlayer.height / 2 + this.textInput.height / 2
        // this.textInput.width

        if (!this.chatMode && !!currentPlayer) {
            //forward/backward
            this.move(currentPlayer, body, this.currentPlayer)
        }

        //this.localRef.x = this.currentPlayer.x
        //this.localRef.y = this.currentPlayer.y

        for (let sessionId in this.playerEntities) {
            //interpolate all player entities
            //(except the current player)
            if (sessionId === this.room.sessionId) {
                //continue
            }

            const entity = this.playerEntities[sessionId]
            const [mb] = this.matter.getMatterBodies([this.currentPlayer])

            //TODO what about going backwards?
            this.matter.body.setVelocity(mb, getVelocity(mb.angle, mb.speed))

            //lerp
            const { serverX, serverY } = entity.data.values

            //entity.x = Phaser.Math.Linear(entity.x, serverX, 0.2)
            //entity.y = Phaser.Math.Linear(entity.y, serverY, 0.2)
            //this.matter.body.setPosition(mb, {
            //x: Phaser.Math.Linear(entity.x, serverX, 0.2),
            //y: Phaser.Math.Linear(entity.y, serverY, 0.2)
            //}, false)
        }
    }

    private move(player: Player, body: Body, sprite: Physics.Matter.Sprite) {
        if (Input.Keyboard.JustDown(this.keys.FORWARD)) {
            this.room.send(0, KEY_ACTION.JUSTDOWN_FORWARD)
            player.speed = SPEED
        }

        if (Input.Keyboard.JustDown(this.keys.BACKWARD)) {
            this.room.send(0, KEY_ACTION.JUSTDOWN_BACKWARD)
            player.speed = -SPEED
        }

        if (Input.Keyboard.JustUp(this.keys.FORWARD) && player.speed === SPEED) {
            this.room.send(0, KEY_ACTION.JUSTUP_FORWARD)
            if (this.keys.BACKWARD.isDown) {
                player.speed = -SPEED
            }
            else {
                player.speed = 0
            }
        }
        if (Input.Keyboard.JustUp(this.keys.BACKWARD) && player.speed === -SPEED) {
            this.room.send(0, KEY_ACTION.JUSTUP_BACKWARD)
            if (this.keys.FORWARD.isDown) {
                player.speed = SPEED
            }
            else {
                player.speed = 0
            }
        }

        //left/right
        if (Input.Keyboard.JustDown(this.keys.LEFT)) {
            this.room.send(0, KEY_ACTION.JUSTDOWN_LEFT)
            player.angularVelocity = -TURN_SPEED
        }
        if (Input.Keyboard.JustDown(this.keys.RIGHT)) {
            this.room.send(0, KEY_ACTION.JUSTDOWN_RIGHT)
            player.angularVelocity = TURN_SPEED
        }

        if (Input.Keyboard.JustUp(this.keys.LEFT)) {
            this.room.send(0, KEY_ACTION.JUSTUP_LEFT)
            if (this.keys.RIGHT.isDown) {
                player.angularVelocity = TURN_SPEED
            }
            else {
                player.angularVelocity = 0
            }
        }
        if (Input.Keyboard.JustUp(this.keys.RIGHT)) {
            this.room.send(0, KEY_ACTION.JUSTUP_RIGHT)
            if (this.keys.LEFT.isDown) {
                player.angularVelocity = -TURN_SPEED
            }
            else {
                player.angularVelocity = 0
            }
        }

        Body.setAngularVelocity(body, player.angularVelocity)
        const velocity = getVelocity(body.angle, player.speed)
        Body.setVelocity(body, velocity)

        if (body.speed <= .01 && body.angularSpeed <= .01) {
            Body.setStatic(body, true)
        }
        else {
            Body.setStatic(body, false)
        }
    }

    private onRemove(sessionId: string) {
        const entity = this.playerEntities[sessionId]
        if (entity) {
            entity.destroy()
            delete this.playerEntities[sessionId]
        }
    }

    private onAdd(sessionId: string, player: Player) {
        // console.log(sessionId, 'joined marblegame')

        let playerSprite: Physics.Matter.Sprite
        {
            const playerCollider = this.matter.bodies.circle(player.position.x, player.position.y, 16, { isSensor: false, label: 'playerCollider' })
            const playerSensor = this.matter.bodies.circle(player.position.x, player.position.y, 20, { isSensor: true, label: 'playerCollider' })
            const compoundBody = this.matter.body.create({ parts: [playerCollider, playerSensor] })

            playerSprite = new Physics.Matter.Sprite(this.matter.world,
                player.position.x, player.position.y,
                'marble', 0, {
                shape: 'circle',
                friction: .0,
                frictionAir: .00,
                frictionStatic: .0
            })
            player.body = playerSprite.body as unknown as Body

            playerSprite.setExistingBody(compoundBody, true)
            this.add.existing(playerSprite)
            // playerSprite.play('marble-roll')

        }

        playerSprite.on('pointerdown', () => {
            console.log('click', player.id)
        })

        const [mb] = this.matter.getMatterBodies([playerSprite])
        //console.log(mb.id)
        this.matter.body.setAngle(mb, player.angle, true)
        this.matter.body.setAngularVelocity(mb, player.angularVelocity)
        //this.matter.body.setVelocity(mb, getVelocity(entity.rotation, player.speed))
        // this.matter.body.setInertia(mb, Infinity)
        // mb.restitution = 0
        //this.matter.body.setStatic(mb,true)
        this.playerEntities[sessionId] = playerSprite

        //is current player
        if (sessionId === this.room.sessionId) {
            this.currentPlayer = playerSprite
            this.cameras.main.startFollow(playerSprite, true, .7, .7)
            // this.currentPlayer.play('marble-roll',true)
        }

        player.messages.onAdd((item) => {
            this.onChat(item, player)
        })

        player.velocity.onChange(() => {
            if (player.velocity !== undefined) {
                if (player.velocity.x !== 0 || player.velocity.y !== 0) {
                    this.world.setStatic(playerSprite.body as unknown as Body, player)
                    // this.matter.body.setStatic(mb, false)

                }
                this.matter.body.setVelocity(mb, player.velocity)
                // console.log(mb.velocity)

                if (mb.speed > 0) {
                    playerSprite.play('marble-roll', true)
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
                //console.log('xxxxx')
                //console.log('speed', player.speed)
                this.matter.body.setPosition(mb, { x: player.position.x, y: player.position.y }, false)
            }

            playerSprite.setData('serverX', player.position.x)
            playerSprite.setData('serverY', player.position.y)
        })

        player.onChange(() => {
            //console.log('player.onchange', player.toJSON())
            // this.matter.body.setStatic(mb, true)
            this.world.setStatic(playerSprite.body as unknown as Body, player)
            // this.matter.body.setStatic(mb, false)

            if (player.angle !== undefined) {
                //console.log('angle', player.angle)
                this.matter.body.setAngle(mb, player.angle, true)
            }
            if (player.angularVelocity !== undefined) {
                //console.log('angularVelocity', player.angularVelocity)
                if (player.angularVelocity !== 0) {
                    // this.matter.body.setStatic(mb, false)
                    this.world.setStatic(playerSprite.body as unknown as Body, player)
                    // this.matter.body.setStatic(mb, false)

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
                //show the turn number somewhere
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
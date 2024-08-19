/**
 * ---------------------------
 * Phaser + Colyseus - Part 4.
 * ---------------------------
 * - Connecting with the room
 * - Sending inputs at the user's framerate
 * - Update other player's positions WITH interpolation (for other players)
 * - Client-predicted input for local (current) player
 * - Fixed tickrate on both client and server
 */

import Phaser from "phaser"
import { Room, Client } from "colyseus.js"
import { BACKEND_URL } from "../backend"
import { WorldSchema } from "@/WorldSchema"
import { Player } from "@/Player"
import { Message } from "@/Message"
import { getVelocity } from "@/functions"
import World from "@/World"
import { Body } from "matter-js"
import { respondToVisibility } from "../client"
import ChatBubble from "../ChatBubble"

//const room_name = "marble_game"
export class MarbleGameScene extends Phaser.Scene {
    room: Room<WorldSchema>

    currentPlayer: Phaser.Physics.Matter.Image
    playerEntities: { [sessionId: string]: Phaser.Physics.Matter.Image } = {}

    keys: object
    world: World = new World()
    roomName: string
    scaleSprite: Phaser.GameObjects.TileSprite
    textInput: Phaser.GameObjects.DOMElement
    debug: Phaser.GameObjects.Text
    g: Phaser.GameObjects.Group
    map: Phaser.Tilemaps.Tilemap;
    chatMode: boolean = false

    constructor() {
        console.log('scene constructor')
        super({
            key: 'MarbleGameScene',
            physics: {
                default: "matter"
            }
        })
    }

    preload() {
        console.log('preload')
        this.load.image('background')
        this.load.image('scale')
        this.load.html("input", "input.html")
        Player.preload(this)
    }

    init(data: { roomName: string }): void {
        console.log('init', data)
        this.roomName = data.roomName

    }



    update(time: number, delta: number): void {
        //console.log('update')
        //skip loop if not connected yet.

        // console.log('scrollX', this.cameras.main.scrollX)
        // console.log('width', this.cameras.main.width)

        //this.room.connection.isOpen
        if (!this.currentPlayer) { return }

        //this.matter.composite.get(this.matter.world,this.currentPlayer,'body')
        const [mb] = this.matter.getMatterBodies([this.currentPlayer]) as unknown as Body[]
        //const mb=this.matter.composite.get(this.matter.world.localWorld as unknown as CompositeType, this.currentPlayer., 'body')
        const p: Player = this.room.state.players.get(this.room.sessionId)
        //console.log(mb.position)
        //console.log(mb.angle)

        if (Phaser.Input.Keyboard.JustDown(this.keys["ENTER"])) {
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

        if (!this.chatMode) {
            if (Phaser.Input.Keyboard.JustDown(this.keys["W"])) {
                this.world.moveForward(mb, p)
                this.room.send(0, 'keydown-W')
            }
            if (Phaser.Input.Keyboard.JustUp(this.keys["W"])) {
                this.world.stopMoving(mb, p)
                this.room.send(0, 'keyup-W')
            }
            if (Phaser.Input.Keyboard.JustDown(this.keys["S"])) {
                this.world.moveBackward(mb, p)
                this.room.send(0, 'keydown-S')
            }
            if (Phaser.Input.Keyboard.JustUp(this.keys["S"])) {
                this.world.stopMoving(mb, p)
                this.room.send(0, 'keyup-S')
            }
            if (Phaser.Input.Keyboard.JustDown(this.keys["D"])) {
                this.world.turnRight(mb, p)
                this.room.send(0, 'keydown-D')
            }
            if (Phaser.Input.Keyboard.JustUp(this.keys["D"])) {
                this.world.stopTurning(mb, p)
                this.room.send(0, 'keyup-D')
            }
            if (Phaser.Input.Keyboard.JustDown(this.keys["A"])) {
                this.world.turnLeft(mb, p)
                this.room.send(0, 'keydown-A')
            }
            if (Phaser.Input.Keyboard.JustUp(this.keys["A"])) {
                this.world.stopTurning(mb, p)
                this.room.send(0, 'keyup-A')
            }
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

    async create() {
        console.log('create')

        const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
            color: "#000000",
            fontSize: "24px",
            fontFamily: "Arial",
            backgroundColor: "white"
        }

        const mapData = [];

        // for (let y = 0; y < this.mapHeight; y++)
        // {
        //     const row = [];

        //     for (let x = 0; x < this.mapWidth; x++)
        //     {
        //         //  Scatter the tiles so we get more mud and less stones
        //         const tileIndex = Phaser.Math.RND.weightedPick(this.tiles);

        //         row.push(tileIndex);
        //     }

        //     mapData.push(row);
        // }

        // this.map = this.make.tilemap({ data: mapData, tileWidth: 512, tileHeight: 512 });

        // const tileset = this.map.addTilesetImage('background');
        // const layer = this.map.createLayer(0, tileset, 0, 0);


        // try {
        //     const userdata = await Client.auth.signInWithProvider('discord');
        //     console.log(userdata);

        // } catch (e) {
        //     console.error(e.message);
        // }

        this.add.tileSprite(0, 0, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(512, 0, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(1024, 0, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(0, 512, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(512, 512, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(1024, 512, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(0, 1024, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(512, 1024, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(1024, 1024, 512, 512, 'background')//.setOrigin(0)
        this.scaleSprite = this.add.tileSprite(0, 0, 108, 10, 'scale').setOrigin(0).setScrollFactor(0)
        // this.textInput = this.add.text(0, 0, 'blah blah blah', textStyle)//.setScrollFactor(0)
        this.textInput = this.add.dom(100, 100).createFromCache("input")

        respondToVisibility(document.getElementById('text'), (visible) => {
            // console.log('visible', visible)
            document.getElementById('text').focus()
        })

        // this.g.add()
        this.debug = this.add.text(0, 0, 'DEBUG', { color: 'black' }).setScale(1).setScrollFactor(0)
        this.debug.y = this.cameras.main.height - this.debug.height

        //this.cameras.main.zoom = 2.3

        this.cameras.main.setRotation(0)

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

        this.keys = this.input.keyboard.addKeys('W,S,A,D,ENTER', false)

        //this.debugFPS = this.add.text(4, 4, "", { color: "#ff0000", })
        //this.debugFPS.setScrollFactor(0)


        //connect with the room
        await this.connect()


        this.room.state.onChange(() => {
            //TODO show the turn number somewhere
            this.debug
            console.log(this.room.state.turnNumber)
        })

        this.room.state.players.onAdd((player, sessionId: string) => {
            //console.log(this.room.state.players.toJSON())
            this.onAdd(sessionId, player)
        })

        //remove local reference when entity is removed from the server
        this.room.state.players.onRemove((player, sessionId) => {
            this.onRemove(sessionId)
        })
        this.cameras.main.setZoom(1)
        //this.cameras.main.useBounds = false
        //this.cameras.main.setBounds(0, 0, 800, 600)
    }

    private onRemove(sessionId: string) {
        const entity = this.playerEntities[sessionId]
        if (entity) {
            entity.destroy()
            delete this.playerEntities[sessionId]
        }
    }

    private onAdd(sessionId: string, player: Player) {
        console.log(sessionId, 'joined marblegame')

        let playerSprite: Phaser.Physics.Matter.Sprite
        {
            const playerCollider = this.matter.bodies.circle(player.position.x, player.position.y, 16, { isSensor: false, label: 'playerCollider' })
            const playerSensor = this.matter.bodies.circle(player.position.x, player.position.y, 20, { isSensor: true, label: 'playerCollider' })
            const compoundBody = this.matter.body.create({ parts: [playerCollider, playerSensor] })

            playerSprite = new Phaser.Physics.Matter.Sprite(this.matter.world, player.position.x, player.position.y, 'ship_0001', null, { shape: 'circle' })
            playerSprite.setExistingBody(compoundBody, true)
            this.add.existing(playerSprite)
        }
        {
            // const playerCollider = Matter.Bodies.circle(player.position.x, player.position.y, 16, { isSensor: false, label: 'playerCollider' })
            // const playerSensor = Matter.Bodies.circle(player.position.x, player.position.y, 20, { isSensor: true, label: 'playerCollider' })
            // const compoundBody = Matter.Body.create({ parts: [playerCollider, playerSensor] })
            // playerSprite = new Phaser.Physics.Matter.Sprite(this.matter.world, player.position.x, player.position.y, 'ship_0001', null, { shape: 'circle' })
            // playerSprite.setExistingBody(compoundBody)
            // this.add.existing(playerSprite)

        }
        // playerSprite.setFixedRotation()
        // playerSprite.setFriction(1)
        playerSprite.setFrictionAir(0)
        // playerSprite.setFrictionStatic(10)
        // playerSprite.setInteractive()
        //console.log((entity.body as unknown as Body).id)
        //entity.setOrigin()
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
        //add connection status text
        const connectionStatusText = this.add
            .text(0, 0, "Trying to connect with the server...")
            .setStyle({ color: "#ff0000" })
            .setPadding(4)

        const client = new Client(BACKEND_URL)

        try {
            //console.log(this.roomName)
            this.room = await client.joinOrCreate(this.roomName, {})

            //connection successful!
            connectionStatusText.destroy()

        } catch (e) {
            //couldn't connect
            console.log(e)
            connectionStatusText.text = "Could not connect with the server."
        }
    }
}
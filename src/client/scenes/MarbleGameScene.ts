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
import { Room, Client, RoomAvailable } from "colyseus.js"
import { BACKEND_URL } from "../backend"
import { RoomState } from "@/RoomState"
import { Player } from "@/Player"
import { getVelocity } from "@/functions"
import World from "@/World"
import { Body } from "matter-js"

// const room_name = "marble_game"
export class MarbleGameScene extends Phaser.Scene {
    room: Room<RoomState>

    currentPlayer: Phaser.Physics.Matter.Image
    playerEntities: { [sessionId: string]: Phaser.Physics.Matter.Image } = {}

    debugFPS: Phaser.GameObjects.Text

    // localRef: Phaser.GameObjects.Arc
    // remoteRef: Phaser.GameObjects.Arc

    //cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys

    elapsedTime = 0
    fixedTimeStep = 1000 / 60

    keys: object
    world: World = new World()
    roomName: string
 

    constructor() {
        super({
            key: 'marbleGame',
            physics: {
                default: "matter"
            }
        })
    }

    init(data: { roomName: string }): void {
        // console.log('init', data)
        this.roomName=data.roomName
    }

    update(time: number, delta: number): void {
        //console.log('update')
        //skip loop if not connected yet.

        // this.room.connection.isOpen
        if (!this.currentPlayer) { return }

        // this.matter.composite.get(this.matter.world,this.currentPlayer,'body')
        const [mb] = this.matter.getMatterBodies([this.currentPlayer]) as unknown as Body[]
        // const mb=this.matter.composite.get(this.matter.world.localWorld as unknown as CompositeType, this.currentPlayer., 'body')
        const p: Player = this.room.state.players.get(this.room.sessionId)
        // console.log(mb.position)
        // console.log(mb.angle)


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

        // this.localRef.x = this.currentPlayer.x
        // this.localRef.y = this.currentPlayer.y

        for (let sessionId in this.playerEntities) {
            //interpolate all player entities
            //(except the current player)
            if (sessionId === this.room.sessionId) {
                // continue
            }

            const entity = this.playerEntities[sessionId]
            const [mb] = this.matter.getMatterBodies([this.currentPlayer])

            //TODO what about going backwards?
            this.matter.body.setVelocity(mb, getVelocity(mb.angle, mb.speed))

            //lerp
            const { serverX, serverY } = entity.data.values

            // entity.x = Phaser.Math.Linear(entity.x, serverX, 0.2)
            // entity.y = Phaser.Math.Linear(entity.y, serverY, 0.2)
            // this.matter.body.setPosition(mb, {
            //     x: Phaser.Math.Linear(entity.x, serverX, 0.2),
            //     y: Phaser.Math.Linear(entity.y, serverY, 0.2)
            // }, false)
        }

        this.debugFPS.scale = 1 / this.cameras.main.zoom
        this.debugFPS.text = `Frame rate: ${this.game.loop.actualFps}`
    }

    preload() {
        // console.log('preload')
        this.load.image('background')
        this.load.image('ship_0001')
        this.load.image('scale')
    }

    scaleSprite

    async create() {
        // console.log('create')
        this.add.tileSprite(0, 0, 512, 512, 'background')//.setOrigin(0)
        this.add.tileSprite(512, 0, 512, 512, 'background')//.setOrigin(0)
        this.scaleSprite = this.add.tileSprite(0, 0, 108, 10, 'scale').setOrigin(0).setScrollFactor(0)

        this.cameras.main.zoom = 2.3

        this.cameras.main.setRotation(0)

        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (deltaY > 0) {
                // console.log('zoom out')
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
            // this.scaleSprite.setScrollFactor( this.cameras.main.zoom)
            // this.get.tileSprite(0, 0, 108, 10, 'scale').setOrigin(0).setScrollFactor(0)
        })

        this.keys = this.input.keyboard.addKeys('W,S,A,D')

        this.debugFPS = this.add.text(4, 4, "", { color: "#ff0000", })
        this.debugFPS.setScrollFactor(0)


        //connect with the room
        await this.connect()

        this.room.state.players.onAdd((player, sessionId: string) => {
            //  console.log(this.room.state.players.toJSON())
            // console.log(sessionId, 'joined marblegame')
            const entity = this.matter.add.image(player.position.x, player.position.y, 'ship_0001', null, { shape: 'circle' }).setBody({ type: 'image', addToWorld: true })
            entity.setFriction(1)
            entity.setFrictionAir(0)
            entity.setFrictionStatic(0)
            entity.setInteractive()
            // console.log((entity.body as unknown as Body).id)
            //entity.setOrigin()

            entity.on('pointerdown', () => {
                console.log('click', player.id)
            })

            const [mb] = this.matter.getMatterBodies([entity])
            // console.log(mb.id)
            this.matter.body.setAngle(mb, player.angle, true)
            this.matter.body.setAngularVelocity(mb, player.angularVelocity)
            // this.matter.body.setVelocity(mb, getVelocity(entity.rotation, player.speed))
            this.matter.body.setInertia(mb, Infinity)
            mb.restitution = 0
            // this.matter.body.setStatic(mb,true)

            this.playerEntities[sessionId] = entity

            //is current player
            if (sessionId === this.room.sessionId) {
                this.currentPlayer = entity
                this.cameras.main.startFollow(entity, true, .7, .7)
            }

            this.cameras.main.setZoom(1)
            this.cameras.main.useBounds = false

            player.velocity.onChange(() => {
                if (player.velocity !== undefined) {
                    if (player.velocity.x !== 0 || player.velocity.y !== 0) {
                        this.matter.body.setStatic(mb, false)
                    }
                    this.matter.body.setVelocity(mb, player.velocity)
                }
            })

            player.position.onChange(() => {
                if (player.position.x !== undefined && player.position.y != undefined) {
                    // console.log('xxxxx')
                    // console.log('speed', player.speed)
                    this.matter.body.setPosition(mb, { x: player.position.x, y: player.position.y }, false)
                }

                entity.setData('serverX', player.position.x)
                entity.setData('serverY', player.position.y)
            })

            player.onChange(() => {
                // console.log('player.onchange', player.toJSON())
                this.matter.body.setStatic(mb, true)

                if (player.angle !== undefined) {
                    // console.log('angle', player.angle)
                    this.matter.body.setAngle(mb, player.angle, true)
                }
                if (player.angularVelocity !== undefined) {
                    // console.log('angularVelocity', player.angularVelocity)
                    if (player.angularVelocity !== 0) {
                        this.matter.body.setStatic(mb, false)
                    }
                    this.matter.body.setAngularVelocity(mb, player.angularVelocity)
                }
            })
        })

        //remove local reference when entity is removed from the server
        this.room.state.players.onRemove((player, sessionId) => {
            const entity = this.playerEntities[sessionId]
            if (entity) {
                entity.destroy()
                delete this.playerEntities[sessionId]
            }
        })

        this.cameras.main.setBounds(0, 0, 800, 600)
    }

    async connect() {
        //add connection status text
        const connectionStatusText = this.add
            .text(0, 0, "Trying to connect with the server...")
            .setStyle({ color: "#ff0000" })
            .setPadding(4)

        const client = new Client(BACKEND_URL)

        // const lobby = await client.joinOrCreate("lobby");

        // let allRooms: RoomAvailable[] = [];

        // lobby.onMessage("rooms", (rooms) => {
        //     allRooms = rooms;
        // });

        // lobby.onMessage("+", ([roomId, room]) => {
        //     const roomIndex = allRooms.findIndex((room) => room.roomId === roomId);
        //     if (roomIndex !== -1) {
        //         allRooms[roomIndex] = room;

        //     } else {
        //         allRooms.push(room);
        //     }
        // });

        // lobby.onMessage("-", (roomId) => {
        //     allRooms = allRooms.filter((room) => room.roomId !== roomId);
        // });


        try {
            // console.log(this.roomName)
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
import { Schema, type, ArraySchema } from "@colyseus/schema"
import { Scene, Physics } from "phaser"
import { Bodies, Body, Composite } from "matter-js"
import { Message } from "@/Message"
import { Vector } from "@/Vector"
import { KEY_ACTION } from "@/Keys"
import { SPEED, SPEED_MODE, TURN_SPEED } from "./CONSTANTS"
import { getVelocity } from "./functions"

export class Character extends Schema {

  @type("string") id: string
  @type("string") playerId: string
  @type("string") name: string
  @type(Vector) position: Vector = new Vector()
  @type(Vector) velocity: Vector = new Vector()
  @type("number") angle: number = 0
  @type("number") angularVelocity: number = 0
  @type("number") speed: number = 0//this indicates forward/backward
  @type("number") movement: number = 30
  @type("number") speedMode: SPEED_MODE = SPEED_MODE.WALK
  @type([Message]) messages = new ArraySchema<Message>()

  //things the client is authoratative on
  forward: boolean = false
  backward: boolean = false
  right: boolean = false
  left: boolean = false
  //input from the client for the server to process
  inputQueue: KEY_ACTION[] = []
  //matterjs body, both client and server manage their own instance of this
  body: Body

  sprite: Physics.Matter.Sprite

  constructor({ character }: { character: Character })
  constructor({ x, y }: { x: number, y: number })
  constructor({ x, y, character }: { x: number, y: number, character: Character }) {
    super()
    // ({ x: this.position.x, y: this.position.y } = data)
    this.position.x = x
    this.position.y = y
    if (!!character) {
      // console.log(character)

      this.id = character.id
      this.playerId = character.playerId
      this.name = character.name
      this.position.x = character.position.x
      this.position.y = character.position.y
      this.velocity.x = character.velocity.x
      this.velocity.y = character.velocity.y
      this.angle = character.angle
      this.angularVelocity = character.angularVelocity
      this.speed = character.speed
      this.movement = character.movement
      this.speedMode = character.speedMode
      this.messages.push(...Array.from(character.messages))
    }
    // console.log(this.velocity)
  }

  static preload(scene: Scene) {
    // scene.load.image('ship_0001')
    scene.load.atlas('marble', 'marble/texture.png', 'marble/texture.json')
  }

  static create(scene: Scene) {
    scene.anims.create({ key: 'marble-roll', frameRate: 10, frames: scene.anims.generateFrameNames('marble', { start: 1, end: 12, prefix: '' }), repeat: -1 })
  }

  static createMatterBody(character: Character, world: Composite) {
    const frictionOptions = {
      friction: 0,
      frictionAir: .0,
      frictionStatic: .0,
      isStatic: true
    }

    const playerCollider = Bodies.circle(character.position.x, character.position.y, 30, { isSensor: false, label: 'playerCollider' })
    const playerSensor = Bodies.circle(character.position.x, character.position.y, 32, { isSensor: true, label: 'playerCollider' })
    const compoundBody = Body.create({ ...{ parts: [playerCollider, playerSensor] }, ...frictionOptions })

    character.body = compoundBody
    Composite.add(world, [compoundBody])
  }

  static move(character: Character) {
    let input: KEY_ACTION | undefined
    while (input = character.inputQueue?.shift()) {
      // console.log(player.id, input)

      switch (input) {
        case KEY_ACTION.JUSTDOWN_SHIFT:
          character.speedMode = SPEED_MODE.RUN
          break
        case KEY_ACTION.JUSTUP_SHIFT:
          character.speedMode = SPEED_MODE.WALK
          break
        case KEY_ACTION.JUSTDOWN_FORWARD:
          character.speed = SPEED
          character.forward = true
          break
        case KEY_ACTION.JUSTUP_FORWARD:
          character.forward = false
          if (character.backward) {
            character.speed = -SPEED
          }
          else {
            character.speed = 0
          }
          break
        case KEY_ACTION.JUSTDOWN_BACKWARD:
          character.speed = -SPEED
          character.backward = true
          break
        case KEY_ACTION.JUSTUP_BACKWARD:
          character.backward = false
          if (character.forward) {
            character.speed = SPEED
          }
          else {
            character.speed = 0
          }
          break
        case KEY_ACTION.JUSTDOWN_RIGHT:
          character.right = true
          character.angularVelocity = TURN_SPEED
          break
        case KEY_ACTION.JUSTUP_RIGHT:
          character.right = false
          if (character.left) {
            character.angularVelocity = -TURN_SPEED
          }
          else {
            character.angularVelocity = 0
          }
          break
        case KEY_ACTION.JUSTDOWN_LEFT:
          character.left = true
          character.angularVelocity = -TURN_SPEED
          break
        case KEY_ACTION.JUSTUP_LEFT:
          character.left = false
          if (character.right) {
            character.angularVelocity = TURN_SPEED
          }
          else {
            character.angularVelocity = 0
          }
          break
      }
    }

    // console.log(JSON.stringify(character.body))
    Body.setAngularVelocity(character.body, character.angularVelocity)

    const velocity = getVelocity(character.body.angle, character.speed * character.speedMode)

    //console.log(velocity)
    if (Number.isNaN(velocity.x)) {
      console.log(JSON.stringify(velocity))
    }

    Body.setVelocity(character.body, velocity)
    if (character.body.speed <= .01 && character.body.angularSpeed <= .01) {
      Body.setStatic(character.body, true)
    }
    else {
      Body.setStatic(character.body, false)
    }
  }
}
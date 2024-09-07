import { Schema, type, ArraySchema } from "@colyseus/schema"
import { Scene } from "phaser"
import { Body, World } from "matter-js"
import { Message } from "@/Message"
import { Vector } from "@/Vector"
import { KEY_ACTION } from "@/Keys"
import { SPEED, SPEED_MODE, TURN_SPEED } from "./CONSTANTS"
import { getVelocity } from "./functions"

export class Character extends Schema {

  @type("string") id: string
  @type("string") playerId: string
  @type('string') name: string
  @type(Vector) position: Vector = new Vector()
  @type(Vector) velocity: Vector = new Vector()
  @type("number") angle: number = 0
  @type("number") angularVelocity: number = 0
  @type("number") speed: number = 0
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

  constructor(data: { x: number; y: number; scene?: World }) {
    super();
    ({ x: this.position.x, y: this.position.y } = data)
  }

  static preload(scene: Scene) {
    scene.load.image('ship_0001')
    scene.load.atlas('marble', 'marble/texture.png', 'marble/texture.json')
  }

  static create(scene: Scene) {
    scene.anims.create({ key: 'marble-roll', frameRate: 10, frames: scene.anims.generateFrameNames('marble', { start: 0, end: 11, prefix: '', suffix: '.png' }), repeat: -1 })
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
    Body.setVelocity(character.body, velocity)
    if (character.body.speed <= .01 && character.body.angularSpeed <= .01) {
      Body.setStatic(character.body, true)
    }
    else {
      Body.setStatic(character.body, false)
    }
  }
}
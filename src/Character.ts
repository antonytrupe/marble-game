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

  static move(player: Character) {
    let input: KEY_ACTION | undefined
    while (input = player.inputQueue?.shift()) {
      // console.log(player.id, input)

      switch (input) {
        case KEY_ACTION.JUSTDOWN_SHIFT:
          player.speedMode = SPEED_MODE.RUN
          break
        case KEY_ACTION.JUSTUP_SHIFT:
          player.speedMode = SPEED_MODE.WALK
          break
        case KEY_ACTION.JUSTDOWN_FORWARD:
          player.speed = SPEED
          player.forward = true
          break
        case KEY_ACTION.JUSTUP_FORWARD:
          player.forward = false
          if (player.backward) {
            player.speed = -SPEED
          }
          else {
            player.speed = 0
          }
          break
        case KEY_ACTION.JUSTDOWN_BACKWARD:
          player.speed = -SPEED
          player.backward = true
          break
        case KEY_ACTION.JUSTUP_BACKWARD:
          player.backward = false
          if (player.forward) {
            player.speed = SPEED
          }
          else {
            player.speed = 0
          }
          break
        case KEY_ACTION.JUSTDOWN_RIGHT:
          player.right = true
          player.angularVelocity = TURN_SPEED
          break
        case KEY_ACTION.JUSTUP_RIGHT:
          player.right = false
          if (player.left) {
            player.angularVelocity = -TURN_SPEED
          }
          else {
            player.angularVelocity = 0
          }
          break
        case KEY_ACTION.JUSTDOWN_LEFT:
          player.left = true
          player.angularVelocity = -TURN_SPEED
          break
        case KEY_ACTION.JUSTUP_LEFT:
          player.left = false
          if (player.right) {
            player.angularVelocity = TURN_SPEED
          }
          else {
            player.angularVelocity = 0
          }
          break
      }
    }

    Body.setAngularVelocity(player.body, player.angularVelocity)
    const velocity = getVelocity(player.body.angle, player.speed * player.speedMode)
    Body.setVelocity(player.body, velocity)
    if (player.body.speed <= .01 && player.body.angularSpeed <= .01) {
      Body.setStatic(player.body, true)
    }
    else {
      Body.setStatic(player.body, false)
    }
  }
}
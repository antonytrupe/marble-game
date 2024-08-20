import { Schema, type, ArraySchema } from "@colyseus/schema"
import { InputData } from "./InputData"
import { Scene } from "phaser"
import { Body, World } from "matter-js"
import { Message } from "./Message"
import { Vector } from "./Vector"

export class Player extends Schema {
  inputQueue: InputData[] = []
  body: Body
  @type("number") id: number

  @type(Vector) position: Vector = new Vector()
  @type(Vector) velocity: Vector = new Vector()
  // @type("number") speed: number
  @type("number") angle: number = 0
  @type("number") angularVelocity: number = 0
  @type('string') name: string

  @type([Message]) messages = new ArraySchema<Message>()
  @type("number")speed: number=0

  constructor(data: { x: number; y: number; scene?: World }) {
    super();
    ({ x: this.position.x, y: this.position.y } = data)
  }

  static preload(scene: Scene) {
    scene.load.image('ship_0001')
  }
}
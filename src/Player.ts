import { Schema, type } from "@colyseus/schema"
import { InputData } from "./InputData"
import { Scene } from "phaser"
import { Bodies, Body, World } from "matter-js"
import { BodyType } from "matter"

export class Vector extends Schema {
  @type("number") x: number
  @type("number") y: number
}

export class Player extends Schema {
  inputQueue: InputData[] = []
  body: Body
  @type("number") id: number

  @type(Vector) position: Vector = new Vector()
  @type(Vector) velocity: Vector = new Vector()
  // @type("number") speed: number
  @type("number") angle: number
  @type("number") angularVelocity: number
  @type('string') name: string


  constructor(data: { x: number; y: number; scene?: World }) {
    super();
    ({ x: this.position.x, y:this.position.y} = data)
    
  }

  static preload(scene: Scene) {
    scene.load.image('ship_0001')
  }
}
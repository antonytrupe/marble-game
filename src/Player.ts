import { Schema, type } from "@colyseus/schema"
import { InputData } from "./InputData"

class Vector extends Schema {
  @type("number") x: number
  @type("number") y: number
}

export class Player extends Schema {
  inputQueue: InputData[] = []
  @type("number") id: number

  @type(Vector) position: Vector = new Vector()
  @type(Vector) velocity: Vector = new Vector()
  // @type("number") speed: number
  @type("number") angle: number
  @type("number") angularVelocity: number
}
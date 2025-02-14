import { Schema, type } from "@colyseus/schema";

export class Message extends Schema {

  @type("number") time: number
  @type("string") text: string

  constructor(message: string) {
    super()
    this.text = message
    this.time = new Date().getTime()
  }
}
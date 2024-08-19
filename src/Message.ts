import { Schema, type } from "@colyseus/schema";


export class Message extends Schema {
  @type("number") time: number;
  @type("string") message: string;

  constructor(message) {
    super();
    this.message = message;
    this.time = new Date().getTime();
  }
}

import { Schema, type } from "@colyseus/schema";


export class Vector extends Schema {
  @type("number") x: number;
  @type("number") y: number;
}

import { Schema, type, MapSchema } from "@colyseus/schema";
import { Player } from "@/Player";

export class WorldSchema extends Schema {
  @type("number") mapWidth: number
  @type("number") mapHeight: number
  @type("number") creation: number
  @type("number") turnNumber: number
  
  @type({ map: Player }) players = new MapSchema<Player>()

}
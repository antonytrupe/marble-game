import { Schema, type, MapSchema } from "@colyseus/schema";
import { Player } from "@/Player";
import { Character } from "./Character";

export class WorldSchema extends Schema {
  @type("number") mapWidth: number
  @type("number") mapHeight: number
  @type("number") creation: number
  @type("number") turnNumber: number
  
  // @type({ map: Player }) playersById = new MapSchema<Player>()
  @type({ map: Player }) playersBySessionId = new MapSchema<Player>()
  @type({ map: Player }) playersByEmail = new MapSchema<Player>()
  @type({ map: Character }) characters = new MapSchema<Character>()

}
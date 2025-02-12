import { Schema, type, MapSchema, filter, filterChildren } from "@colyseus/schema";
import { Player } from "@/Player";
import { Character } from "./Character";
import WorldObject from "./WorldObject";
import { Client } from "colyseus";

export class TacticalSchema extends Schema {

  @type("number") mapWidth: number
  @type("number") mapHeight: number
  @type("number") creation: number = new Date().getTime()

  @type("number") turnNumber: number

  @filterChildren(function (
    this: TacticalSchema, // the instance of this class (instance of `State`)
    client: Client, // the Room's `client` instance which this data is going to be filtered to
    sessionId: string, // the key of the current value inside the structure
    player: Player, // the value of the field to be filtered.
    root: Schema // the root state Schema instance
  ) {
    // always returns a boolean
    //
    return sessionId == client.sessionId;
  })
  @type({ map: Player }) playersBySessionId = new MapSchema<Player>()

  @filter(() => false)
  @type({ map: Player }) playersByEmail = new MapSchema<Player>()

  @type({ map: Character }) characters = new MapSchema<Character>()
  @type({ map: WorldObject }) objects = new MapSchema<WorldObject>()

  static getCharacter(state: TacticalSchema, characterId: string): Character | undefined {
    const character = state?.characters.get(characterId)
    return character
  }
}
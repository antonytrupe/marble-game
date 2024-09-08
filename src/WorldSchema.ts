import { Schema, type, MapSchema, filterChildren } from "@colyseus/schema";
import { Player } from "@/Player";
import { Character } from "./Character";
import { Client } from "colyseus";
import WorldObject from "./WorldObject";

export class WorldSchema extends Schema {
  @type("number") mapWidth: number
  @type("number") mapHeight: number
  @type("number") creation: number
  @type("number") turnNumber: number

  // @type({ map: Player }) playersById = new MapSchema<Player>()

  // @filterChildren(function (
  //   this: WorldSchema, // the instance of this class (instance of `State`)
  //   client: Client, // the Room's `client` instance which this data is going to be filtered to
  //   sessionId: string, // the key of the current value inside the structure
  //   player: Player, // the value of the field to be filtered.
  //   root: Schema // the root state Schema instance
  // ) {
  //   // always returns a boolean
  //   return client.sessionId == player.sessionId;
  // })
  @type({ map: Player }) playersBySessionId = new MapSchema<Player>()

  // @filterChildren(function (
  //   this: WorldSchema, // the instance of this class (instance of `State`)
  //   client: Client, // the Room's `client` instance which this data is going to be filtered to
  //   email: string, // the key of the current value inside the structure
  //   player: Player, // the value of the field to be filtered.
  //   root: Schema // the root state Schema instance
  // ) {
  //   // always returns a boolean
  //   //
  //   return false;
  // })
  @type({ map: Player }) playersByEmail = new MapSchema<Player>()
  @type({ map: Character }) characters = new MapSchema<Character>()
  @type({ map: WorldObject }) objects = new MapSchema<WorldObject>()

  static getCharacter(state: WorldSchema, characterId: string): Character | undefined {
    const character = state?.characters.get(characterId)
    return character
  }

}
import { Schema, type, MapSchema, filter } from "@colyseus/schema";
import { Player } from "@/Player";
import { Character } from "./Character";
import WorldObject from "./WorldObject";
import { Client } from "colyseus.js";

export class TestSchema extends Schema {

  @type("number") mapWidth: number
  @type("number") mapHeight: number
  @type("number") creation: number = new Date().getTime()

  @type("number") turnNumber: number

  @filter(() => false)
  @type({ map: Player }) playersBySessionId = new MapSchema<Player>()

  @filter(() => false)
  @type({ map: Player }) playersByEmail = new MapSchema<Player>()
  
  @type({ map: Character }) characters = new MapSchema<Character>()
  @type({ map: WorldObject }) objects = new MapSchema<WorldObject>()
}
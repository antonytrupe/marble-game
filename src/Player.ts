import { Schema, type } from "@colyseus/schema"
import { Character } from "./Character"

export class Player extends Schema {

  @type('string') email: string
  @type('string') id: string
  @type('string') characterId: string
  @type('string') sessionId?: string
  // currentCharacter: Character

  constructor() {
    super()
  }
}
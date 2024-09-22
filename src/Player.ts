import { Schema, type } from "@colyseus/schema"

export class Player extends Schema {

  @type('string') email: string
  @type('string') id: string
  @type('string') characterId: string
  @type('string') sessionId?: string
  
  constructor()
  constructor(player: Player)
  constructor(player?: Player) {
    super()
    if (!!player) {
      this.email = player.email
      this.id = player.id
      this.characterId = player.characterId
      this.sessionId = player.sessionId
    }
  }
}
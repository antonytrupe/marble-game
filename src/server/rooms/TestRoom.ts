import { Room, Client, updateLobby } from "colyseus"
import { JWT } from "@colyseus/auth"
import { v4 as uuid } from 'uuid'
import { TestSchema } from "@/TestSchema"
import { Composite, Engine } from "matter-js"
import { Player } from "@/Player"
import { Character } from "@/Character"

export class TestRoom extends Room<TestSchema> {
  engine: Engine

  async onCreate(options: any) {
    this.autoDispose = false
    this.engine = Engine.create({ gravity: { x: 0, y: 0 } })
    this.setState(new TestSchema())
    this.setSimulationInterval((deltaTime) => this.update(deltaTime))

  }

  update(deltaTime: number) {
    const now = new Date().getTime()
    //turn logic
    const newTurnNumber = Math.floor((now - this.state.creation) / (6 * 1000))
    if (this.state.turnNumber != newTurnNumber) {
      this.state.turnNumber = newTurnNumber
      console.log(this.state.turnNumber)
      console.log('matter body count', Composite.allBodies(this.engine.world).length)

    }

    // Engine.update(this.engine, deltaTime / 1)

  }

  static async onAuth(token: string, request: any) {
    console.log('onAuth', token)
    if (!token) {
      return true
    }
    // client.auth.token = token
    // console.log(await JWT.verify(token))
    const email = await JWT.verify(token)
    // const newLocal = email || true
    // return await JWT.verify(token) || true
    // console.log('email', email)
    return email
  }

  onJoin(client: Client, options: any, email?: string | boolean) {
    console.log('onJoin', client.sessionId, email)
    let player
    if (typeof email == 'string') {
      player = this.state.playersByEmail.get(email)
      if (!player) {
        player = this.createAuthenticatedPlayer(email)
        this.state.playersByEmail.set(email, player)
      }
    }
    else {
      player = this.createGuestPlayer(player)
    }
    player.sessionId = client.sessionId
    this.state.playersBySessionId.set(client.sessionId, player)
    if (!player.characterId) {
      const character = this.createCharacter(player.id, this.engine.world)
      player.characterId = character.id
      this.state.characters.set(character.id, character)
    }

    // this.allowReconnection(client, 60)

    if (typeof email != 'string' && email) {
      console.log('anonymous user')
      return
    }
  }

  createCharacter(playerId: string, world: Composite) {
    const character = new Character()
    character.id = uuid()
    character.playerId = playerId
    Character.createMatterBody(character, world)
    character.onRemove(() => {
      Character.removeMatterBody(character, world)
    })
    return character
  }

  private createAuthenticatedPlayer(email: string) {
    const player = new Player()
    player.id = uuid()
    player.email = email
    return player
  }

  private createGuestPlayer(player: any) {
    player = new Player()
    player.id = uuid()
    return player
  }

  async onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!", consented)
    const player = this.state.playersBySessionId.get(client.sessionId)
    this.state.playersBySessionId.delete(client.sessionId)
    if (!player?.email && player?.characterId) {
      //guest player, remove character
      this.state.characters.delete(player?.characterId)
    }
  }

  onCacheRoom() {
    console.log('onCacheRoom')
    return { foo: "bar" }
  }

  onRestoreRoom() {
    console.log('onRestoreRoom')
  }

  onDispose() {
    return new Promise<void>((resolve, reject) => {
      console.log("room", this.roomId, this.roomName, "disposing...")
      resolve()
    })
  }
}
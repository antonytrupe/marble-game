import { Room, Client, updateLobby } from "colyseus"
import { JWT } from "@colyseus/auth"
import { v4 as uuid } from 'uuid'
import { Composite, Engine, Body } from "matter-js"
import { Player } from "@/Player"
import { Character } from "@/Character"
import { TacticalSchema } from "@/TacticalSchema"
import { KEY_ACTION } from "@/Keys"

export class TacticalRoom extends Room<TacticalSchema> {
  engine: Engine

  async onCreate(options: any) {
    this.autoDispose = false
    this.engine = Engine.create({ gravity: { x: 0, y: 0 } })
    this.setState(new TacticalSchema())
    this.setSimulationInterval((deltaTime) => this.update(deltaTime)) 

    this.onMessage(0, (client, input: KEY_ACTION) => {
      //handle player input
      console.log(input)
      const character = this.getCharacterBySessionId(client.sessionId)
      if (!!character) {
        //enqueue input to user input buffer.
        character?.inputQueue.push(input)
      }
      else {
        console.log('we got a message and could not find the character')
      }
    })
  }

  getCharacterBySessionId(sessionId: string) {
    const player = this.state.playersBySessionId.get(sessionId)
    let character: Character | undefined
    if (player?.characterId) {
      // console.log('found player')     
      character = TacticalSchema.getCharacter(this.state, player?.characterId)
    }
    return character
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

    //Engine.update(this.engine, deltaTime / 1)

    this.state.characters.forEach(character => {
      // console.log(character.body.id)
      const body = Composite.get(this.engine.world, character.body.id, 'body') as Body

      if (!body) {
        console.log('did not find body for character', character.id)
      }

      character.angle = body.angle

      //  guard against velocity being NaN
      if (!Number.isNaN(body.velocity.x)) {
        character.velocity.x = body.velocity.x
      }
      else {
        console.log(JSON.stringify(body.velocity))
      }
      if (!Number.isNaN(body.velocity.x)) {
        character.velocity.y = body.velocity.y
      }
      character.position.x = body.position.x
      character.position.y = body.position.y

      //dequeue player inputs
      // this.move(character)
      Character.move(character)

    })
    // if (deltaTime >= 16.667)
    //   console.log(deltaTime)

    Engine.update(this.engine, deltaTime / 1)

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
    return {
      turnNumber: this.state.turnNumber,
      creation: this.state.creation
    }
  }

  onRestoreRoom(cachedData: any) {
    console.log('onRestoreRoom')
    const c = this.onCacheRoom()
    console.log(c)
    // this.state.turnNumber = c.turnNumber
    // this.state.creation = c.creation 
  }

  onDispose() {
    return new Promise<void>((resolve, reject) => {
      console.log("room", this.roomId, this.roomName, "disposing...")
      resolve()
    })
  }
}
import { Bodies, Body, Composite, Engine } from "matter-js"
import { Room, Client, updateLobby } from "colyseus"
import { v4 as uuidv4 } from 'uuid'
import { WorldSchema } from "@/WorldSchema"
import { Player } from "@/Player"
import { Message } from "@/Message"
import { KEY_ACTION } from "@/Keys"
import { Character } from "@/Character"
import { JWT } from "@colyseus/auth"

export class MarbleGameRoom extends Room<WorldSchema> {
  engine: Engine
  // world: World = new World()

  onCreate(options: any) {
    this.autoDispose = false

    // console.log('MarbleGameRoom onCreate')
    // console.log(options)
    this.setState(new WorldSchema())
    this.state.creation = new Date().getTime()

    this.setMetadata({
      description: "Marble Game " + this.roomName.substring(10),
      sceneName: 'MarbleGameScene'
    })
      .then(() => {
        updateLobby(this)
      })

    this.engine = Engine.create({ gravity: { x: 0, y: 0 } })

    //set map dimensions
    this.state.mapWidth = 800
    this.state.mapHeight = 600

    this.onMessage('auth', async (client,f) => {
      console.log('auth change')
      const email = client.auth
      console.log(f,email)
      console.log(client.userData)

      // console.log(email)
      if (!!email) {
        const player = this.state.playersByEmail.get(email)
        if (!!player) {
          //delete old sessionid reference
          if (!!player.sessionId) {
            this.state.playersBySessionId.delete(player.sessionId)
          }
          player.sessionId = client.sessionId
          this.state.playersBySessionId.set(player.sessionId, player)
        }
      }
    })

    this.onMessage(0, (client, input: KEY_ACTION) => {
      //handle player input

      const character = this.getCharacterBySessionId(client.sessionId)
      if (!!character) {
        //enqueue input to user input buffer.
        character?.inputQueue.push(input)
      }
      else {
        console.log('we got a message and could not find the character')
      }
    })

    this.onMessage('chat', (client: Client, input) => {
      this.chat(client, input)

      //enqueue input to user input buffer.
      //player.inputQueue.push(input)
    })

    //let elapsedTime = 0
    this.setSimulationInterval((deltaTime) => this.update(deltaTime))
  }

  getCharacterBySessionId(sessionId: string) {
    const player = this.state.playersBySessionId.get(sessionId)
    let character: Character | undefined
    if (player?.characterId) {
      // console.log('found player')
      character = WorldSchema.getCharacter(this.state, player?.characterId)
    }
    return character
  }

  private chat(client: Client, input: string) {
    console.log(client.sessionId, input)
    //handle player input
    const player = this.getPlayerBySession(client.sessionId)
    if (player?.characterId) {
      const character = WorldSchema.getCharacter(this.state, player?.characterId)
      character?.messages.push(new Message(input))
    }
  }
  getPlayerBySession(sessionId: string) {
    return this.state.playersBySessionId.get(sessionId)
  }

  update(deltaTime: number) {
    const now = new Date().getTime()
    //turn logic
    const newTurnNumber = Math.floor((now - this.state.creation) / (6 * 1000))
    if (this.state.turnNumber != newTurnNumber) {
      this.state.turnNumber = newTurnNumber
    }

    Engine.update(this.engine, deltaTime / 1)

    this.state.characters.forEach(character => {
      const body = Composite.get(this.engine.world, character.body.id, 'body') as Body
      //TODO maybe don't do this here
      character.angle = body.angle
      character.velocity.x = body.velocity.x
      character.velocity.y = body.velocity.y
      character.position.x = body.position.x
      character.position.y = body.position.y

      //dequeue player inputs
      this.move(character)

    })
    // if (deltaTime >= 16.667)
    //   console.log(deltaTime)

    // Engine.update(this.engine, deltaTime / 2)
  }

  private move(character: Character) {
    Character.move(character)
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
    

    if (typeof email != 'string' && email) {
      console.log('anonymous user')
      return
    }

    if (typeof email == 'string') {

      // console.log('client.auth', client.auth)
      let player = this.getPlayer(email)
      // console.log(player)
      if (!player) {
        // console.log('made a new player', email)
        player = new Player()
        player.email = email
        player.id = uuidv4()
      }
      
      if (player.sessionId != client.sessionId) {
        if (player.sessionId) {
          this.state.playersBySessionId.delete(player.sessionId)
        }
        player.sessionId = client.sessionId
        this.state.playersBySessionId.set(client.sessionId, player)
      }

      this.state.playersByEmail.set(email, player)

      //character stuff
      let character = WorldSchema.getCharacter(this.state, player.characterId)
      if (!character) {
        // console.log('making a new character')
        const x = Math.random() * this.state.mapWidth
        const y = Math.random() * this.state.mapHeight
        character = new Character({ x, y })
        character.id = uuidv4()
        character.playerId = player.id
        player.characterId = character.id

        character.angle = 0
        character.angularVelocity = 0
        this.state.characters.set(character.id, character)

        const circle = Bodies.circle(character.position.x, character.position.y, 30,
          {
            friction: 0,
            frictionAir: .0,
            frictionStatic: .0
          })

        Body.setStatic(circle, true)

        character.body = circle
        Composite.add(this.engine.world, [circle])
      }
      // console.log('characters.size', this.state.characters.size)
    }
  }

  private getPlayer(email: string) {
    return this.state.playersByEmail.get(email)
  }

  async onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!", consented)

    const player = this.state.playersBySessionId.get(client.sessionId)
    // // Composite.remove(this.engine.world,this.state.players.get(client.sessionId).body)
    // // this.state.players.delete(client.sessionId)
    // // flag client as inactive for other users
    if (player) {
      player.sessionId = undefined;
    }


    this.state.playersBySessionId.delete(client.sessionId);


    // allow disconnected client to reconnect into this room until 20 seconds
    // await this.allowReconnection(client, 60);
    // console.log('reconnected')
    // client returned! let's re-activate it.
    // if (player) {
    //   player.sessionId = client.sessionId;
    // }


  }

  onDispose() {
    console.log("room", this.roomId, this.roomName, "disposing...")
  }
}
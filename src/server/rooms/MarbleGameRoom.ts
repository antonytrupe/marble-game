import MatterJS, { Bodies, Body, Composite, Engine } from "matter-js"
import { Room, Client, updateLobby } from "colyseus"
import { JWT } from "@colyseus/auth"
import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid'
import { WorldSchema } from "@/WorldSchema"
import { Player } from "@/Player"
import { Message } from "@/Message"
import { KEY_ACTION } from "@/Keys"
import { Character } from "@/Character"
import WorldObject from "@/WorldObject"
import { Vector } from "@/Vector"

export class MarbleGameRoom extends Room<WorldSchema> {
  engine: Engine
  // world: World = new World() 

  persistanceClient: ReturnType<typeof createClient>

  async onCreate(options: any) {
    this.autoDispose = false

    this.persistanceClient = await createClient({ password: process.env.REDIS_PASSWORD })
      .on('error', err => console.log('Redis Client Error', err))
      .connect()

    console.log('connected to redict')

    this.load()

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

    this.onMessage('auth', async (client, f) => {
      // console.log('auth change')
      const email = client.auth
      // console.log(f, email)
      // console.log(client.userData)

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
      const player = this.getPlayerBySession(client.sessionId)
      if (player) {
        const character = WorldSchema.getCharacter(this.state, player.characterId)
        if (character) {
          if (input[0] == '/') {
            this.command(player, character, input)
          }
          else {
            this.chat(player, character, input)
          }
        }
        else {
          console.log('we got a message and could not find the character')
        }
      }
      else {
        console.log('we got a message and could not find the player')
      }
    })

    //let elapsedTime = 0
    this.setSimulationInterval((deltaTime) => this.update(deltaTime))
  }

  command(player: Player, character: Character, input: string) {
    const parts = input.trim().substring(1).split(' ')
    console.log(parts)

    if (['spawn', 'spwn', 'spn', 'spa'].includes(parts[0])) {
      if (['tree'].includes(parts[1])) {
        const distance = Math.random() * 80 + 200
        const angle = Math.random() * 2 * Math.PI
        const location = MatterJS.Vector.add(character.position, MatterJS.Vector.create(distance * Math.cos(angle), distance * Math.sin(angle)))
        console.log(character.position)
        // console.log(angle)
        console.log(distance)
        console.log(location)
        this.spawnTree(location)
      }
    }
  }

  spawnTree(location: MatterJS.Vector) {
    console.log('spawnTree')
    // console.log(JSON.stringify(location))

    const tree = new WorldObject({ id: uuidv4(), sprite: "tree", radiusX: 30, location: new Vector({ x: location.x, y: location.y }) })
    // console.log(JSON.stringify(tree.location))
    this.state.objects.set(tree.id, tree)

    const circle = Bodies.circle(tree.location.x, tree.location.y, 30,
      {
        friction: 0,
        frictionAir: .0,
        frictionStatic: .0
      })

    Body.setStatic(circle, true)

    tree.body = circle
    Composite.add(this.engine.world, [circle])

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

  private chat(player: Player, character: Character, input: string) {
    // console.log(client.sessionId, input)
    character.messages.push(new Message(input))
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
      console.log(this.state.turnNumber)
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

  // private move(character: Character) {
  //   Character.move(character)
  // }

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

    // this.allowReconnection(client, 60)

    if (typeof email != 'string' && email) {
      console.log('anonymous user')
      return
    }

    if (typeof email == 'string') {

      // console.log('client.auth', client.auth)
      let player = this.getPlayer(email)
      // console.log(player)
      if (!player) {
        console.log('made a new player', email)
        player = this.createPlayer(email)
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
        console.log('making a new character')
        character = this.createCharacter(player)
      }
      // console.log('characters.size', this.state.characters.size)
      this.persist(player, character)

    }
  }

  private async load() {
    const players = await this.persistanceClient.json.get('players') as { string: any }
    // console.log(players)
    Object.entries(players).forEach(([id, player]) => {
      // console.log(player)
      // console.log(id)
      const p = new Player(player)
      this.state.playersByEmail.set(p.email, p)

    })

    const characters = await this.persistanceClient.json.get('characters') as { string: any }
    // console.log(players)
    Object.entries(characters).forEach(([id, character]) => {
      //  console.log(JSON.stringify(character))
      // console.log(id)
      const c = new Character({ character })
      // console.log(JSON.stringify(c))
      Character.createMatterBody(c, this.engine.world)
      // console.log(c.body.id)
      this.state.characters.set(c.id, c)

    })

  }

  private async persist(player: Player, character?: Character) {
    console.log('saving', player.email)
    const emails = await this.persistanceClient.json.get('emails').catch((e) => {
      console.log(e)
    })
    // console.log(emails)
    if (!emails) {
      await this.persistanceClient.json.set('emails', '$', {})
    }
    await this.persistanceClient.json.set('emails', `["${player.email}"]`, player.id)
      .catch((e) => {
        console.log(e)
      })

    const players = await this.persistanceClient.json.get('players')
      .catch((e) => {
        console.log(e)
      })
    if (!players) {
      await this.persistanceClient.json.set('players', '$', {})
    }
    this.persistanceClient.json.set("players", `$.${player.id}`, player.toJSON())
      .catch((e) => {
        console.log(e)
      })

    if (!!character) {
      const newLocal = JSON.parse(JSON.stringify(character.toJSON()))
      // console.log(newLocal)

      const characters = await this.persistanceClient.json.get('characters').catch((e) => {
        console.log(e)
      })
      if (!characters) {
        await this.persistanceClient.json.set('characters', '$', {})
          .catch((e) => {
            console.log(e)
          })
      }
      this.persistanceClient.json.set('characters', `$.${character.id}`, newLocal)
        .catch((e) => {
          console.log(e)
        })
    }
  }

  private createCharacter(player: Player) {
    const x = Math.random() * this.state.mapWidth
    const y = Math.random() * this.state.mapHeight
    const character = new Character({ x, y })
    character.id = uuidv4()
    character.playerId = player.id
    player.characterId = character.id

    character.angle = 0
    character.angularVelocity = 0
    this.state.characters.set(character.id, character)

    Character.createMatterBody(character, this.engine.world);
    return character
  }



  private createPlayer(email: string) {
    const player = new Player()
    player.email = email
    player.id = uuidv4()
    return player
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
      player.sessionId = undefined
      const character = WorldSchema.getCharacter(this.state, player.characterId)
      this.persist(player, character)
    }

    this.state.playersBySessionId.delete(client.sessionId)

    // allow disconnected client to reconnect into this room until 20 seconds
    // await this.allowReconnection(client, 60)
    // console.log('reconnected')
    // client returned! let's re-activate it.
    // if (player) {
    //   player.sessionId = client.sessionId; 
    // } 


  }

  // onCacheRoom() {
  //   return {}
  // }

  // onRestoreRoom() {
  //   console.log('onRestoreRoom')
  // }

  // onDispose() {
  //   return new Promise<void>((resolve, reject) => {
  //     console.log("room", this.roomId, this.roomName, "disposing...")
  //     resolve()
  //   })
  // }
}
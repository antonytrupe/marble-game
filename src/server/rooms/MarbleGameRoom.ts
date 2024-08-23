import { Bodies, Body, Composite, Engine } from "matter-js"
import { Room, Client, updateLobby } from "colyseus"
import { WorldSchema } from "@/WorldSchema"
import { Player } from "@/Player"
import { Message } from "@/Message"
import { getVelocity } from "@/functions"
import World from "@/World"
import { KEY_ACTION } from "@/Keys"
import { SPEED, TURN_SPEED } from "@/SPEED"

export class MarbleGameRoom extends Room<WorldSchema> {
  engine: Engine
  world: World = new World()

  onCreate(options: any) {
    this.autoDispose = false

    // console.log('MarbleGameRoom onCreate')
    // console.log(options)
    this.setState(new WorldSchema())
    this.state.creation = new Date().getTime()
    // console.log(this.roomName, this.roomId)

    this.setMetadata({
      description: "Marble Game " + this.roomName.substring(10),
      sceneName: 'MarbleGameScene'
    })
      .then(() => {
        // console.log('updateLobby', this.roomName)
        updateLobby(this)
      })

    this.engine = Engine.create({ gravity: { x: 0, y: 0 } })

    //set map dimensions
    this.state.mapWidth = 800
    this.state.mapHeight = 600

    this.onMessage(0, (client, input) => {
      // console.log(client.sessionId,input)
      //handle player input
      const player = this.state.players.get(client.sessionId)

      //enqueue input to user input buffer.
      player?.inputQueue.push(input)
    })

    this.onMessage('chat', (client: Client, input) => {
      this.chat(client, input)

      //enqueue input to user input buffer.
      //player.inputQueue.push(input)
    })

    //let elapsedTime = 0
    this.setSimulationInterval((deltaTime) => this.update(deltaTime))
  }

  private chat(client: Client, input: string) {
    console.log(client.sessionId, input)
    //handle player input
    const player = this.state.players.get(client.sessionId)
    player?.messages.push(new Message(input))
  }

  update(deltaTime: number) {
    const now = new Date().getTime()
    // console.log(now - this.state.creation)
    //turn logic
    const newTurnNumber = Math.floor((now - this.state.creation) / (6 * 1000))
    if (this.state.turnNumber != newTurnNumber) {
      // console.log('newTurnNumber',newTurnNumber)
      this.state.turnNumber = newTurnNumber
    }

    Engine.update(this.engine, deltaTime / 1)
    this.state.players.forEach(player => {
      const body = Composite.get(this.engine.world, player.id, 'body') as Body
      //TODO maybe don't do this here
      player.angle = body.angle
      player.velocity.x = body.velocity.x
      player.velocity.y = body.velocity.y
      player.position.x = body.position.x
      player.position.y = body.position.y

      //dequeue player inputs
      this.move(player, body)

    })
    // if (deltaTime >= 16.667)
    //   console.log(deltaTime)

    // Engine.update(this.engine, deltaTime / 2)
  }

  private move(player: Player, body: Body) {
    let input: KEY_ACTION | undefined
    while (input = player.inputQueue.shift()) {
      console.log(player.id, input)

      switch (input) {
        case KEY_ACTION.JUSTDOWN_FORWARD:
          player.speed = SPEED
          player.forward = true
          break
        case KEY_ACTION.JUSTUP_FORWARD:
          player.forward = false
          if (player.backward) {
            player.speed = -SPEED
          }
          else {
            player.speed = 0
          }
          break
        case KEY_ACTION.JUSTDOWN_BACKWARD:
          player.speed = -SPEED
          player.backward = true
          break
        case KEY_ACTION.JUSTUP_BACKWARD:
          player.backward = false
          if (player.forward) {
            player.speed = SPEED
          }
          else {
            player.speed = 0
          }
          break
        case KEY_ACTION.JUSTDOWN_RIGHT:
          player.right = true
          player.angularVelocity = TURN_SPEED
          break
        case KEY_ACTION.JUSTUP_RIGHT:
          player.right = false
          if (player.left) {
            player.angularVelocity = -TURN_SPEED
          }
          else {
            player.angularVelocity = 0
          }
          break
        case KEY_ACTION.JUSTDOWN_LEFT:
          player.left = true
          player.angularVelocity = -TURN_SPEED
          break
        case KEY_ACTION.JUSTUP_LEFT:
          player.left = false
          if (player.right) {
            player.angularVelocity = TURN_SPEED
          }
          else {
            player.angularVelocity = 0
          }
          break
      }
    }

    Body.setAngularVelocity(body, player.angularVelocity)
    const velocity = getVelocity(body.angle, player.speed)
    Body.setVelocity(body, velocity)
    if (body.speed <= .01 && body.angularSpeed <= .01) {
      this.world.setStatic(body, player)
    }
    else {
      Body.setStatic(body, false)

    }
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined ", this.metadata.description)
    // const x = Math.random() * this.state.mapWidth / 2 + this.state.mapWidth / 4
    // const y = Math.random() * this.state.mapHeight / 2 + this.state.mapWidth / 4
    const x = Math.random() * this.state.mapWidth
    const y = Math.random() * this.state.mapHeight
    const player = new Player({ x, y })

    // player.velocity.x = 0
    // player.velocity.y = 0
    player.angle = 0
    player.angularVelocity = 0

    const circle = Bodies.circle(player.position.x, player.position.y, 30,
      {
        friction: 0,
        frictionAir: .0,
        frictionStatic: .0
      })

    // circle.restitution = 0
    this.world.setStatic(circle, player)

    player.id = circle.id
    player.body = circle
    Composite.add(this.engine.world, [circle])

    this.state.players.set(client.sessionId, player)
    //  console.log('player count', this.state.players.size)
    // console.log('body count', Composite.allBodies(this.engine.world).length)
    // console.log(player.toJSON())
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!")
    // Composite.remove(this.engine.world,this.state.players.get(client.sessionId).body)
    // this.state.players.delete(client.sessionId)
  }

  onDispose() {
    console.log("room", this.roomId, this.roomName, "disposing...")
  }
}
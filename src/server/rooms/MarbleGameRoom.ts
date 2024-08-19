import { Room, Client, updateLobby } from "colyseus"
import { WorldSchema } from "@/WorldSchema"
import { InputData } from "@/InputData"
import { Player } from "@/Player"
import { Message } from "@/Message"
import { getMagnitude, getVelocity } from "@/functions"
import { Bodies, Body, Composite, Engine } from "matter-js"
import World from "@/World"

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
      player.inputQueue.push(input)
    })

    this.onMessage('chat', (client, input) => {
      this.chat(client, input)

      //enqueue input to user input buffer.
      //player.inputQueue.push(input)
    })

    //let elapsedTime = 0
    this.setSimulationInterval((deltaTime) => this.update(deltaTime))
  }

  private chat(client, input: string) {
    console.log(client.sessionId, input)
    //handle player input
    const player = this.state.players.get(client.sessionId)
    player.messages.push(new Message(input))
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
      const entity = Composite.get(this.engine.world, player.id, 'body') as Body
      //normalize some stuff
      // Body.setAngle(entity, normalize(entity.angle))
      player.angle = entity.angle

      player.angularVelocity = entity.angularVelocity
      player.velocity.x = entity.velocity.x
      player.velocity.y = entity.velocity.y
      // entity.velocity.x = player.velocity.x
      // entity.velocity.y = player.velocity.y
      const m = getMagnitude(player.velocity)
      if (m > 0) {
        // console.log(m)
        // console.log(entity.velocity)

      }
      // if (entity.speed != 0) {
      //   const velocity_angle = getAngle(entity.velocity)
      //    // console.log('a', a)
      //   // console.log('b', b)
      //   if (Math.abs(velocity_angle - entity.angle) >= 3) {
      //     // console.log('going backwards')
      //     player.speed *= -1
      //   }
      // }
      //TODO what about going backwards?
      Body.setVelocity(entity, getVelocity(entity.angle, m))

      player.position.x = entity.position.x
      player.position.y = entity.position.y

      //dequeue player inputs
      let input: InputData
      while (input = player.inputQueue.shift()) {
        console.log(player.id, input)

        switch (input) {
          case "keydown-W":
            this.world.moveForward(entity, player)
            break
          case "keyup-W":
            this.world.stopMoving(entity, player)
            break
          case "keydown-S":
            this.world.moveBackward(entity, player)
            break
          case "keyup-S":
            this.world.stopMoving(entity, player)
            break
          case "keydown-D":
            this.world.turnRight(entity, player)
            break
          case "keyup-D":
            this.world.stopTurning(entity, player)
            break
          case "keydown-A":
            this.world.turnLeft(entity, player)
            break
          case "keyup-A":
            this.world.stopTurning(entity, player)
            break
        }
      }
      this.world.setStatic(entity, player)

    })
    // if (deltaTime >= 16.667)
    //   console.log(deltaTime)

    // Engine.update(this.engine, deltaTime / 2)
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

    const circle = Bodies.circle(player.position.x, player.position.y, 16,
      {
        // friction: 1,
        frictionAir: 0,
        // frictionStatic: 10
      })

    // circle.restitution = 0
    this.world.setStatic(circle, player)

    player.id = circle.id
    player.body = circle
    Composite.add(this.engine.world, [circle])

    this.state.players.set(client.sessionId, player)
    // console.log('player count', this.state.players.size)
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
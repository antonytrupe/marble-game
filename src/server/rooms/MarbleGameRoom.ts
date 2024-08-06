import { Room, Client } from "colyseus"
import { RoomState } from "@/RoomState"
import { InputData } from "@/InputData"
import { getAngle, getVelocity, normalize, Player } from "@/Player"
import { Bodies, Body, Composite, Engine } from "matter-js"


export class MarbleGameRoom extends Room<RoomState> {

  engine: Engine

  onCreate(options: any) {
    console.log('MarbleGameRoom onCreate')
    this.setState(new RoomState())

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

    //let elapsedTime = 0
    this.setSimulationInterval((deltaTime) => this.update(deltaTime))
  }

  update(deltaTime: number) {

    Engine.update(this.engine, deltaTime / 2)
    this.state.players.forEach(player => {
      const entity = Composite.get(this.engine.world, player.id, 'body') as Body
      //normalize some stuff
      Body.setAngle(entity, normalize(entity.angle))
      player.angle = entity.angle

      
      player.angularVelocity = entity.angularVelocity

      player.speed = entity.speed
      if (entity.speed != 0) {
        const a = getAngle(entity.velocity)
        const b = entity.angle
        // console.log('a', a)
        // console.log('b', b)
        if (Math.abs(a - b) >= 3) {
          // console.log('going backwards')
          player.speed *= -1
        }
      }
      Body.setVelocity(entity, getVelocity(entity.angle, player.speed))

      player.x = entity.position.x
      player.y = entity.position.y


      //dequeue player inputs
      let input: InputData
      while (input = player.inputQueue.shift()) {
        console.log(player.id, input)

        switch (input) {
          case "keydown-D": 13
            player.angularVelocity = 0.1
            Body.setAngularVelocity(entity, player.angularVelocity)
            break;
          case "keyup-D":
            player.angularVelocity = 0
            Body.setAngularVelocity(entity, player.angularVelocity)
            break;
          case "keydown-A":
            player.angularVelocity = -0.1
            Body.setAngularVelocity(entity, player.angularVelocity)
            break;
          case "keyup-A":
            player.angularVelocity = 0
            Body.setAngularVelocity(entity, player.angularVelocity)
            break;
          case "keydown-W":
            player.speed = 1
            Body.setVelocity(entity, getVelocity(entity.angle, player.speed))
            break;
          case "keyup-W":
            player.speed = 0
            Body.setVelocity(entity, { x: 0, y: 0 })
            break;
          case "keydown-S":
            player.speed = -1
            Body.setVelocity(entity, getVelocity(entity.angle, player.speed))
            break;
          case "keyup-S":
            player.speed = 0
            Body.setVelocity(entity, { x: 0, y: 0 })
            break;
        }
      }
    })
    // if (deltaTime >= 16.667)
    //   console.log(deltaTime)

    Engine.update(this.engine, deltaTime / 2)
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined marblegame!")

    const player = new Player()
    player.x = Math.random() * this.state.mapWidth / 2 + this.state.mapWidth / 4
    player.y = Math.random() * this.state.mapHeight / 2 + this.state.mapWidth / 4
    player.speed = 0
    player.angle = 0
    player.angularVelocity = 0

    const circle = Bodies.circle(player.x, player.y, 10, { friction: 1, frictionAir: 0, frictionStatic: 0, inertia: Infinity })

    player.id = circle.id

    Composite.add(this.engine.world, [circle])

    this.state.players.set(client.sessionId, player)
    // console.log(player.toJSON())
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!")
    this.state.players.delete(client.sessionId)
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...")
  }
}
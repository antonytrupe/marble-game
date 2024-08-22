import { Schema, type, ArraySchema } from "@colyseus/schema"
import { Scene } from "phaser"
import { Body, World } from "matter-js"
import { Message } from "@/Message"
import { Vector } from "@/Vector"
import { KEY_ACTION } from "@/Keys"

export class Player extends Schema {

  @type("number") id: number
  @type('string') name: string

  @type(Vector) position: Vector = new Vector()
  @type(Vector) velocity: Vector = new Vector()
  @type("number") angle: number = 0
  @type("number") angularVelocity: number = 0
  @type("number") speed: number = 0
  @type([Message]) messages = new ArraySchema<Message>()

  //things the client is authoratative on
  forward: boolean = false
  backward: boolean = false
  right: boolean = false
  left: boolean = false
  //input from the client for the server to process
  inputQueue: KEY_ACTION[] = []
  //matterjs body, both client and server manage their own instance of this
  body: Body

  constructor(data: { x: number; y: number; scene?: World }) {
    super();
    ({ x: this.position.x, y: this.position.y } = data)
  }

  static preload(scene: Scene) {
    scene.load.image('ship_0001')
    scene.load.atlas('marble', 'marble/texture.png', 'marble/texture.json')
    
  }

  static create(scene: Scene){
    
    scene.anims.create({ key: 'marble-roll', frameRate: 10, frames:scene.anims.generateFrameNames('marble', { start: 0, end: 11, prefix: '', suffix: '.png' }), repeat: -1 })
  }
}
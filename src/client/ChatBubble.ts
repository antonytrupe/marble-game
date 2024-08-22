import { Message } from "@/Message"
import { Player } from "@/Player"
import { GameObjects, Scene, Types } from "phaser"

export default class ChatBubble extends GameObjects.Text {
    player: Player
    startTime

    constructor(data: {
        scene: Scene,
        message: Message,

        style?: Types.GameObjects.Text.TextStyle,

        player: Player
    }) {
        // console.log('chatbubble constructor')
        const { scene, message: { time, text }, player, player: { position: { x, y } } } = data
        const style = { color: "black" }
        super(scene, x, y - 32, text, style)
        this.player = player
        this.startTime = time
    }

    preUpdate() {
        const now = new Date().getTime()
        if (now - this.startTime >= 1000 * 6) {
            // console.log('destroy')
            this.destroy(true)
        }
        this.setY(this.player.position.y - (now - this.startTime) / 60 - this.height - 10)
        this.setX(this.player.position.x - this.width / 2)
    }
}
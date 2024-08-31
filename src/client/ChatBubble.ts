import { GameObjects, Scene, Types } from "phaser"
import { Message } from "@/Message"
import { Character } from "@/Character"

export default class ChatBubble extends GameObjects.Text {
    character: Character
    startTime

    constructor(data: {
        scene: Scene,
        message: Message,

        style?: Types.GameObjects.Text.TextStyle,

        character: Character
    }) {
        // console.log('chatbubble constructor')
        const { scene, message: { time, text }, character, character: { position: { x, y } } } = data
        const style = { color: "black" }
        super(scene, x, y - 32, text, style)
        this.character = character
        this.startTime = time
    }

    preUpdate() {
        const now = new Date().getTime()
        if (now - this.startTime >= 1000 * 6) {
            // console.log('destroy')
            this.destroy(true)
        }
        this.setY(this.character.position.y - (now - this.startTime) / 60 - this.height - 10)
        this.setX(this.character.position.x - this.width / 2)
    }
}
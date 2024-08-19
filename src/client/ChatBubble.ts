import { Player } from "@/Player"

export default class ChatBubble extends Phaser.GameObjects.Text {
    player: Player
    startTime

    constructor(data: {
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string | string[],
        style?: Phaser.Types.GameObjects.Text.TextStyle,
        time: number,
        player: Player
    }) {
        console.log('chatbubble constructor')
        const { scene, x, y, text, style, player, time } = data
        super(scene, x, y - 32, text, style)
        this.player = player
        this.startTime = time
    }

    preUpdate() {
        // console.log('preUpdate')
        const now = new Date().getTime()

        if (now - this.startTime >= 1000 * 6) {
            // console.log('destroy')
            this.destroy(true)
        }
        this.setY(this.player.position.y - (now - this.startTime) / 60 - 32)
        this.setX(this.player.position.x)
    }


}
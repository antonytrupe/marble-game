import { Body, } from "matter-js";
import { getVelocity } from "./functions";
import { Player, } from "./Player";
import { Vector } from "./Vector";

export default class World {

    moveForward(body: Body, player: Player) {
        Body.setStatic(body, false)
        const v = getVelocity(body.angle, 1)
        player.velocity.assign(v)
        Body.setVelocity(body, v)
    }

    moveBackward(b: Body, player: Player) {
        Body.setStatic(b, false)
        const v = getVelocity(b.angle, -1)
        player.velocity.assign(v)
        Body.setVelocity(b, getVelocity(b.angle, -1))
    }

    setVelocity(body: Body, player: Player, velocity: Vector) {
        throw "not implemented"
    }

    stopMoving(b: Body, p: Player) {
        p.velocity.x = 0
        p.velocity.y = 0
        Body.setVelocity(b, p.velocity)
    }

    turnRight(b: Body, player: Player) {
        Body.setStatic(b, false)
        player.angularVelocity = 0.1
        Body.setAngularVelocity(b, player.angularVelocity)
    }

    turnLeft(b: Body, player: Player) {
        Body.setStatic(b, false)
        player.angularVelocity = -0.1
        Body.setAngularVelocity(b, player.angularVelocity)
    }

    stopTurning(entity: Body, player: Player) {
        player.angularVelocity = 0
        Body.setAngularVelocity(entity, player.angularVelocity)
    }

    setStatic(entity: Body, player: Player) {
        if (player.angularVelocity != 0 || player.velocity.x !== 0 || player.velocity.y !== 0) {
            Body.setStatic(entity, false)
        }
        else {
             Body.setStatic(entity, true)
        }
    }
}
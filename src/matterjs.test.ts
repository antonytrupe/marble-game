import { Bodies, Body } from "matter-js"

describe("matterjs", () => {
    test("initial values should be 0", () => {
        const circle = Bodies.circle(0, 0, 10)
        expect(circle.angle).toBe(0)
        expect(circle.speed).toBe(0)
        expect(circle.velocity.x).toBe(0)
        expect(circle.velocity.y).toBe(0)
    })

    test("with an initial speed", () => {
        const circle = Bodies.circle(0, 0, 10)
        Body.setVelocity(circle,{x:1,y:0})
        expect(circle.angle).toBe(0)
        expect(circle.speed).toBe(1)
        expect(circle.velocity.x).toBe(1)
        expect(circle.velocity.y).toBe(0)
    })
})
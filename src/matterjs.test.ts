import { Bodies, Body, Composite, Engine } from "matter-js"

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
        Body.setVelocity(circle, { x: 1, y: 0 })
        expect(circle.angle).toBe(0)
        expect(circle.speed).toBe(1)
        expect(circle.velocity.x).toBe(1)
        expect(circle.velocity.y).toBe(0)
    })

    test("two objects colliding should still have velocity", () => {

        const engine = Engine.create({ gravity: { x: 0, y: 0 } })

        const circle1 = Bodies.circle(21, 0, 10)
        Body.setStatic(circle1, true)

        const circle2 = Bodies.circle(0, 0, 10)
        Body.setVelocity(circle2, { x: 1, y: 0 })

        Composite.add(engine.world, [circle1, circle2])


        const update = new Promise<void>((resolve) => {
            for (let i = 0; i < 1000; i++)
            {
                Engine.update(engine, 1)
                console.log('loop',i)

            }
            resolve()
        })

        console.log('tests')

        //static circle should not have moved
        expect(circle1.angle).toBe(0)
        expect(circle1.speed).toBe(0)
        expect(circle1.velocity.x).toBe(0)
        expect(circle1.velocity.y).toBe(0)
        expect(circle1.position.x).toBe(21)
        expect(circle1.position.y).toBe(0)

        //moving circle should have moved
        expect(circle2.position.x).toBeCloseTo(2,1)
        expect(circle2.position.y).toBe(0)
        expect(circle2.angle).toBe(0)
        // expect(circle1.speed).toBe(1)
        expect(circle2.velocity.x).toBeCloseTo(0)
        expect(circle2.velocity.y).toBe(0)


    })


})
import { getAngle, getVelocity, normalize } from "./functions"

//-y is up
//+y is down
//angle 0 is up
//right is 1/2PI
//down is PI
//left is 3/2PI

describe("functions", () => {

    describe("normalize", () => {

        test("0", () => {
            expect(normalize(0)).toBe(0)
        })

        test("1", () => {
            expect(normalize(Math.PI)).toBe(Math.PI)
        })

        test("2", () => {
            expect(normalize(2 * Math.PI)).toBe(0)
        })

        test("-2", () => {
            expect(normalize(-2 * Math.PI)).toBe(0)
        })
        test("-4", () => {
            expect(normalize(-4 * Math.PI)).toBe(0)
        })
        test("3", () => {
            expect(normalize(3 * Math.PI)).toBe(Math.PI)
        })
        test("-3", () => {
            expect(normalize(-3 * Math.PI)).toBe(Math.PI)
        })
    })
    describe("getAngle", () => {

        test(" up", () => {
            expect(getAngle({ x: 0, y: -1 })).toBe(0)
        })

        test("right up", () => {
            expect(getAngle({ x: 1, y: -1 })).toBe(Math.PI * 1 / 4)
        })

        test("right", () => {
            expect(getAngle({ x: 1, y: 0 })).toBe(Math.PI * 2 / 4)
        })
        test("down right", () => {
            expect(getAngle({ x: 1, y: 1 })).toBe(Math.PI * 3 / 4)
        })

        test("down", () => {
            expect(getAngle({ x: 0, y: 1 })).toBe(Math.PI * 4 / 4)
        })
        test("down left", () => {
            expect(getAngle({ x: -1, y: 1 })).toBe(Math.PI * 5 / 4)
        })

        test("left", () => {
            expect(getAngle({ x: -1, y: 0 })).toBe(Math.PI * 6 / 4)
        })

        test("up left", () => {
            expect(getAngle({ x: -1, y: -1 })).toBe(Math.PI * 7 / 4)
        })
    })

    describe("getVelocity", () => {
        test("up", () => {
            expect(getVelocity(0, 1)).toStrictEqual({ x: 0, y: -1 })
        })

        test("right up", () => {
            expect(getVelocity(Math.PI / 4, 1).x).toBeCloseTo(0.7071067811865475)
            expect(getVelocity(Math.PI / 4, 1).y).toBeCloseTo(- 0.7071067811865475)
        })

        test("right", () => {
            expect(getVelocity(Math.PI / 2, 1).x).toBeCloseTo(1)
            expect(getVelocity(Math.PI / 2, 1).y).toBeCloseTo(0)
        })

        test("right down", () => {
            expect(getVelocity(Math.PI * 3 / 4, 1).x).toBeCloseTo(0.707)
            expect(getVelocity(Math.PI * 3 / 4, 1).y).toBeCloseTo(0.707)
        })

        test("down", () => {
            expect(getVelocity(Math.PI * 4 / 4, 1).x).toBeCloseTo(0)
            expect(getVelocity(Math.PI * 4 / 4, 1).y).toBeCloseTo(1)
        })

        test("down left", () => {
            expect(getVelocity(Math.PI * 5 / 4, 1).x).toBeCloseTo(-.707)
            expect(getVelocity(Math.PI * 5 / 4, 1).y).toBeCloseTo(.707)
        })

        test("left", () => {
            expect(getVelocity(Math.PI * 6 / 4, 1).x).toBeCloseTo(-1)
            expect(getVelocity(Math.PI * 6 / 4, 1).y).toBeCloseTo(0)
        })

        test("up left", () => {
            expect(getVelocity(Math.PI * 7 / 4, 1).x).toBeCloseTo(-.707)
            expect(getVelocity(Math.PI * 7 / 4, 1).y).toBeCloseTo(-.707)
        })

    })

})
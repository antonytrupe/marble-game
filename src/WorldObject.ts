import { ZONETYPE } from "@/ZONETYPE"
import { Schema, type } from "@colyseus/schema"
import { Vector } from "@/Vector"

export default class WorldObject extends Schema implements WorldObjectInterface {
    @type("string") id: string = '__test__'
    name: string = '__test__'
    @type(Vector) location: Vector = new Vector()
    rotation: number = 0
    @type("string") sprite: string
    // shape: SHAPE = SHAPE.CIRCLE
    @type("number") radiusX: number = 1
    radiusY: number = 1
    width: number = 1
    height: number = 1
    // points: Point[] = []
    subObjects: WorldObject[] = []
    zoneType: ZONETYPE[] = [ZONETYPE.TACTICAL]
    physics: boolean
    body: any

    constructor({ id = '__test__',
        name = "__test__",
        location = new Vector(),
        rotation = 0,
        sprite = 'marble',
        // shape = SHAPE.CIRCLE,
        radiusX = 1,
        radiusY = 1,
        height = 1,
        width = 1,
        // points = [],
        subObjects = [],
        zoneType = [ZONETYPE.TACTICAL],
        physics = true }: WorldObjectInterface) {
        super()
        this.id = id
        this.name = name
        this.location.x = location.x
        this.location.y = location.y
        this.rotation = rotation
        this.sprite = sprite
        // this.shape = shape
        this.radiusX = radiusX
        this.radiusY = radiusY
        this.height = height
        this.width = width
        // this.points = points
        this.subObjects = subObjects
        this.zoneType = zoneType
        this.physics = physics
    }
}

interface WorldObjectInterface {
    id?: string
    name?: string
    location?: Vector
    rotation?: number
    sprite: string
    // shape?: SHAPE
    radiusX?: number
    radiusY?: number
    height?: number
    width?: number
    // points?: Point[]
    subObjects?: WorldObject[]
    zoneType?: ZONETYPE[]
    physics?: boolean
}
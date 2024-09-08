import { ZONETYPE } from "@/ZONETYPE"
import { Schema } from "@colyseus/schema"
import { Vector } from "@/Vector"

export default class WorldObject extends Schema implements WorldObjectInterface {
    id: string = '__test__'
    name: string = '__test__'
    location: Vector = new Vector()
    rotation: number = 0
    // shape: SHAPE = SHAPE.CIRCLE
    radiusX: number = 1
    radiusY: number = 1
    width: number = 1
    height: number = 1
    // points: Point[] = []
    subObjects: WorldObject[] = []
    zoneType: ZONETYPE[] = [ZONETYPE.TACTICAL]
    physics: boolean

    constructor({ id = '__test__',
        name = "__test__",
        location = new Vector(),
        rotation = 0,
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
        this.location = location
        this.rotation = rotation
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
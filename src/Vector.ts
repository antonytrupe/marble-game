import { Schema, type } from "@colyseus/schema";
 
export class Vector extends Schema {
  @type("number") x: number = 0
  @type("number") y: number = 0

  constructor()
  constructor({ x, y }: { x: number, y: number })

  // constructor({ location }: { location: MatterJS.Vector })

  constructor({ x = 0, y = 0 }: { x?: number, y?: number,  } = {}) {
    super()
    if (!!x) { this.x = x }
    if (!!y) { this.y = y }
    // if (!!location) {
    //   // console.log(location)
    //   this.x = location.x
    //   this.y = location.y
    // }
    // console.log(JSON.stringify(this))
  }
}
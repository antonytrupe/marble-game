import { Schema, type, MapSchema } from "@colyseus/schema";
import { Player } from "./Player";


export class RoomState extends Schema {
  @type("number") mapWidth: number;
  @type("number") mapHeight: number;

  @type({ map: Player }) players = new MapSchema<Player>();
}

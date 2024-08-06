import { Schema, type } from "@colyseus/schema";
import { InputData } from "./InputData"

class Vector extends Schema
{
  @type("number") x: number;
  @type("number") y: number;
}

export class Player extends Schema {
  inputQueue: InputData[] = [];
  @type("number") id: number;
  //@type("number") tick: number;

  @type("number") x: number;
  @type("number") y: number;
  @type("number") speed: number;
  @type("number") angle: number;
  @type("number") angularVelocity: number;
}

export const getVelocity = (angle: number, speed: number) => {
  return { x: speed * Math.sin(angle), y: -speed * Math.cos(angle) }
}

export const getAngle = ({ x, y }) => {
  return normalize(Math.atan2(y, x))
}

export const getMagnitude = ({ x, y }) => {
  return Math.sqrt(x * x + y * y)
}

export const normalize = (angle: number) => {
  return (angle + Math.PI * 2) % (Math.PI * 2)
}

//-y is up
//+y is down
//angle 0 is up
//right is 1/2PI
//down is PI
//left is 3/2PI
export const getVelocity = (angle: number, speed: number) => {
  return { x: speed * Math.sin(angle), y: -speed * Math.cos(angle) }
}

export const getAngle = ({ x, y }) => {
  return normalize(Math.atan2(y, x) - Math.PI * 3 / 2)
}

export const getMagnitude = ({ x, y }) => {
  return Math.sqrt(x * x + y * y)
}

export const normalize = (angle: number) => {
  return (angle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)
}
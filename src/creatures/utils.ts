export function toRad(degrees: number) {
  return degrees * Math.PI / 180;
}

export function getAngle(x: number, y: number) {
  return Math.atan2(y, x);
}

export function random(min?: number, max?: number) {
  const rand = Math.random();
  if (typeof min === 'undefined') {
    return rand;
  }
  else if (typeof max === 'undefined') {
    return rand * min;
  }
  else {
    if (min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }
    return rand * (max - min) + min;
  }
}

const cosTable = new Array(360);
const sinTable = new Array(360);

for (let i = 0; i < 360; i++) {
  cosTable[i] = Math.cos((i / 360) * 2 * Math.PI);
  sinTable[i] = Math.sin((i / 360) * 2 * Math.PI);
}

export function fastSin (xDeg: number) {
  const deg = Math.round(xDeg);
  if (deg >= 0) {
    return sinTable[(deg % 360)];
  }
  return -sinTable[((-deg) % 360)];
};

export function fastCos (xDeg: number) {
  const deg = Math.round(Math.abs(xDeg));
  return cosTable[deg % 360];
};

export function isPointInsideEllipse(point: DOMPoint, center: DOMPoint, semiMajorAxis: number, semiMinorAxis: number) {
  const normalizedPoint = new DOMPoint(point.x - center.x, point.y - center.y);
  const normalizedDistanceX = normalizedPoint.x / semiMajorAxis;
  const normalizedDistanceY = normalizedPoint.y / semiMinorAxis;

  return (normalizedDistanceX * normalizedDistanceX) + (normalizedDistanceY * normalizedDistanceY) <= 1;
}
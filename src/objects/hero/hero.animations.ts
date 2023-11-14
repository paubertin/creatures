export interface IAnimation {
  duration?: number;
  frames: { time: number; frame: number }[];
}

function makeWalkingFrames (rootFrame: number = 0): IAnimation {
  return {
    duration: 400,
    frames: [
      {
        time: 0,
        frame: rootFrame + 1,
      },
      {
        time: 100,
        frame: rootFrame,
      },
      {
        time: 200,
        frame: rootFrame + 1,
      },
      {
        time: 300,
        frame: rootFrame + 2,
      },
    ],
  };
};

export function makeStandingFrames (rootFrame: number = 0): IAnimation {
  return {
    duration: 400,
    frames: [
      {
        time: 0,
        frame: rootFrame,
      },
    ],
  };
};

export const WALK_DOWN = makeWalkingFrames(0);
export const WALK_RIGHT = makeWalkingFrames(3);
export const WALK_UP = makeWalkingFrames(6);
export const WALK_LEFT = makeWalkingFrames(9);

export const STANDING_DOWN = makeStandingFrames(1);
export const STANDING_RIGHT = makeStandingFrames(4);
export const STANDING_UP = makeStandingFrames(7);
export const STANDING_LEFT = makeStandingFrames(10);

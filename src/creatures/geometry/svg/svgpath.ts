// SVG Path transformations library
//
// Usage:
//
//    SvgPath('...')
//      .toString()
//
import pathParse from './pathparse';
import a2c from './a2c';


// Class constructor
//

export default class SvgPath {

  public segments: any[][];
  public err: string;

  public constructor(path: string) {
    const pstate = pathParse(path);

    // Array of path segments.
    // Each segment is array [command, param1, param2, ...]
    this.segments = pstate.segments;

    // Error message on parse error.
    this.err = pstate.err;
  }

  public static from (src: string | SvgPath) {
    if (typeof src === 'string'){
      return new SvgPath(src);
    }
    else {
      // Create empty object
      const s = new SvgPath('');
  
      // Clone properies
      s.err = src.err;
      s.segments = src.segments.map(function (sgm) { return sgm.slice(); });
  
      return s;
    }
  }

  public toString () {
    let result = '';
    let prevCmd = '';
    let cmdSkipped = false;
  
    for (let i = 0, len = this.segments.length; i < len; i++) {
      const segment = this.segments[i];
      let cmd = segment[0];
  
      // Command not repeating => store
      if (cmd !== prevCmd || cmd === 'm' || cmd === 'M') {
        // workaround for FontForge SVG importing bug, keep space between "z m".
        if (cmd === 'm' && prevCmd === 'z') result += ' ';
        result += cmd;
  
        cmdSkipped = false;
      } else {
        cmdSkipped = true;
      }
  
      // Store segment params
      for (let pos = 1; pos < segment.length; pos++) {
        let val = segment[pos];
        // Space can be skipped
        // 1. After command (always)
        // 2. For negative value (with '-' at start)
        if (pos === 1) {
          if (cmdSkipped && val >= 0) result += ' ';
        } else if (val >= 0) result += ' ';
  
        result += val;
      }
  
      prevCmd = cmd;
    }
  
    return result;
  }

  public iterate (iterator: (s: any[], index: number, lastX: number, lastY: number) => any) {
    const segments = this.segments;
    let replacements: any = {};
    let needReplace = false;
    let lastX = 0;
    let lastY = 0;
    let countourStartX = 0;
    let countourStartY = 0;
    let i: number;
    let j: number;
    let newSegments: any[];
  
    segments.forEach((s, index) => {
  
      const res = iterator(s, index, lastX, lastY);
  
      if (Array.isArray(res)) {
        replacements[index] = res;
        needReplace = true;
      }
  
      const isRelative = (s[0] === s[0].toLowerCase());
  
      // calculate absolute X and Y
      switch (s[0]) {
        case 'm':
        case 'M':
          lastX = s[1] + (isRelative ? lastX : 0);
          lastY = s[2] + (isRelative ? lastY : 0);
          countourStartX = lastX;
          countourStartY = lastY;
          return;
  
        case 'h':
        case 'H':
          lastX = s[1] + (isRelative ? lastX : 0);
          return;
  
        case 'v':
        case 'V':
          lastY = s[1] + (isRelative ? lastY : 0);
          return;
  
        case 'z':
        case 'Z':
          // That make sence for multiple contours
          lastX = countourStartX;
          lastY = countourStartY;
          return;
  
        default:
          lastX = s[s.length - 2] + (isRelative ? lastX : 0);
          lastY = s[s.length - 1] + (isRelative ? lastY : 0);
      }
    });
  
    // Replace segments if iterator return results
  
    if (!needReplace) { return this; }
  
    newSegments = [];
  
    for (i = 0; i < segments.length; i++) {
      if (typeof replacements[i] !== 'undefined') {
        for (j = 0; j < replacements[i].length; j++) {
          newSegments.push(replacements[i][j]);
        }
      } else {
        newSegments.push(segments[i]);
      }
    }
  
    this.segments = newSegments;
  
    return this;
  }

  public abs () {
    this.iterate((s, index, x, y) =>  {
      const name = s[0];
      const nameUC = name.toUpperCase();
      let i: number;
  
      // Skip absolute commands
      if (name === nameUC) { return; }
  
      s[0] = nameUC;
  
      switch (name) {
        case 'v':
          // v has shifted coords parity
          s[1] += y;
          return;
  
        case 'a':
          // ARC is: ['A', rx, ry, x-axis-rotation, large-arc-flag, sweep-flag, x, y]
          // touch x, y only
          s[6] += x;
          s[7] += y;
          return;
  
        default:
          for (i = 1; i < s.length; i++) {
            s[i] += i % 2 ? x : y; // odd values are X, even - Y
          }
      }
    }
    //, true
  );
  
    return this;
  }

  public unarc () {
    this.iterate((s, index, x, y) => {
      let new_segments: number[][];
      let nextX: number;
      let nextY: number;
      let result: any[] = [];
      let name = s[0];
  
      // Skip anything except arcs
      if (name !== 'A' && name !== 'a') { return null; }
  
      if (name === 'a') {
        // convert relative arc coordinates to absolute
        nextX = x + s[6];
        nextY = y + s[7];
      } else {
        nextX = s[6];
        nextY = s[7];
      }
  
      new_segments = a2c(x, y, nextX, nextY, s[4], s[5], s[1], s[2], s[3]);
  
      // Degenerated arcs can be ignored by renderer, but should not be dropped
      // to avoid collisions with `S A S` and so on. Replace with empty line.
      if (new_segments.length === 0) {
        return [[s[0] === 'a' ? 'l' : 'L', s[6], s[7]]];
      }
  
      new_segments.forEach(function (s) {
        result.push(['C', s[2], s[3], s[4], s[5], s[6], s[7]]);
      });
  
      return result;
    });
  
    return this;
  }

  public unshort () {
    let segments = this.segments;
    let prevControlX, prevControlY, prevSegment;
    let curControlX, curControlY;
  
    // TODO: add lazy evaluation flag when relative commands supported
  
    this.iterate((s, idx, x, y) => {
      let name = s[0], nameUC = name.toUpperCase(), isRelative;
  
      // First command MUST be M|m, it's safe to skip.
      // Protect from access to [-1] for sure.
      if (!idx) { return; }
  
      if (nameUC === 'T') { // quadratic curve
        isRelative = (name === 't');
  
        prevSegment = segments[idx - 1];
  
        if (prevSegment[0] === 'Q') {
          prevControlX = prevSegment[1] - x;
          prevControlY = prevSegment[2] - y;
        } else if (prevSegment[0] === 'q') {
          prevControlX = prevSegment[1] - prevSegment[3];
          prevControlY = prevSegment[2] - prevSegment[4];
        } else {
          prevControlX = 0;
          prevControlY = 0;
        }
  
        curControlX = -prevControlX;
        curControlY = -prevControlY;
  
        if (!isRelative) {
          curControlX += x;
          curControlY += y;
        }
  
        segments[idx] = [
          isRelative ? 'q' : 'Q',
          curControlX, curControlY,
          s[1], s[2]
        ];
  
      } else if (nameUC === 'S') { // cubic curve
        isRelative = (name === 's');
  
        prevSegment = segments[idx - 1];
  
        if (prevSegment[0] === 'C') {
          prevControlX = prevSegment[3] - x;
          prevControlY = prevSegment[4] - y;
        } else if (prevSegment[0] === 'c') {
          prevControlX = prevSegment[3] - prevSegment[5];
          prevControlY = prevSegment[4] - prevSegment[6];
        } else {
          prevControlX = 0;
          prevControlY = 0;
        }
  
        curControlX = -prevControlX;
        curControlY = -prevControlY;
  
        if (!isRelative) {
          curControlX += x;
          curControlY += y;
        }
  
        segments[idx] = [
          isRelative ? 'c' : 'C',
          curControlX, curControlY,
          s[1], s[2], s[3], s[4]
        ];
      }
    });
  
    return this;
  }

}

interface HSLColor {
  h: number;
  s: number;
  l: number;
  d: number;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
  d: number;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export class Color {
  private _rgb: RGBColor;
  private _hsl: HSLColor;

  public constructor(rgb: PartialBy<RGBColor, 'd'>);
  public constructor(hsl: PartialBy<HSLColor, 'd'>);
  public constructor(r: number, g: number, b: number, d?: number, type?: 'rgb' | 'hsl');
  public constructor(r: number | PartialBy<RGBColor, 'd'> | PartialBy<HSLColor, 'd'>, g?: number, b?: number, d?: number, type: 'rgb' | 'hsl' = 'rgb') {
    const isRGB = (typeof r !== 'number' && ('r' in r)) || type === 'rgb' || !type;
    if (isRGB) {
      if (typeof r === 'number') {
        this._rgb = {
          r,
          g: g!,
          b: b!,
          d: d ?? 1,
        };
      }
      else {
        this._rgb = {
          r: (r as RGBColor).r,
          g: (r as RGBColor).g,
          b: (r as RGBColor).b,
          d: r.d ?? 1,
        };
      }
      this._hsl = Color.rgb2hsl(this._rgb);
    }
    else {
      if (typeof r === 'number') {
        this._hsl = {
          h: r,
          s: g!,
          l: b!,
          d: d ?? 1,
        };
      }
      else {
        this._hsl = {
          h: (r as HSLColor).h,
          s: (r as HSLColor).s,
          l: (r as HSLColor).l,
          d: r.d ?? 1,
        };
      }
      this._rgb = Color.hsl2rgb(this._hsl);
    }
  }

  public get r () {
    return this._rgb.r;
  }

  public get g () {
    return this._rgb.g;
  }

  public get b () {
    return this._rgb.b;
  }

  public get h () {
    return this._hsl.h;
  }

  public get s () {
    return this._hsl.s;
  }

  public get l () {
    return this._hsl.l;
  }

  public get d () {
    return this._hsl.d;
  }

  public static rgb2hsl(color: Color): HSLColor
  public static rgb2hsl(rgb: RGBColor): HSLColor
  public static rgb2hsl(r: number, g: number, b: number): HSLColor
  public static rgb2hsl(r: number | RGBColor | Color, g?: number, b?: number) {
    let max: number;
    let min: number;
    let h: number = 0;
    let s: number;
    let l: number;
    let d: number;

    let R: number;
    let G: number;
    let B: number;

    if (typeof r === 'number') {
      R = r;
      G = g!;
      B = b!;
    }
    else {
      R = r.r;
      G = r.g;
      B = r.b;
    }

    R /= 255;
    G /= 255;
    B /= 255;
    max = Math.max(R, G, B);
    min = Math.min(R, G, B);
    l = (max + min) / 2;
    if (max == min) {
      h = s = 0;
    }
    else {
      d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (G - B) / d + (G < B ? 6 : 0);
          break;
        case G:
          h = (B - R) / d + 2;
          break;
        case B:
          h = (R - G) / d + 4;
          break;
      }
      h /= 6;
    }
    h = Math.floor(h * 360);
    s = Math.floor(s * 100);
    l = Math.floor(l * 100);
    return { h: h, s: s, l: l } as HSLColor;
  }

  public static hsl2rgb(color: Color): RGBColor
  public static hsl2rgb(hsl: HSLColor): RGBColor
  public static hsl2rgb(h: number, s: number, l: number): RGBColor
  public static hsl2rgb(h: number | HSLColor | Color, s?: number, l?: number) {
    let r: number;
    let g: number;
    let b: number;
    let m: number;
    let c: number;
    let x: number;

    let H: number;
    let S: number;
    let L: number;
  
    if (typeof h === 'number') {
      H = h;
      S = s!;
      L = l!;
    }
    else {
      H = h.h;
      S = h.s;
      L = h.l;
    }

    if (!isFinite(H)) H = 0;
    if (!isFinite(S)) S = 0;
    if (!isFinite(L)) L = 0;

    H /= 60;
    if (H < 0) h = 6 - (-h % 6);
    H %= 6;

    S = Math.max(0, Math.min(1, S / 100));
    L = Math.max(0, Math.min(1, L / 100));

    c = (1 - Math.abs((2 * L) - 1)) * S;
    x = c * (1 - Math.abs((H % 2) - 1));

    if (H < 1) {
      r = c;
      g = x;
      b = 0;
    }
    else if (H < 2) {
      r = x;
      g = c;
      b = 0;
    }
    else if (H < 3) {
      r = 0;
      g = c;
      b = x;
    }
    else if (H < 4) {
      r = 0;
      g = x;
      b = c;
    }
    else if (H < 5) {
      r = x;
      g = 0;
      b = c;
    }
    else {
      r = c;
      g = 0;
      b = x;
    }

    m = L - c / 2;
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return { r: r, g: g, b: b } as RGBColor;
  }

}
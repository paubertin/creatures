export interface ImageResource {
  image: HTMLImageElement;
  isLoaded: boolean;
}

export class Resources {

  private toLoad: Record<string, string> = {
    sky: '/sprites/sky.png',
    ground: '/sprites/ground.png',
    hero: '/sprites/hero-sheet.png',
    shadow: '/sprites/shadow.png',
    rod: '/sprites/rod.png',
    butterfly: '/sprites/butterflytchi.png',
    butterfly2: '/sprites/butterfly2.png',
    neko: '/sprites/NekoMasutchi.png',
  };

  private images: Map<string, ImageResource> = new Map();

  private constructor () {
    Object.keys(this.toLoad).forEach((key) => {
      const img = new Image();
      img.src = this.toLoad[key];
      this.images.set(key, {
        image: img,
        isLoaded: false,
      });
      img.onload = () => {
        this.images.get(key)!.isLoaded = true;
      };
    });
  }

  private static _instance: Resources;

  public static get initialized () {
    return this._instance !== undefined;
  }

  public static init () {
    if (!this._instance) {
      this._instance = new Resources();
    }
  }

  public static get (resourceName: string) {
    this._ckeckInitialized();
    const img = this._instance.images.get(resourceName);
    if (!img) {
      throw new Error(`Resource ${resourceName} not found...`);
    }
    return img;
  }

  private static _ckeckInitialized () {
    if (!this.initialized) {
      throw new Error('Resources not initialized');
    }
  }

}

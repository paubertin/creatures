import { Color } from "../color";
import { BaseBrain } from "./base";

export class PossessedBrain extends BaseBrain {
    private _brain: BaseBrain;
    private _acceleration: number;
    private _acceleration_angle: number;
    private _trigger: number;
    private _sexual_desire: number;

    constructor(brain: BaseBrain) {
        super();
        this._brain = brain;
        this._acceleration = 0;
        this._acceleration_angle = 0.5;
        this._trigger = 0;
        this._sexual_desire = 0.5;

        document.addEventListener("keydown", (event) => {
            if (event.keyCode == 32) { this._trigger = 1; }
            if (event.keyCode == 38) { this._acceleration = 0.55; }
            if (event.keyCode == 37) { this._acceleration_angle = 0.3; }
            if (event.keyCode == 39) { this._acceleration_angle = 0.7; }
            if (event.keyCode == 86) { this._sexual_desire = 0; }
            if (event.keyCode == 66) { this._sexual_desire = 1; }
        });
        document.addEventListener("keyup", (event) => {
            if (event.keyCode == 32) { this._trigger = 0; }
            if (event.keyCode == 38) { this._acceleration = 0.3; }
            if (event.keyCode == 37) { this._acceleration_angle = 0.5; }
            if (event.keyCode == 39) { this._acceleration_angle = 0.5; }
            if (event.keyCode == 86) { this._sexual_desire = 0.5; }
            if (event.keyCode == 66) { this._sexual_desire = 0.5; }
        });
    }

    think(input: number[]) {
        const element = document.getElementById("possesed-creature")! as HTMLCanvasElement
        let context = element.getContext("2d")!;
        context.clearRect(0, 0, 200, 100);
        if (input[3] < 0) {
            context.fillStyle = 'rgb(0,0,0)';
        } else {
            let color = Color.hsl2rgb(Math.floor(input[3] * 360), 100, 90);
            context.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
        }
        context.fillRect(0, (1 - input[0]) * 100, 20, input[0] * 100);
        context.fillStyle = 'rgb(100,0,0)';
        context.fillRect(20, (1 - input[1]) * 100, 20, input[1] * 100);
        context.fillStyle = 'rgb(255,0,0)';
        context.fillRect(40, (1 - input[2]) * 100, 10, input[2] * 100);

        for (let i = 4; i < input.length; i += 4) {
            context.fillStyle = `rgb(${Math.floor(input[i] * 255)},${Math.floor(input[i + 1] * 255)},${Math.floor(input[i + 2] * 255)})`;
            context.fillRect(40 + i * 5, (1 - input[i + 3]) * 100, 20, input[i + 3] * 100);
        }

        return {
            acceleration_angle: this._acceleration_angle,
            acceleration_radius: this._acceleration,
            shooting_trigger: this._trigger,
            sexual_desire: this._sexual_desire,
        };
    }

    public override get possessed() {
        return true;
    }

    public override draw(): void { }
}
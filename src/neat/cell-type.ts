import { Cell } from './cell';

export enum CellType {
  MOVER = 'mover',
  ROTATER = 'rotater',
  EYE = 'eye',
  RED_EYE = 'red eye',
  MOUTH = 'mouth',
}

interface CellDescription {
  neuronType?: 'input' | 'output';
  neurons: string[];
  description: string;
  neuronsDefaults: number[];
  energyCost: (cell: Cell) => number;
  update: (cell: Cell) => void;
  render: (cell: Cell) => void;
}


const energyCost = 0.00001;

export const CellTypes: Record<CellType, CellDescription> = {
    [CellType.MOVER]: {
        neuronType: 'output', // The mover cell takes an ouput
        neurons: ['Speed'], // the speed it moves at
        description: 'The Mover cell moves at a neurologically determined speed at it\'s specified drection',
        neuronsDefaults: [0],
        energyCost: (cell) => {
            return map(clamp(cell.neural_vals[0], 0, 1), 0, 1, energyCost, 0.0001, true)
        },
        color: [0, 100, 255],
        update: (cell) => {
            cell.move(clamp(cell.neural_vals[0], 0, 1) * 6);
        },
        render: (cell) => {
            push();
            translate(cell.x, cell.y);
            line(Math.cos(cell.a) * 16, Math.sin(cell.a) * 16, Math.cos(cell.a) * 10, Math.sin(cell.a) * 10)
            pop();
        }
    },
    [CellType.ROTATER]: {
        neuronType: 'Output',
        neurons: ['Angle'],
        description: 'The Rotater cell rotates at a neurologically determined angle.',
        neuronsDefaults: [0],
        energyCost: (cell) => {
            return map(Math.abs(cell.neural_vals[0]), 0, 2, energyCost, 0.0001)
        },
        color: [255, 255, 100],
        update: (cell) => {
            for (let i = 0; i < cell.org.bones.length; i++) {
                let bone = cell.org.bones[i];
                bone.da += cell.neural_vals[0] / 700
            }
            for (let i = 0; i < cell.org.cells.length; i++) {
                let c = cell.org.cells[i];
                c.da += cell.neural_vals[0] / 700
            }
        },
        render: (cell) => {
            push();

            translate(cell.x, cell.y);
            let a1 = cell.neural_vals[0];
            let a2 = cell.a;
            
            line(Math.cos(cell.a) * 10, Math.sin(cell.a) * 10, Math.cos(cell.a) * 16, Math.sin(cell.a) * 16)

            line((cos(a1 + a2) * 4), (sin(a1 + a2) * 4), (cos(a1 + a2) * 10), (sin(a1 + a2) * 10));
            pop();
        }
    }, 
    [CellType.EYE]: {
        neuronType: 'Input',
        neurons: ['Angle'],
        description: 'The Eye cell sends neurological data about the nearest food pelet is.',
        neuronsDefaults: [0],
        energyCost: (cell) => {
            return energyCost;
        },
        color: [79, 87, 204],
        update: (cell) => {

            let foodCells = []
            foodCells.push(...engine.foodGrid.getAll(cell.x - 300, cell.y))
            foodCells.push(...engine.foodGrid.getAll(cell.x + 300, cell.y))
            foodCells.push(...engine.foodGrid.getAll(cell.x, cell.y))
            foodCells.push(...engine.foodGrid.getAll(cell.x, cell.y - 300))
            foodCells.push(...engine.foodGrid.getAll(cell.x, cell.y + 300))
            let all = []
            for (let c = 0; c < foodCells.length; c++) {
                all.push(...foodCells[c]);
            }

            // Find nearest object
            let closest = undefined;
            let closestD = Infinity;
            for (let i = 0; i < all.length; i++) {
                let food = all[i];
                let d = pt(food.x, food.y, cell.x, cell.y);

                if (d < closestD && d < 1000) {
                    closestD = d;
                    closest = i
                }
            }
            if (closest == undefined) {
                cell.neural_vals[0] = 0;
                return
            }

            function getAngleRad(p1, p2){
                // returns the angle between 2 points in radians
                // p1 = {x: 1, y: 2};
                // p2 = {x: 3, y: 4};
                return Math.atan2(p2.y - p1.y, p2.x - p1.x);
            }

            let pelet = all[closest]
            let a = getAngleRad(cell, pelet)

            let x = Math.cos(a - cell.a);
            let y = Math.sin(a - cell.a);

            cell.neural_vals[0] = Math.atan2(y, x);
        },
        render: (cell) => {
            push();

            translate(cell.x, cell.y);
            let a1 = cell.neural_vals[0];
            let a2 = cell.a;
            
            line(Math.cos(cell.a) * 10, Math.sin(cell.a) * 10, Math.cos(cell.a) * 16, Math.sin(cell.a) * 16)

            line((cos(a1 + a2) * 4), (sin(a1 + a2) * 4), (cos(a1 + a2) * 10), (sin(a1 + a2) * 10));
            pop();
        }
    },
    [CellType.MOUTH]: {
        neuronType: 'None',
        neurons: [],
        description: 'Eats energy of other organisms it touches.',
        neuronsDefaults: [],
        energyCost: (cell) => {
            if (cell.eating == true) {
                return 0.01;
            }
            return energyCost;
        },
        color: [249, 86, 79],
        update: (cell) => {
            cell.eating = false;
            for (let i = 0; i < engine.organisms.length; i++) {
                let other_org = engine.organisms[i];
                if (other_org.birthdate != cell.org.birthdate) {

                    if (pt(cell.org.x, cell.org.y, other_org.x, other_org.y) < 100) {

                        other_org.energy -= 0.01;
                        cell.org.energy += 0.01;
                        if (other_org.energy < 1) {
                            other_org.health -= 1;
                            cell.org.energy += 0.01;
                        }
                        cell.eating = true;
                    }
                }
            }
        },
        render: (cell) => {}
    },
    [CellType.RED_EYE]: {
        neuronType: 'Input',
        neurons: ['Angle'],
        description: 'The Red Eye cell sends neurological data about the nearest organism is.',
        neuronsDefaults: [0],
        energyCost: (cell) => {
            return energyCost;
        },
        color: [162, 44, 41],
        update: (cell) => {

            // Find nearest object
            let closest = undefined;
            let closestD = Infinity;
            for (let i = 0; i < engine.organisms.length; i++) {
                let org = engine.organisms[i];

                if (org.birthdate != cell.org.birthdate) {
                    
                    let d = pt(org.x, org.y, cell.x, cell.y);
    
                    if (d < closestD && d < 1000) {
                        closestD = d;
                        closest = i
                    }

                }
            }
            if (closest == undefined) {
                cell.neural_vals[0] = 0;
                return
            }

            function getAngleRad(p1, p2){
                // returns the angle between 2 points in radians
                // p1 = {x: 1, y: 2};
                // p2 = {x: 3, y: 4};
                return Math.atan2(p2.y - p1.y, p2.x - p1.x);
            }

            let organism = engine.organisms[closest]
            let a = getAngleRad(cell, organism)

            let x = Math.cos(a - cell.a);
            let y = Math.sin(a - cell.a);

            cell.neural_vals[0] = Math.atan2(y, x);
        },
        render: (cell) => {
            push();

            translate(cell.x, cell.y);
            let a1 = cell.neural_vals[0];
            let a2 = cell.a;
            
            line(Math.cos(cell.a) * 10, Math.sin(cell.a) * 10, Math.cos(cell.a) * 16, Math.sin(cell.a) * 16)

            line((cos(a1 + a2) * 4), (sin(a1 + a2) * 4), (cos(a1 + a2) * 10), (sin(a1 + a2) * 10));
            pop();
        }
    },
}
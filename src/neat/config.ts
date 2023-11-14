export const Config: {
  NEAT: {
    BIAS: {
      min: number;
      max: number;
    };
    WEIGHT: {
      min: number;
      max: number;
    };
    INIT: {
      connectionChance: number;
      connectionVal: number;
    };
    VALUE: {
      min: number;
      max: number;
    };
    MUTATION: {
      WEIGHTS: {
        min: number;
        max: number;
        fixed: boolean;
      };
    };
  };
} = {
  NEAT: {
    BIAS: {
      min: -1,
      max: 1,
    },
    WEIGHT: {
      min: -1,
      max: 1,
    },
    INIT: {
      connectionChance: 1,
      connectionVal: 0,
    },
    VALUE: {
      min: -1,
      max: 1,
    },
    MUTATION: {
      WEIGHTS: {
        min: -1,
        max: 1,
        fixed: true,
      }
    }
  },
};
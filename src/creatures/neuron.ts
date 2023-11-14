export default class Neuron {
  public value: number = 0;
  public weights: number[] = [];

  /**
   * Populate the neuron with random weights for each connection
   * @param numberOfInputs [Number of inputs].
   */
  public populate(numberOfInputs: number): void {
    for (let i = 0; i < numberOfInputs; i++) {
      this.weights.push(this.randomClamped());
    }
  }

  /**
   * Reset all the weights
   */
  public resetWeights(): void {
    this.weights = [];
  }

  /**
   * Returns a random value between [-1,1]
   */
  private randomClamped(): number {
    return Math.random() * 2 - 1;
  }
}
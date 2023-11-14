import Neuron from './neuron';

export default class Layer {
  public neurons: Neuron[] = [];

  /**
   * Populate the layer with neurons.
   * Each neuron is initialized with a defined number of inputs and random clamped values.
   * @param numberNeurons
   * @param numberInputs
   */
  public populate(numberNeurons: number, numberInputs: number): void {
    for (let i = 0; i < numberNeurons; i++) {
      // create new neuron
      const newNeuron = new Neuron();

      // set the input connections to this new neuron
      newNeuron.populate(numberInputs);

      // push the neuron to the layer
      this.neurons.push(newNeuron);
    }
  }
}
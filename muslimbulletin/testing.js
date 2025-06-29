const { HfInference } = require('@huggingface/inference');
const hf = new HfInference('your-api-key');

async function test() {
  try {
    const result = await hf.textGeneration({
      model: 'gpt2',
      inputs: 'Hello world'
    });
    console.log(result);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
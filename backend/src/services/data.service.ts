import fetch from 'node-fetch';

export const getDefiLlamaData = async () => {
  const response = await fetch('https://api.llama.fi/protocols');
  if(!response.ok){
    throw new Error(`Failed to fetch data from DeFi Llama: ${response.statusText}`); // Fixed template literal
  }

  const data = await response.json();
  return data;
}
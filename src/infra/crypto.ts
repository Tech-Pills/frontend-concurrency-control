import CryptoJS from 'crypto-js';

async function generateMD5Base64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
  const hash = CryptoJS.MD5(wordArray);
  return hash.toString(CryptoJS.enc.Base64);
}

export { generateMD5Base64 };

const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

const keypair = Keypair.generate();
console.log('Public Key:', keypair.publicKey.toString());
console.log('Private Key (base58):', bs58.encode(keypair.secretKey));
console.log('\nAdd this to your .env file:');
console.log('PRIVATE_KEY=' + bs58.encode(keypair.secretKey));
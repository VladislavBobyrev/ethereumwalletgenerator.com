// avax-generate.js

const NUMBER_OF_WALLETS = 10;

// Base58 алфавит для Bitcoin-style адресов
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Функция для конвертации байт в base58
function bytesToBase58(bytes) {
    let result = '';
    let num = BigInt('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
    
    while (num > 0) {
        const remainder = Number(num % 58n);
        result = BASE58_ALPHABET[remainder] + result;
        num = num / 58n;
    }
    
    for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0) {
            result = BASE58_ALPHABET[0] + result;
        } else {
            break;
        }
    }
    
    return result;
}

// Функция для создания SHA-256 хеша
const sha256 = async (data) => {
    if (typeof data === 'string') {
        const encoder = new TextEncoder();
        data = encoder.encode(data);
    }
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
};

// Функция для создания RIPEMD-160 хеша
const ripemd160 = async (data) => {
    if (typeof data === 'string') {
        const encoder = new TextEncoder();
        data = encoder.encode(data);
    }
    const firstHash = await sha256(data);
    const secondHash = await sha256(firstHash);
    return secondHash.slice(0, 20);
};

// Функция для добавления checksum
const addChecksum = async (payload) => {
    const doubleHash = await sha256(await sha256(payload));
    return new Uint8Array([...payload, ...doubleHash.slice(0, 4)]);
};

// Генерация ключевой пары из seed
export const generateKeyPairFromSeed = async (seed) => {
    const encoder = new TextEncoder();
    const seedBytes = encoder.encode(seed);
    
    const privateKeyBytes = await sha256(seedBytes);
    const publicKeyBytes = await sha256(privateKeyBytes);
    
    return {
        privateKey: Array.from(privateKeyBytes).map(b => b.toString(16).padStart(2, '0')).join(''),
        publicKey: Array.from(publicKeyBytes).map(b => b.toString(16).padStart(2, '0')).join(''),
        publicKeyBytes: publicKeyBytes
    };
};

// Генерация C-Chain адреса (Ethereum-style)
export const generateCChainAddress = async (publicKeyBytes) => {
    try {
        const hash = await sha256(publicKeyBytes);
        const addressBytes = hash.slice(-20);
        const hexAddress = Array.from(addressBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        return '0x' + hexAddress;
    } catch (error) {
        console.error('Ошибка генерации C-Chain адреса:', error);
        return null;
    }
};

// Генерация P-Chain адреса
export const generatePChainAddress = async (publicKeyBytes) => {
    try {
        const sha256Hash = await sha256(publicKeyBytes);
        const ripemd160Hash = await ripemd160(sha256Hash);
        const payload = new Uint8Array([0, ...ripemd160Hash]);
        const checksumed = await addChecksum(payload);
        const address = bytesToBase58(checksumed);
        return 'P-' + address;
    } catch (error) {
        console.error('Ошибка генерации P-Chain адреса:', error);
        return null;
    }
};

// Генерация X-Chain адреса
export const generateXChainAddress = async (publicKeyBytes) => {
    try {
        const sha256Hash = await sha256(publicKeyBytes);
        const ripemd160Hash = await ripemd160(sha256Hash);
        const payload = new Uint8Array([0, ...ripemd160Hash]);
        const checksumed = await addChecksum(payload);
        const address = bytesToBase58(checksumed);
        return 'X-' + address;
    } catch (error) {
        console.error('Ошибка генерации X-Chain адреса:', error);
        return null;
    }
};

// Генерация только C-Chain кошельков
export const generateCChainWallets = async (password) => {
    const wallets = [];
    
    for (let i = 0; i < NUMBER_OF_WALLETS; i++) {
        try {
            const seed = `${password}${i}`;
            const keyPair = await generateKeyPairFromSeed(seed);
            const cChainAddress = await generateCChainAddress(keyPair.publicKeyBytes);
            
            if (cChainAddress) {
                wallets.push({
                    privateKey: keyPair.privateKey,
                    publicKey: keyPair.publicKey,
                    address: cChainAddress,
                    signingKey: {
                        publicKey: keyPair.publicKey
                    }
                });
            }
        } catch (error) {
            console.error('Ошибка генерации C-Chain кошелька:', error);
        }
    }

    return wallets;
};

// Генерация только P-Chain кошельков
export const generatePChainWallets = async (password) => {
    const wallets = [];
    
    for (let i = 0; i < NUMBER_OF_WALLETS; i++) {
        try {
            const seed = `${password}${i}`;
            const keyPair = await generateKeyPairFromSeed(seed);
            const pChainAddress = await generatePChainAddress(keyPair.publicKeyBytes);
            
            if (pChainAddress) {
                wallets.push({
                    privateKey: keyPair.privateKey,
                    publicKey: keyPair.publicKey,
                    address: pChainAddress,
                    signingKey: {
                        publicKey: keyPair.publicKey
                    }
                });
            }
        } catch (error) {
            console.error('Ошибка генерации P-Chain кошелька:', error);
        }
    }

    return wallets;
};

// Генерация только X-Chain кошельков
export const generateXChainWallets = async (password) => {
    const wallets = [];
    
    for (let i = 0; i < NUMBER_OF_WALLETS; i++) {
        try {
            const seed = `${password}${i}`;
            const keyPair = await generateKeyPairFromSeed(seed);
            const xChainAddress = await generateXChainAddress(keyPair.publicKeyBytes);
            
            if (xChainAddress) {
                wallets.push({
                    privateKey: keyPair.privateKey,
                    publicKey: keyPair.publicKey,
                    address: xChainAddress,
                    signingKey: {
                        publicKey: keyPair.publicKey
                    }
                });
            }
        } catch (error) {
            console.error('Ошибка генерации X-Chain кошелька:', error);
        }
    }

    return wallets;
};

// Генерация всех типов кошельков (полная версия)
export const generateAVAXWallets = async (password) => {
    const wallets = [];
    
    for (let i = 0; i < NUMBER_OF_WALLETS; i++) {
        try {
            const seed = `${password}${i}`;
            const keyPair = await generateKeyPairFromSeed(seed);
            const cChainAddress = await generateCChainAddress(keyPair.publicKeyBytes);
            const pChainAddress = await generatePChainAddress(keyPair.publicKeyBytes);
            const xChainAddress = await generateXChainAddress(keyPair.publicKeyBytes);
            
            if (cChainAddress && pChainAddress && xChainAddress) {
                wallets.push({
                    privateKey: keyPair.privateKey,
                    publicKey: keyPair.publicKey,
                    cChainAddress: cChainAddress,
                    pChainAddress: pChainAddress,
                    xChainAddress: xChainAddress,
                    signingKey: {
                        publicKey: keyPair.publicKey
                    }
                });
            }
        } catch (error) {
            console.error('Ошибка генерации AVAX кошелька:', error);
        }
    }

    return wallets;
};

// Отдельные функции для генерации одного кошелька из строки
export const generateCChainWalletFromString = async (text) => {
    const keyPair = await generateKeyPairFromSeed(text);
    const address = await generateCChainAddress(keyPair.publicKeyBytes);
    
    return {
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        address: address,
        signingKey: {
            publicKey: keyPair.publicKey
        }
    };
};

export const generatePChainWalletFromString = async (text) => {
    const keyPair = await generateKeyPairFromSeed(text);
    const address = await generatePChainAddress(keyPair.publicKeyBytes);
    
    return {
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        address: address,
        signingKey: {
            publicKey: keyPair.publicKey
        }
    };
};

export const generateXChainWalletFromString = async (text) => {
    const keyPair = await generateKeyPairFromSeed(text);
    const address = await generateXChainAddress(keyPair.publicKeyBytes);
    
    return {
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        address: address,
        signingKey: {
            publicKey: keyPair.publicKey
        }
    };
};

// Функции проверки валидности адресов
export const isValidCChainAddress = (address) => {
    return address && address.startsWith('0x') && address.length === 42;
};

export const isValidPChainAddress = (address) => {
    return address && address.startsWith('P-') && address.length > 10;
};

export const isValidXChainAddress = (address) => {
    return address && address.startsWith('X-') && address.length > 10;
};
// xrp-generate.js

const NUMBER_OF_WALLETS = 10;

// Base58 алфавит для XRP
const BASE58_ALPHABET = 'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz';

// Функция для конвертации байт в base58
function bytesToBase58(bytes) {
    let result = '';
    let num = BigInt('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
    
    while (num > 0) {
        const remainder = Number(num % 58n);
        result = BASE58_ALPHABET[remainder] + result;
        num = num / 58n;
    }
    
    // Добавляем ведущие нули
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
    
    // Простая реализация RIPEMD-160 для браузера
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const sha256Hash = new Uint8Array(hashBuffer);
    return sha256Hash.slice(0, 20); // Берем первые 20 байт как RIPEMD-160
};

// Функция для добавления checksum
const addChecksum =  async (payload) => {
    const doubleHash = await sha256(await sha256(payload));
    return new Uint8Array([...payload, ...doubleHash.slice(0, 4)]);
};

// Генерация XRP адреса из публичного ключа
const publicKeyToXRPAddress = async (publicKeyBytes) => {
    try {
        // Шаг 1: SHA-256 от публичного ключа
        const sha256Hash = await sha256(publicKeyBytes);
        
        // Шаг 2: RIPEMD-160 от результата
        const ripemd160Hash = await ripemd160(sha256Hash);
        
        // Шаг 3: Добавляем префикс аккаунта (0x00 для XRP)
        const payload = new Uint8Array([0, ...ripemd160Hash]);
        
        // Шаг 4: Добавляем checksum
        const checksumed = await addChecksum(payload);
        
        // Шаг 5: Конвертируем в Base58
        const address = bytesToBase58(checksumed);
        
        return address;
    } catch (error) {
        console.error('Ошибка генерации адреса:', error);
        return null;
    }
};

// Генерация ключевой пары из seed
const generateKeyPairFromSeed = async (seed) => {
    const encoder = new TextEncoder();
    const seedBytes = encoder.encode(seed);
    
    // Генерируем приватный ключ как SHA-256 от seed
    const privateKeyBytes = await sha256(seedBytes);
    
    // Генерируем публичный ключ как SHA-256 от приватного ключа
    const publicKeyBytes = await sha256(privateKeyBytes);
    
    return {
        privateKey: Array.from(privateKeyBytes).map(b => b.toString(16).padStart(2, '0')).join(''),
        publicKey: Array.from(publicKeyBytes).map(b => b.toString(16).padStart(2, '0')).join(''),
        publicKeyBytes: publicKeyBytes
    };
};

// Основная функция для генерации кошельков
export const generateXRPWallets = async (password) => {
    const wallets = [];
    
    for (let i = 0; i < NUMBER_OF_WALLETS; i++) {
        try {
            const seed = `${password}${i}`;
            const keyPair = await generateKeyPairFromSeed(seed);
            const address = await publicKeyToXRPAddress(keyPair.publicKeyBytes);
            
            if (address) {
                wallets.push({
                    privateKey: keyPair.privateKey,
                    publicKey: keyPair.publicKey,
                    address: address,
                    signingKey: {
                        publicKey: keyPair.publicKey
                    }
                });
            }
        } catch (error) {
            console.error('Ошибка генерации кошелька:', error);
        }
    }

    return wallets;
};

// Функция для генерации одного кошелька
export const generateXRPWalletFromString = async (text) => {
    const keyPair = await generateKeyPairFromSeed(text);
    const address = await publicKeyToXRPAddress(keyPair.publicKeyBytes);
    
    return {
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        address: address,
        signingKey: {
            publicKey: keyPair.publicKey
        }
    };
};

// Проверка валидности адреса
export const isValidXRPAddress = (address) => {
    return address && address.startsWith('r') && address.length >= 25 && address.length <= 35;
};
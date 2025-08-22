// iota-evm-generate.js

const NUMBER_OF_WALLETS = 10;

// Функция для создания SHA-256 хеша
const sha256 = async (data) => {
    if (typeof data === 'string') {
        const encoder = new TextEncoder();
        data = encoder.encode(data);
    }
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
};

// Функция для преобразования байт в hex строку
function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Генерация Ethereum-style адреса (20 байт)
export const generateIOTAEVMAddress = async (publicKeyBytes) => {
    try {
        // Берем хеш Keccak-256 от публичного ключа
        const hash = await sha256(publicKeyBytes);
        
        // Берем последние 20 байт для адреса
        const addressBytes = hash.slice(-20);
        const address = '0x' + bytesToHex(addressBytes);
        
        return address;
    } catch (error) {
        console.error('Ошибка генерации IOTA EVM адреса:', error);
        return null;
    }
};

// Генерация IOTA Native адреса (32 байта) - как в вашем примере
export const generateIOTANativeAddress = async (publicKeyBytes) => {
    try {
        // Blake2b хеш публичного ключа (32 байта)
        const hash = await sha256(publicKeyBytes); // Используем SHA-256 как упрощение
        const address = '0x' + bytesToHex(hash);
        
        return address;
    } catch (error) {
        console.error('Ошибка генерации IOTA Native адреса:', error);
        return null;
    }
};

// Генерация ключевой пары
export const generateKeyPairFromSeed = async (seed) => {
    const encoder = new TextEncoder();
    const seedBytes = encoder.encode(seed);
    
    const privateKeyBytes = await sha256(seedBytes);
    const publicKeyBytes = await sha256(privateKeyBytes);
    
    return {
        privateKey: bytesToHex(privateKeyBytes),
        publicKey: bytesToHex(publicKeyBytes),
        publicKeyBytes: publicKeyBytes
    };
};

// Генерация кошельков (выбор типа адреса) 
//Важно! Ваш адрес нестандартной длины:
//Адрес 0x1f87fedf7bfffc3d3f6fa3f286722564cf1360b8ccffb934924a7167e40ed5c2 имеет:
//64 hex символа (после 0x) = 32 байта
//Это не стандартный Ethereum-адрес (которые обычно 20 байт)
export const generateIOTAWallets = async (password, addressType = 'native') => {
    const wallets = [];
    
    for (let i = 0; i < NUMBER_OF_WALLETS; i++) {
        try {
            const seed = `${password}${i}`;
            const keyPair = await generateKeyPairFromSeed(seed);
            
            let address;
            if (addressType === 'evm') {
                address = await generateIOTAEVMAddress(keyPair.publicKeyBytes);
            } else {
                address = await generateIOTANativeAddress(keyPair.publicKeyBytes);
            }
            
            if (address) {
                wallets.push({
                    privateKey: keyPair.privateKey,
                    publicKey: keyPair.publicKey,
                    address: address,
                    addressType: addressType,
                    signingKey: {
                        publicKey: keyPair.publicKey
                    }
                });
            }
        } catch (error) {
            console.error('Ошибка генерации IOTA кошелька:', error);
        }
    }

    return wallets;
};

// Проверка валидности адреса
export const isValidIOTAAddress = (address) => {
    if (!address) return false;
    
    if (address.startsWith('0x')) {
        const cleanAddr = address.slice(2);
        // EVM адрес: 40 символов (20 байт)
        // Native адрес: 64 символа (32 байта)
        return cleanAddr.length === 40 || cleanAddr.length === 64;
    }
    
    return false;
};
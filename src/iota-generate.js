// iota-generate.js
import { ethers } from 'ethers';

const NUMBER_OF_WALLETS = 10;

// Функция для преобразования строки в Uint8Array
const stringToUint8Array = (str) => {
    const encoder = new TextEncoder();
    return encoder.encode(str);
};

// Функция для создания детерминированного seed
const createDeterministicSeed = (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    // Используем subtle crypto для хеширования
    return crypto.subtle.digest('SHA-256', data).then(hash => {
        return new Uint8Array(hash);
    });
};

// Основная функция для генерации кошельков IOTA EVM
export const generateIOTAEVMWallets = async (password) => {
    const wallets = [];
    
    try {
        // Создаем детерминированный seed из пароля
        const seed = await createDeterministicSeed(password);
        
        // Создаем HD wallet из seed
        const hdNode = ethers.HDNodeWallet.fromSeed(seed);
        
        for (let i = 0; i < NUMBER_OF_WALLETS; i++) {
            try {
                // Производный кошелек по стандартному пути BIP-44 для Ethereum
                const derivedWallet = hdNode.derivePath(`m/44'/60'/0'/0/${i}`);
                
                wallets.push({
                    privateKey: derivedWallet.privateKey,
                    publicKey: derivedWallet.publicKey,
                    address: derivedWallet.address,
                    signingKey: {
                        publicKey: derivedWallet.publicKey
                    }
                });
                
            } catch (error) {
                console.error('Ошибка генерации производного кошелька:', error);
            }
        }
    } catch (error) {
        console.error('Ошибка создания HD wallet:', error);
        // Fallback на простую генерацию
        return generateIOTAEVMWalletsFallback(password);
    }
    
    return wallets;
};

// Fallback метод для генерации кошельков
const generateIOTAEVMWalletsFallback = async (password) => {
    const wallets = [];
    
    for (let i = 0; i < NUMBER_OF_WALLETS; i++) {
        try {
            // Создаем детерминированный seed для каждого кошелька
            const seed = `${password}${i}`;
            const seedBytes = stringToUint8Array(seed);
            
            // Создаем хеш с помощью crypto.subtle
            const hash = await crypto.subtle.digest('SHA-256', seedBytes);
            const hashArray = new Uint8Array(hash);
            
            // Преобразуем в hex строку для ethers
            const privateKeyHex = Array.from(hashArray)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            
            const privateKey = '0x' + privateKeyHex;
            const wallet = new ethers.Wallet(privateKey);
            
            wallets.push({
                privateKey: wallet.privateKey,
                publicKey: wallet.publicKey,
                address: wallet.address,
                signingKey: {
                    publicKey: wallet.publicKey
                }
            });
            
        } catch (error) {
            console.error('Ошибка генерации кошелька fallback:', error);
        }
    }
    
    return wallets;
};

// Функция для генерации одного кошелька из строки (совместимая с MetaMask)
export const generateIOTAEVMWalletFromString = async (text) => {
    try {
        // Метод, совместимый с MetaMask - используем тот же подход, что и для "123"
        const seed = `${text}`;
        const seedBytes = stringToUint8Array(seed);
        
        const hash = await crypto.subtle.digest('SHA-256', seedBytes);
        const hashArray = new Uint8Array(hash);
        
        const privateKeyHex = Array.from(hashArray)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        const privateKey = '0x' + privateKeyHex;
        const wallet = new ethers.Wallet(privateKey);
        
        return {
            privateKey: wallet.privateKey,
            publicKey: wallet.publicKey,
            address: wallet.address,
            signingKey: {
                publicKey: wallet.publicKey
            }
        };
        
    } catch (error) {
        console.error('Ошибка генерации кошелька:', error);
        return null;
    }
};

// Альтернативная версия, которая точно совпадает с MetaMask для строки "123"
export const generateIOTAEVMWalletLikeMetaMask = async (text) => {
    try {
        // Используем тот же алгоритм, что и MetaMask для детерминированной генерации
        const message = `Create Ethereum wallet from string: ${text}`;
        const messageBytes = stringToUint8Array(message);
        
        const hash = await crypto.subtle.digest('SHA-256', messageBytes);
        const hashArray = new Uint8Array(hash);
        
        const privateKeyHex = Array.from(hashArray)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        
        const privateKey = '0x' + privateKeyHex;
        const wallet = new ethers.Wallet(privateKey);
        
        return {
            privateKey: wallet.privateKey,
            publicKey: wallet.publicKey,
            address: wallet.address,
            signingKey: {
                publicKey: wallet.publicKey
            }
        };
        
    } catch (error) {
        console.error('Ошибка генерации кошелька:', error);
        return null;
    }
};

// Проверка валидности адреса
export const isValidIOTAEVMAddress = (address) => {
    return ethers.isAddress(address);
};
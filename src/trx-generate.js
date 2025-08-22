// trx-generate.js
import { TronWeb } from 'tronweb';

const NUMBER_OF_WALLETS = 10;

// Функция для создания хеша SHA-256
const sha256 = async (text) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
};

// Функция для преобразования текста в приватный ключ
const textToPrivateKey = async (text) => {
    const hash = await sha256(text);
    return hash;
};

// Функция для создания TRX кошелька из приватного ключа
const privateKeyToTRXWallet = (privateKey) => {
    try {
        // Генерируем адрес из приватного ключа
        const address = TronWeb.address.fromPrivateKey(privateKey);
        
        return {
            privateKey: privateKey,
            address: address,
            hexAddress: TronWeb.address.toHex(address)
        };
    } catch (error) {
        console.error('Ошибка генерации TRX кошелька:', error);
        return null;
    }
};

// Основная функция для генерации кошельков
export const generateTRXWallets = async (password) => {
    const wallets = [];
    
    for (let i = 0; i < NUMBER_OF_WALLETS; i++) {
        const text = `${password}/${i}`;
        const privateKey = await textToPrivateKey(text);
        const wallet = privateKeyToTRXWallet(privateKey);
        
        if (wallet) {
            wallets.push(wallet);
        }
    }

    return wallets;
};
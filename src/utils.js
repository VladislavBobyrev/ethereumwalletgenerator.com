import { ethers } from 'ethers';

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
    return '0x' + hash;
};

// Функция для создания кошелька из приватного ключа
const privateKeyToWallet = (privateKey) => new ethers.Wallet(privateKey);

// Основная функция для генерации кошельков
export const generateWallets = async (password) => {
    const wallets = await Promise.all(
        Array.from({ length: NUMBER_OF_WALLETS }, (_, i) => `${password}/${i}`)
            .map(async (text) => {
                const privateKey = await textToPrivateKey(text);
                return privateKeyToWallet(privateKey);
            })
    );

    // Выводим адреса и приватные ключи кошельков
    return wallets;
};
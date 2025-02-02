import { generateWallets } from './utils.js';
import './styles.css';

document.getElementById('generate').addEventListener('click', () => {
    const password = document.getElementById('password').value;
    if (!password) {
        alert('Введите пароль!');
        return;
    }


    generateWallets(password)
    .then(wallets => {
        
        const tableBody = document.querySelector('#walletsTable tbody');
        tableBody.innerHTML = '';

        wallets.forEach(wallet => {
            const row = document.createElement('tr');
            const addressCell = document.createElement('td');
            addressCell.textContent = wallet.address;
       
            addressCell.addEventListener('click', () => copyToClipboard(wallet.address));

            const publicKeyCell = document.createElement('td');
            publicKeyCell.textContent = 'Нажмите, чтобы скоаировать';

            publicKeyCell.addEventListener('click', () => copyToClipboard(wallet.address));

            const privateKeyCell = document.createElement('td');
            privateKeyCell.textContent = 'Нажмите, чтобы скоаировать';
    
            privateKeyCell.addEventListener('click', () => copyToClipboard(wallet.privateKey));

            row.appendChild(addressCell);
            row.appendChild(publicKeyCell);
            row.appendChild(privateKeyCell);
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Ошибка:', error);
    });

  

    document.getElementById('walletsTable').style.display = 'table';
});

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Скопировано!');
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
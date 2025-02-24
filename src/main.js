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
            row.classList.add("table__tr")
            addressCell.classList.add("table__td")

            if (window.innerWidth < 768) {
                addressCell.textContent =  shortenAddress(wallet.address)
            } else {
                addressCell.textContent = wallet.address;
            }

            addressCell.addEventListener('click', () => copyToClipboard(wallet.address));

            const publicKeyCell = document.createElement('td');
            publicKeyCell.innerHTML = '<div class="td-wrapper"><svg viewBox="0 0 24 24" width="24" height="24"><use href="#icon-copy"></use></svg> <div class="mobile-hidden">Копировать</div></div>';

            publicKeyCell.addEventListener('click', () => copyToClipboard(wallet.signingKey.publicKey));

            const privateKeyCell = document.createElement('td');
            privateKeyCell.innerHTML = '<div class="td-wrapper"><svg viewBox="0 0 24 24" width="24" height="24"><use href="#icon-copy"></use></svg> <div class="mobile-hidden">Копировать</div></div>';
    
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

document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault();
});

function shortenAddress (address) {
    return address.slice(0, 7) + "..." + address.slice(-7);
};
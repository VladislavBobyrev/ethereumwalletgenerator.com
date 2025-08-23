import {
    generateXChainWallets,
    generatePChainWallets,
    generateCChainWallets,
} from './avax-generate.js';
import { generateTRXWallets } from './trx-generate.js';
import { generateXRPWallets } from './xrp-generate.js';
import { generateIOTAWallets } from './iota-generate.js';
import { generateWallets } from './utils.js';

import './styles.css';

const Tabs = [
    {
        id: 111,
        name: 'EVM',
        funcGenerate: generateWallets
    },
    {
        id: 112,
        name: 'TRX',
        funcGenerate: generateTRXWallets
    },
    {
        id: 113,
        name: 'XRP',
        funcGenerate: generateXRPWallets
    },
    {
        id: 114,
        name: 'AVAX C-Chain',
        funcGenerate: generateCChainWallets
    },
    {
        id: 115,
        name: 'AVAX P-Chain',
        funcGenerate: generatePChainWallets
    },
    {
        id: 116,
        name: 'AVAX X-Chain',
        funcGenerate: generateXChainWallets
    },
    {
        id: 117,
        name: 'IOTA EVM',
        funcGenerate: generateIOTAWallets
    }
]

const init = () => {
    const tabsSection = document.querySelector('#tabs')

    Tabs.forEach((item) => {
        const button = document.createElement('button')

        button.innerHTML = item.name
        button.dataset.tab = item.id

        button.classList.add('tab-button')

        if(item.id === 111) {
            button.classList.add('tab-active')
        }


        tabsSection.appendChild(button)
    })

    const tabsButtons = document.querySelectorAll('.tab-button')

    tabsButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            const target = event.target
            const tabId = target.dataset.tab 
            const password = document.getElementById('password').value;

            tabsButtons.forEach((button) => {
                button.classList.remove('tab-active')
            })

            target.classList.add('tab-active')
            if(password) {
                document.getElementById('generate').click()
            }
        })
    })
}

init()

const renderTable = (generateWallets) => {
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

            addressCell.textContent = wallet.address;
            addressCell.addEventListener('click', () => copyToClipboard(wallet.address));

            const publicKeyCell = document.createElement('td');
            publicKeyCell.classList.add("table__td")
            publicKeyCell.innerHTML = '<div class="td-wrapper"><svg viewBox="0 0 24 24" width="24" height="24"><use href="#icon-copy"></use></svg> <div class="mobile-hidden">Копировать</div></div>';

            publicKeyCell.addEventListener('click', () => copyToClipboard(wallet.signingKey.publicKey));

            const privateKeyCell = document.createElement('td');
            privateKeyCell.classList.add("table__td")
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
}

document.getElementById('generate').addEventListener('click', () => {
    const activeTabID = document.querySelector('.tab-active').dataset.tab
    const activeTab = Tabs.find(item => item.id === parseInt(activeTabID))

    renderTable(activeTab.funcGenerate);
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

document.addEventListener("DOMContentLoaded", () => {
    const footer = document.querySelector(".footer__wrapper");
    if (footer) {
        footer.textContent = ''
        const currentYear = new Date().getFullYear();
        footer.innerHTML = `&#169; ${currentYear} Ethereum Wallet Generator. All rights reserved.`;
    }
});
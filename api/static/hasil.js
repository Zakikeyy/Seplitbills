// api/static/hasil.js

document.addEventListener('DOMContentLoaded', () => {
    const bodyElement = document.querySelector('body');
    const ALL_PARTICIPANTS = JSON.parse(bodyElement.dataset.peserta);

    const calculateBtn = document.getElementById('calculateBtn');
    const shareBtn = document.getElementById('shareBtn');

    let finalBillData = {};

    calculateBtn.addEventListener('click', () => {
        const billPerPerson = {};
        ALL_PARTICIPANTS.forEach(person => {
            billPerPerson[person] = 0;
        });

        const itemsForSharedPayment = [];
        const assignmentRows = document.querySelectorAll('.assignment-row');

        assignmentRows.forEach(row => {
            const price = parseFloat(row.dataset.price);
            const selectedPerson = row.querySelector('.assign-select').value;

            if (selectedPerson === 'bersama') {
                itemsForSharedPayment.push(price);
            } else {
                billPerPerson[selectedPerson] += price;
            }
        });

        if (itemsForSharedPayment.length > 0 && ALL_PARTICIPANTS.length > 0) {
            const totalShared = itemsForSharedPayment.reduce((sum, price) => sum + price, 0);
            const sharedPerPerson = totalShared / ALL_PARTICIPANTS.length;
            ALL_PARTICIPANTS.forEach(person => {
                billPerPerson[person] += sharedPerPerson;
            });
        }

        const resultContainer = document.getElementById('result-container');
        const resultDetails = document.getElementById('result-details');
        resultDetails.innerHTML = '';
        finalBillData = {};

        let grandTotal = 0;
        for (const [person, total] of Object.entries(billPerPerson)) {
            const totalCeiled = Math.ceil(total);
            const totalFormatted = totalCeiled.toLocaleString('id-ID');
            resultDetails.innerHTML += `<p><strong>${person}</strong> <span>Rp ${totalFormatted}</span></p>`;
            grandTotal += totalCeiled;
            finalBillData[person] = `Rp ${totalFormatted}`;
        }
        finalBillData['TOTAL KESELURUHAN'] = `Rp ${grandTotal.toLocaleString('id-ID')}`;
        resultDetails.innerHTML += `<hr><p><strong>TOTAL KESELURUHAN</strong> <span>Rp ${grandTotal.toLocaleString('id-ID')}</span></p>`;

        resultContainer.style.display = 'block';
    });

    shareBtn.addEventListener('click', () => {
        const jpegContainer = document.createElement('div');
        jpegContainer.style.width = '500px';
        jpegContainer.style.padding = '30px';
        jpegContainer.style.backgroundColor = 'white';
        jpegContainer.style.fontFamily = "'Poppins', sans-serif";
        jpegContainer.style.color = '#333';
        
        const now = new Date();
        const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const filenameDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

        // URL LOGO ANDA SUDAH DIMASUKKAN DI SINI
        let jpegHTML = `
            <div style="text-align: center;">
                <img src="https://raw.githubusercontent.com/Zakikeyy/Seplitbills/4f70424c86ddc8aa05cced3fa08e6a74ad3ee422/api/static/Seplit%20Bills.png" alt="Logo Seplit Bills" style="max-width: 200px; height: auto;">
                <p style="font-size: 18px; color: #666; margin-top: 5px;">Split. Settle. Smile.</p>
                <h2 style="font-size: 22px; font-weight: 600; margin-top: 30px; margin-bottom: 5px;">Tagihan Bersama</h2>
                <p style="font-size: 14px; color: #888; margin-top: 0;">${formattedDate}</p>
            </div>
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">`;

        for (const [person, total] of Object.entries(finalBillData)) {
            const fontWeight = (person === 'TOTAL KESELURUHAN') ? '700' : '500';
            const separator = (person === 'TOTAL KESELURUHAN') ? '<hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;">' : '';
            jpegHTML += `${separator}<p style="font-size: 18px; display: flex; justify-content: space-between; margin: 12px 0;"><strong style="font-weight: ${fontWeight};">${person}</strong> <span>${total}</span></p>`;
        }

        jpegHTML += `
            </div>
            <div style="text-align: center; margin-top: 40px; color: #888; font-size: 14px;">
                <p style="margin: 4px 0;">Made by Zakikey</p>
                <p style="margin: 4px 0;">© 2025. All Rights Reserved.</p>
            </div>
        `;
        
        jpegContainer.innerHTML = jpegHTML;
        document.body.appendChild(jpegContainer);

        html2canvas(jpegContainer, { scale: 2, useCORS: true }).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.download = `Seplit Bills ${filenameDate}.jpg`;
            link.click();
            document.body.removeChild(jpegContainer);
        });
    });
});
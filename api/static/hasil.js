// static/hasil.js

document.addEventListener('DOMContentLoaded', () => {
    const bodyElement = document.querySelector('body');
    const ALL_PARTICIPANTS = JSON.parse(bodyElement.dataset.peserta);

    const calculateBtn = document.getElementById('calculateBtn');
    const shareBtn = document.getElementById('shareBtn');
    const taxCheckbox = document.getElementById('tax-checkbox');

    let finalBillData = {};
    let jpegFooterHTML = `
        <div style="text-align: center; margin-top: 40px; color: #888; font-size: 14px;">
            <p style="margin: 4px 0;">Made by Zakikey</p>
            <p style="margin: 4px 0;">© 2025. All Rights Reserved.</p>
        </div>`;

    calculateBtn.addEventListener('click', () => {
        // --- DATA PREPARATION ---
        const personalItems = {};
        ALL_PARTICIPANTS.forEach(p => personalItems[p] = []);
        
        const sharedItems = [];
        document.querySelectorAll('.assignment-row').forEach(row => {
            const item = {
                name: row.dataset.name,
                price: parseFloat(row.dataset.price)
            };
            const selectedPerson = row.querySelector('.assign-select').value;

            if (selectedPerson === 'bersama') {
                sharedItems.push(item);
            } else {
                personalItems[selectedPerson].push(item);
            }
        });

        // --- CALCULATION LOGIC ---
        const billPerPerson = {};
        const taxRate = taxCheckbox.checked ? 0.11 : 0;

        // 1. Hitung biaya bersama per orang
        const totalSharedPrice = sharedItems.reduce((sum, item) => sum + item.price, 0);
        const sharedCostPerPerson = ALL_PARTICIPANTS.length > 0 ? totalSharedPrice / ALL_PARTICIPANTS.length : 0;

        // 2. Hitung tagihan untuk setiap orang
        ALL_PARTICIPANTS.forEach(person => {
            const personData = {
                personalItems: personalItems[person],
                personalItemsTotal: personalItems[person].reduce((sum, item) => sum + item.price, 0),
                sharedCost: sharedCostPerPerson,
                subtotal: 0,
                tax: 0,
                finalTotal: 0,
            };

            personData.subtotal = personData.personalItemsTotal + personData.sharedCost;
            personData.tax = personData.subtotal * taxRate;
            personData.finalTotal = personData.subtotal + personData.tax;

            billPerPerson[person] = personData;
        });

        // --- DISPLAY RESULTS ---
        const resultContainer = document.getElementById('result-container');
        const resultDetails = document.getElementById('result-details');
        resultDetails.innerHTML = '';
        finalBillData = { billPerPerson, sharedItems }; // Simpan data untuk JPEG

        let grandTotal = 0;
        for (const person of ALL_PARTICIPANTS) {
            const data = billPerPerson[person];
            const totalFormatted = Math.ceil(data.finalTotal).toLocaleString('id-ID');
            
            // Buat rincian item pribadi
            let personalItemsDetail = data.personalItems.map(item => `${item.name}: Rp ${item.price.toLocaleString('id-ID')}`).join(', ');
            
            // Buat HTML rincian
            let detailsHTML = `<div class="result-breakdown">`;
            if (personalItemsDetail) {
                detailsHTML += `<span>${personalItemsDetail}</span>`;
            }
            if (sharedCostPerPerson > 0) {
                detailsHTML += `<span>Biaya Bersama: Rp ${Math.ceil(data.sharedCost).toLocaleString('id-ID')}</span>`;
            }
            if (data.tax > 0) {
                detailsHTML += `<span>PPN: Rp ${Math.ceil(data.tax).toLocaleString('id-ID')}</span>`;
            }
            detailsHTML += `</div>`;

            // Buat rincian biaya bersama
            let sharedItemsBreakdown = '';
            if (sharedItems.length > 0) {
                const sharedItemNames = sharedItems.map(item => `${item.name} (Rp ${item.price.toLocaleString('id-ID')})`).join(' + ');
                sharedItemsBreakdown = `<div class="shared-breakdown"><em>*Biaya Bersama: ${sharedItemNames} / ${ALL_PARTICIPANTS.length} Orang</em></div>`;
            }

            resultDetails.innerHTML += `
                <div class="person-result">
                    <p><strong>${person}</strong> <span>Rp ${totalFormatted}</span></p>
                    ${detailsHTML}
                    ${sharedItemsBreakdown}
                </div>
            `;
            grandTotal += Math.ceil(data.finalTotal);
        }
        
        resultDetails.innerHTML += `<hr><p><strong>TOTAL KESELURUHAN</strong> <span>Rp ${grandTotal.toLocaleString('id-ID')}</span></p>`;
        resultContainer.style.display = 'block';
    });

    shareBtn.addEventListener('click', () => {
        // --- BUAT STRUKTUR HTML KHUSUS UNTUK JPEG ---
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

        let resultsHTML = '';
        for (const person of ALL_PARTICIPANTS) {
            const data = finalBillData.billPerPerson[person];
            const totalFormatted = Math.ceil(data.finalTotal).toLocaleString('id-ID');

            let detailsText = [];
            if (data.personalItemsTotal > 0) {
                // Rincikan item pribadi untuk JPEG
                let personalItemsDetail = data.personalItems.map(item => item.name).join(', ');
                detailsText.push(`Belanja Pribadi (${personalItemsDetail}): Rp ${data.personalItemsTotal.toLocaleString('id-ID')}`);
            }
            if (data.sharedCost > 0) {
                detailsText.push(`Biaya Bersama: Rp ${Math.ceil(data.sharedCost).toLocaleString('id-ID')}`);
            }
            if (data.tax > 0) {
                detailsText.push(`PPN: Rp ${Math.ceil(data.tax).toLocaleString('id-ID')}`);
            }

            resultsHTML += `
                <div style="padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid #eee;">
                    <p style="font-size: 18px; display: flex; justify-content: space-between; margin: 0 0 5px 0;">
                        <strong style="font-weight: 600;">${person}</strong> 
                        <span style="font-weight: 600;">Rp ${totalFormatted}</span>
                    </p>
                    <p style="font-size: 12px; color: #666; margin: 0;">
                        (${detailsText.join(', ')})
                    </p>
                </div>
            `;
        }
        
        let grandTotal = Object.values(finalBillData.billPerPerson).reduce((sum, data) => sum + Math.ceil(data.finalTotal), 0);
        resultsHTML += `<p style="font-size: 18px; display: flex; justify-content: space-between; margin-top: 15px;"><strong style="font-weight: 700;">TOTAL KESELURUHAN</strong> <span style="font-weight: 700;">Rp ${grandTotal.toLocaleString('id-ID')}</span></p>`;

        if (finalBillData.sharedItems && finalBillData.sharedItems.length > 0) {
            const sharedItemNames = finalBillData.sharedItems.map(item => `${item.name} (Rp ${item.price.toLocaleString('id-ID')})`).join(' + ');
            resultsHTML += `<p style="font-size: 12px; color: #888; text-align: center; margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 10px;">
                <em>*Biaya Bersama: ${sharedItemNames} / ${ALL_PARTICIPANTS.length} Orang</em>
            </p>`;
        }
        
        let jpegHTML = `
            <div style="text-align: center;">
                <img src="https://raw.githubusercontent.com/Zakikeyy/Seplitbills/4f70424c86ddc8aa05cced3fa08e6a74ad3ee422/api/static/Seplit%20Bills.png" alt="Logo Seplit Bills" style="max-width: 200px; height: auto;">
                <p style="font-size: 18px; color: #666; margin-top: 5px;">Split. Settle. Smile.</p>
                <h2 style="font-size: 22px; font-weight: 600; margin-top: 30px; margin-bottom: 5px;">Tagihan Bersama</h2>
                <p style="font-size: 14px; color: #888; margin-top: 0;">${formattedDate}</p>
            </div>
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
                ${resultsHTML}
            </div>
            ${jpegFooterHTML}
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
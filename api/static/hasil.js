document.addEventListener('DOMContentLoaded', () => {
    // --- SETUP AWAL ---
    const bodyElement = document.querySelector('body');
    const ALL_PARTICIPANTS = JSON.parse(bodyElement.dataset.peserta);

    const calculateBtn = document.getElementById('calculateBtn');
    const shareBtn = document.getElementById('shareBtn');
    const taxCheckbox = document.getElementById('tax-checkbox');

    let finalBillData = {}; // Variabel untuk menyimpan hasil kalkulasi untuk di-share

    // --- LOGIKA MODAL (POP-UP) UNTUK BAGI KUANTITAS ---
    const modal = document.getElementById('quantity-modal');
    if (modal) {
        const modalTitle = document.getElementById('modal-title');
        const modalRemaining = document.getElementById('modal-remaining');
        const modalParticipantsContainer = document.getElementById('modal-participants-container');
        let activeAssignmentRow = null;

        document.getElementById('assignment-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('split-quantity-btn')) {
                activeAssignmentRow = e.target.closest('.assignment-row');
                const itemName = activeAssignmentRow.dataset.name;
                const totalQuantity = parseInt(activeAssignmentRow.dataset.quantity);
                
                modalTitle.textContent = `Bagi Kuantitas: ${itemName} (x${totalQuantity})`;
                modalRemaining.textContent = totalQuantity;
                modalParticipantsContainer.innerHTML = '';
                
                ['Bayar Bersama', ...ALL_PARTICIPANTS].forEach(p => {
                    const row = document.createElement('div');
                    row.className = 'modal-participant-row';
                    row.innerHTML = `
                        <span>${p}</span>
                        <div class="quantity-selector">
                            <button type="button" class="quantity-btn minus-btn">-</button>
                            <input type="number" class="quantity-input modal-quantity-input" value="0" min="0" data-person="${p}" readonly>
                            <button type="button" class="quantity-btn plus-btn">+</button>
                        </div>
                    `;
                    modalParticipantsContainer.appendChild(row);
                });
                modal.style.display = 'flex';
            }
        });

        modal.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('quantity-btn')) {
                const input = target.parentElement.querySelector('.quantity-input');
                let value = parseInt(input.value);
                const totalQuantity = parseInt(activeAssignmentRow.dataset.quantity);
                
                const allInputs = modal.querySelectorAll('.modal-quantity-input');
                let currentTotalAssigned = 0;
                allInputs.forEach(inp => currentTotalAssigned += parseInt(inp.value));

                if (target.classList.contains('plus-btn')) {
                    if (currentTotalAssigned < totalQuantity) value++;
                } else if (target.classList.contains('minus-btn')) {
                    value = Math.max(0, value - 1);
                }
                input.value = value;

                let newTotalAssigned = 0;
                allInputs.forEach(inp => newTotalAssigned += parseInt(inp.value));
                modalRemaining.textContent = totalQuantity - newTotalAssigned;
            }

            if (target.id === 'modal-cancel-btn' || target.classList.contains('modal-overlay')) {
                modal.style.display = 'none';
            }
            
            if (target.id === 'modal-save-btn') {
                const allInputs = modal.querySelectorAll('.modal-quantity-input');
                let totalAssigned = 0;
                const splitData = {};
                
                allInputs.forEach(input => {
                    const qty = parseInt(input.value);
                    if (qty > 0) {
                        splitData[input.dataset.person] = qty;
                        totalAssigned += qty;
                    }
                });

                if (totalAssigned > parseInt(activeAssignmentRow.dataset.quantity)) {
                    alert('Jumlah yang dibagi melebihi kuantitas yang ada!');
                    return;
                }
                
                activeAssignmentRow.dataset.split = JSON.stringify(splitData);
                modal.style.display = 'none';
            }
        });
    }

    // --- LOGIKA PERHITUNGAN UTAMA ---
    calculateBtn.addEventListener('click', () => {
        const personalItems = {};
        ALL_PARTICIPANTS.forEach(p => personalItems[p] = []);
        const sharedItems = [];
        document.querySelectorAll('.assignment-row').forEach(row => {
            const item = { name: row.dataset.name, price: parseFloat(row.dataset.price) };
            if (parseInt(row.dataset.quantity) > 1) {
                const splitData = JSON.parse(row.dataset.split || '{}');
                for (const [person, qty] of Object.entries(splitData)) {
                    for (let i = 0; i < qty; i++) {
                        if (person.toLowerCase() === 'bayar bersama') {
                            sharedItems.push(item);
                        } else {
                            personalItems[person].push(item);
                        }
                    }
                }
            } else {
                const selectedPerson = row.querySelector('.assign-select').value;
                if (selectedPerson === 'bersama') {
                    sharedItems.push(item);
                } else {
                    personalItems[selectedPerson].push(item);
                }
            }
        });
        const billPerPerson = {};
        const taxRate = taxCheckbox.checked ? 0.11 : 0;
        const totalSharedPrice = sharedItems.reduce((sum, item) => sum + item.price, 0);
        const sharedCostPerPerson = ALL_PARTICIPANTS.length > 0 ? totalSharedPrice / ALL_PARTICIPANTS.length : 0;
        ALL_PARTICIPANTS.forEach(person => {
            const personData = {
                personalItems: personalItems[person],
                personalItemsTotal: personalItems[person].reduce((sum, item) => sum + item.price, 0),
                sharedCost: sharedCostPerPerson,
                subtotal: 0, tax: 0, finalTotal: 0,
            };
            personData.subtotal = personData.personalItemsTotal + personData.sharedCost;
            personData.tax = personData.subtotal * taxRate;
            personData.finalTotal = personData.subtotal + personData.tax;
            billPerPerson[person] = personData;
        });

        const lokasiEl = document.querySelector('.info-display p:nth-child(1)');
        const bayarKeEl = document.querySelector('.info-display p:nth-child(2)');
        
        const lokasi = lokasiEl ? lokasiEl.textContent.replace('Lokasi: ', '').trim() : null;
        let infoPembayaran = null;
        if(bayarKeEl) {
            const bayarKeText = bayarKeEl.textContent.replace('Bayar ke: ', '').trim();
            const parts = bayarKeText.split(' - ');
            infoPembayaran = { detail: parts[0], nomor: parts[1] };
        }

        const resultContainer = document.getElementById('result-container');
        const resultDetails = document.getElementById('result-details');
        resultDetails.innerHTML = '';
        finalBillData = { billPerPerson, sharedItems, lokasi, infoPembayaran };
        let grandTotal = 0;
        for (const person of ALL_PARTICIPANTS) {
            const data = billPerPerson[person];
            const totalFormatted = Math.ceil(data.finalTotal).toLocaleString('id-ID');
            let personalItemsDetail = data.personalItems.map(item => `${item.name}: Rp ${item.price.toLocaleString('id-ID')}`).join(', ');
            let detailsHTML = `<div class="result-breakdown">`;
            if (personalItemsDetail) { detailsHTML += `<span>${personalItemsDetail}</span>`; }
            if (sharedCostPerPerson > 0) { detailsHTML += `<span>Biaya Bersama: Rp ${Math.ceil(data.sharedCost).toLocaleString('id-ID')}</span>`; }
            if (data.tax > 0) { detailsHTML += `<span>PPN: Rp ${Math.ceil(data.tax).toLocaleString('id-ID')}</span>`; }
            detailsHTML += `</div>`;
            let sharedItemsBreakdown = '';
            if (sharedItems.length > 0) {
                const sharedItemNames = sharedItems.map(item => `${item.name} (Rp ${item.price.toLocaleString('id-ID')})`).join(' + ');
                sharedItemsBreakdown = `<div class="shared-breakdown"><em>*Biaya Bersama: ${sharedItemNames} / ${ALL_PARTICIPANTS.length} Orang</em></div>`;
            }
            resultDetails.innerHTML += `<div class="person-result"><p><strong>${person}</strong> <span>Rp ${totalFormatted}</span></p>${detailsHTML}${sharedItemsBreakdown}</div>`;
            grandTotal += Math.ceil(data.finalTotal);
        }
        resultDetails.innerHTML += `<hr><p><strong>TOTAL KESELURUHAN</strong> <span>Rp ${grandTotal.toLocaleString('id-ID')}</span></p>`;
        resultContainer.style.display = 'block';
    });
    
    // --- LOGIKA BAGIKAN SEBAGAI PDF ---
    shareBtn.addEventListener('click', () => {
        if (!finalBillData || !finalBillData.billPerPerson) {
            alert("Silakan klik 'Hitung' terlebih dahulu.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'pt', 'a4');
        const margin = 40;
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        let yPosition = 0;

        const logoImg = document.querySelector('.app-logo');
        const canvas = document.createElement('canvas');
        canvas.width = logoImg.naturalWidth;
        canvas.height = logoImg.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(logoImg, 0, 0);
        const logoDataUrl = canvas.toDataURL('image/png');

        pdf.addImage(logoDataUrl, 'PNG', (pageWidth / 2) - 75, margin, 150, 0);
        yPosition = margin + 90;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(14);
        pdf.setTextColor(102, 102, 102);
        pdf.text('Split. Settle. Smile.', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 40;
        
        const now = new Date();
        const formattedDate = `${now.getDate()} ${now.toLocaleString('id-ID', { month: 'long' })} ${now.getFullYear()}`;
        const filenameDate = formattedDate;

        pdf.setFontSize(10);
        pdf.setTextColor(102, 102, 102);
        pdf.text(`Tanggal: ${formattedDate}`, margin, yPosition);
        yPosition += 15;
        if (finalBillData.lokasi) {
            pdf.text(`Lokasi: ${finalBillData.lokasi}`, margin, yPosition);
            yPosition += 15;
        }
        if (finalBillData.infoPembayaran && finalBillData.infoPembayaran.nomor) {
            const bayarKeText = `Bayar ke: ${finalBillData.infoPembayaran.detail} - ${finalBillData.infoPembayaran.nomor}`;
            pdf.text(bayarKeText, margin, yPosition);
            yPosition += 15;
        }
        yPosition += 10;
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 25;
        
        pdf.setTextColor(0, 0, 0);
        for (const person of ALL_PARTICIPANTS) {
            const data = finalBillData.billPerPerson?.[person];
            if (!data) continue;

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.text(person, margin, yPosition);
            pdf.text(`Rp ${Math.ceil(data.finalTotal).toLocaleString('id-ID')}`, pageWidth - margin, yPosition, { align: 'right' });
            yPosition += 18;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(9);
            pdf.setTextColor(100, 100, 100);

            let detailsText = [];
            if (data.personalItems.length > 0) {
                const personalItemsDetail = data.personalItems.map(item => item.name).join(', ');
                detailsText.push(`Pribadi (${personalItemsDetail}): Rp ${data.personalItemsTotal.toLocaleString('id-ID')}`);
            }
            if (data.sharedCost > 0) {
                detailsText.push(`Bersama: Rp ${Math.ceil(data.sharedCost).toLocaleString('id-ID')}`);
            }
            if (data.tax > 0) {
                detailsText.push(`PPN: Rp ${Math.ceil(data.tax).toLocaleString('id-ID')}`);
            }

            const detailLines = pdf.splitTextToSize(`(${detailsText.join(' + ')})`, pageWidth - (margin * 2) - 10);
            pdf.text(detailLines, margin + 5, yPosition);
            pdf.setTextColor(0, 0, 0);
            yPosition += (detailLines.length * 12) + 10;
        }
        
        yPosition -= 5;
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 25;

        const grandTotal = Object.values(finalBillData.billPerPerson || {}).reduce((sum, data) => sum + Math.ceil(data.finalTotal), 0);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TOTAL KESELURUHAN', margin, yPosition);
        pdf.text(`Rp ${grandTotal.toLocaleString('id-ID')}`, pageWidth - margin, yPosition, { align: 'right' });
        yPosition += 25;

        if (finalBillData.sharedItems && finalBillData.sharedItems.length > 0) {
            pdf.setFont('helvetica', 'italic');
            pdf.setFontSize(9);
            pdf.setTextColor(150, 150, 150);
            const sharedItemNames = finalBillData.sharedItems.map(item => `${item.name} (Rp ${item.price.toLocaleString('id-ID')})`).join(' + ');
            const sharedBreakdownText = `*Biaya Bersama: ${sharedItemNames} / ${ALL_PARTICIPANTS.length} Orang`;
            const sharedBreakdownLines = pdf.splitTextToSize(sharedBreakdownText, pageWidth - (margin * 2));
            pdf.text(sharedBreakdownLines, pageWidth / 2, yPosition, { align: 'center' });
        }

        const footerY = pageHeight - 40;
        pdf.setFontSize(9);
        pdf.setTextColor(150, 150, 150);
        pdf.text('Made by Zakikey', pageWidth / 2, footerY, { align: 'center' });
        pdf.text('© 2025. All Rights Reserved.', pageWidth / 2, footerY + 12, { align: 'center' });

        pdf.save(`Seplit Bills ${filenameDate}.pdf`);
    });
});
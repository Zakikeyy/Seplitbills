// api/static/input.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Pembayaran ---
    const paymentMethod = document.getElementById('paymentMethod');
    const bankDetails = document.getElementById('bankDetails');
    const ewalletDetails = document.getElementById('ewalletDetails');

    paymentMethod.addEventListener('change', () => {
        bankDetails.style.display = (paymentMethod.value === 'Bank') ? 'block' : 'none';
        ewalletDetails.style.display = (paymentMethod.value === 'Dompet Digital') ? 'block' : 'none';
    });

    // --- Item & Kuantitas ---
    const itemsContainer = document.getElementById('items-container');

    function createItemRow() {
        const newRow = document.createElement('div');
        newRow.className = 'item-row';
        newRow.innerHTML = `
            <input type="text" name="nama_item" class="input-field item-name" placeholder="Nama Item" required>
            <input type="number" name="harga_item" class="input-field item-price" placeholder="Harga Satuan" required>
            <div class="quantity-selector">
                <button type="button" class="quantity-btn minus-btn">-</button>
                <input type="number" name="kuantitas_item" class="quantity-input" value="1" min="1" readonly>
                <button type="button" class="quantity-btn plus-btn">+</button>
            </div>
            <button type="button" class="btn-delete item-delete-btn">×</button>
        `;
        itemsContainer.appendChild(newRow);
    }

    document.getElementById('addItemBtn').addEventListener('click', createItemRow);

    itemsContainer.addEventListener('click', (e) => {
        const target = e.target;
        // Tombol Hapus
        if (target.classList.contains('item-delete-btn')) {
            target.parentElement.remove();
        }
        // Tombol Kuantitas
        if (target.classList.contains('quantity-btn')) {
            const row = target.closest('.item-row');
            const input = row.querySelector('.quantity-input');
            let value = parseInt(input.value);
            if (target.classList.contains('plus-btn')) {
                value++;
            } else if (target.classList.contains('minus-btn')) {
                value = Math.max(1, value - 1);
            }
            input.value = value;
        }
    });

    // --- Peserta ---
    const participantsList = document.getElementById('participants-list');
    const hiddenParticipantsContainer = document.getElementById('hidden-participants');
    const participants = new Set();
    
    document.getElementById('addParticipantBtn').addEventListener('click', () => {
        const participantNameInput = document.getElementById('participantNameInput');
        const name = participantNameInput.value.trim();
        
        if (name && !participants.has(name)) {
            participants.add(name);
            
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.dataset.name = name;
            tag.innerHTML = `${name} <span class="tag-delete-btn" data-name="${name}">×</span>`;
            participantsList.appendChild(tag);
            
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'peserta';
            hiddenInput.value = name;
            hiddenParticipantsContainer.appendChild(hiddenInput);

            participantNameInput.value = '';
        }
    });

    participantsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag-delete-btn')) {
            const nameToRemove = e.target.dataset.name;
            participants.delete(nameToRemove);
            const hiddenInputToRemove = hiddenParticipantsContainer.querySelector(`input[value="${nameToRemove}"]`);
            if (hiddenInputToRemove) {
                hiddenInputToRemove.remove();
            }
            e.target.parentElement.remove();
        }
    });
});
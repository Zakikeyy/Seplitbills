# api/index.py

import os
from flask import Flask, render_template, request

# Dapatkan path direktori di mana file ini (index.py) berada
base_dir = os.path.dirname(os.path.abspath(__file__))

# Tentukan path ke folder templates dan static relatif terhadap base_dir
template_folder = os.path.join(base_dir, 'templates')
static_folder = os.path.join(base_dir, 'static')

# Inisialisasi Flask dengan path yang sudah eksplisit
app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)


@app.route('/')
def halaman_input():
    return render_template('input_data.html')

@app.route('/proses', methods=['POST'])
def proses_data():
    # Ambil data opsional
    lokasi = request.form.get('lokasi')
    metode_pembayaran = request.form.get('metode_pembayaran')
    bank = request.form.get('bank')
    nomor_rekening = request.form.get('nomor_rekening')
    dompet_digital = request.form.get('dompet_digital')
    nomor_telepon = request.form.get('nomor_telepon')
    
    info_pembayaran = {
        "metode": metode_pembayaran,
        "bank": bank,
        "rekening": nomor_rekening,
        "dompet": dompet_digital,
        "telepon": nomor_telepon
    }

    # Ambil data item dengan kuantitas
    nama_items = request.form.getlist('nama_item')
    harga_items = request.form.getlist('harga_item')
    kuantitas_items = request.form.getlist('kuantitas_item')
    
    peserta = request.form.getlist('peserta')

    items = []
    # Loop dengan cara yang lebih aman
    for i in range(len(nama_items)):
        # Periksa apakah semua data untuk baris ini ada dan tidak kosong
        if nama_items[i] and harga_items[i] and kuantitas_items[i]:
            try:
                # Coba konversi ke angka, jika gagal, lewati baris ini
                harga = int(harga_items[i])
                kuantitas = int(kuantitas_items[i])
                
                items.append({
                    'nama': nama_items[i],
                    'harga_satuan': harga,
                    'kuantitas': kuantitas
                })
            except ValueError:
                # Ini akan menangani error jika harga/kuantitas bukan angka
                # dan diam-diam melewati baris yang bermasalah.
                continue
            
    return render_template(
        'hasil.html', 
        items=items, 
        peserta=peserta,
        lokasi=lokasi,
        info_pembayaran=info_pembayaran
    )

# Baris ini tidak diperlukan oleh Vercel, tapi tidak apa-apa jika ada
if __name__ == '__main__':
    app.run(debug=True)
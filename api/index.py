# api/index.py
import os
from flask import Flask, render_template, request

# Dapatkan path direktori di mana file ini (index.py) berada
base_dir = os.path.dirname(os.path.abspath(__file__))

# Tentukan path ke folder templates dan static relatif terhadap base_dir
# KITA PERLU NAIK SATU LEVEL dari /api ke folder utama proyek
project_root = os.path.dirname(base_dir)
template_folder = os.path.join(project_root, 'templates')
static_folder = os.path.join(project_root, 'static')

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
    for i in range(len(nama_items)):
        if nama_items[i] and harga_items[i] and kuantitas_items[i]:
            items.append({
                'nama': nama_items[i],
                'harga_satuan': int(harga_items[i]),
                'kuantitas': int(kuantitas_items[i])
            })
            
    return render_template(
        'hasil.html', 
        items=items, 
        peserta=peserta,
        lokasi=lokasi,
        info_pembayaran=info_pembayaran
    )
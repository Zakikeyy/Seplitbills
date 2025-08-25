# app.py

from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def halaman_input():
    """Menampilkan halaman utama untuk input data."""
    return render_template('input_data.html')

@app.route('/proses', methods=['POST'])
def proses_data():
    """
    Menerima data dari form input dan menampilkannya di halaman pembagian.
    """
    # Ambil data opsional
    lokasi = request.form.get('lokasi')
    metode_pembayaran = request.form.get('metode_pembayaran')
    bank = request.form.get('bank')
    nomor_rekening = request.form.get('nomor_rekening')
    dompet_digital = request.form.get('dompet_digital')
    nomor_telepon = request.form.get('nomor_telepon')
    
    # Buat dictionary untuk info pembayaran
    info_pembayaran = {
        "metode": metode_pembayaran,
        "bank": bank,
        "rekening": nomor_rekening,
        "dompet": dompet_digital,
        "telepon": nomor_telepon
    }

    # Ambil data item (sekarang dengan kuantitas)
    nama_items = request.form.getlist('nama_item')
    harga_items = request.form.getlist('harga_item')
    kuantitas_items = request.form.getlist('kuantitas_item')
    
    peserta = request.form.getlist('peserta')

    # Gabungkan data item
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

if __name__ == '__main__':
    app.run(debug=True)
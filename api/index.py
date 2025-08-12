# api/index.py

from flask import Flask, render_template, request

# Inisialisasi Flask kembali ke bentuk sederhana
app = Flask(__name__)

@app.route('/')
def halaman_input():
    return render_template('input_data.html')

@app.route('/proses', methods=['POST'])
def proses_data():
    nama_items = request.form.getlist('nama_item')
    harga_items = request.form.getlist('harga_item')
    peserta = request.form.getlist('peserta')

    items = []
    for i in range(len(nama_items)):
        if nama_items[i] and harga_items[i]:
            items.append({
                'nama': nama_items[i],
                'harga': int(harga_items[i])
            })
            
    return render_template('hasil.html', items=items, peserta=peserta)
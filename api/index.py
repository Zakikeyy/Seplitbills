# api/index.py
import os
from flask import Flask, render_template, request

# Tentukan path absolut ke direktori proyek
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
template_folder = os.path.join(project_root, 'templates')
static_folder = os.path.join(project_root, 'static')

app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)


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
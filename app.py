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

if __name__ == '__main__':
    app.run(debug=True)
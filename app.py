from flask import Flask, send_from_directory, render_template
app = Flask(__name__)

@app.route("/")
def index():
    return send_from_directory("templates", "index.html")

@app.route("/vtc.html")
def vtc():
    return render_template("vtc.html")
@app.route("/restaurant.html")
def restaurant():
    return render_template("restaurant.html")
@app.route("/barbershop.html")
def barbershop():
    return render_template("barbershop.html")
@app.route("/delivery.html")
def delivery():
    return render_template("delivery.html")

#@app.route("/uploads/<path:filename>")
#def uploads(filename):
#    return send_from_directory("static/uploads", filename)

if __name__ == "__main__":
    app.run(debug=True,port=11000,host="0.0.0.0")
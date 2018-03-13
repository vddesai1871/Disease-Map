import sqlite3
from flask import Flask, jsonify, render_template, request
from flask_jsglue import JSGlue



# configure application
app = Flask(__name__)
JSGlue(app)


# ensure responses aren't cached
if app.config["DEBUG"]:
    @app.after_request
    def after_request(response):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Expires"] = 0
        response.headers["Pragma"] = "no-cache"
        return response


def create_connection(db_file):
    """ create a database connection to the SQLite database
        specified by the db_file
    :param db_file: database file
    :return: Connection object or None
    """
    try:
        con = sqlite3.connect(db_file, check_same_thread=False)
        return con
    except sqlite3.Error as e:
        print(e)

    return None


conn = create_connection("geo.db")


@app.route("/")
def index():
    """Render map."""

    return render_template("index.html", key="AIzaSyACDm3wWsEcuITsCs9kqNrE2bQ-J7a0Bvs")


@app.route("/update")
def update():
    """Updates data"""

    # ensure parameters are present
    if not request.args.get("district"):
        raise RuntimeError("missing district")
    if not request.args.get("taluka"):
        raise RuntimeError("missing taluka")
    if not request.args.get("disease"):
        raise RuntimeError("missing disease")
    if not request.args.get("month"):
        raise RuntimeError("missing month")

    whitelist = ['malaria', 'dengue', 'typhoid', 'cholera', 'hepatitis']
    months = ['november', 'december']
    district = request.args.get("district")
    taluka = request.args.get("taluka")
    disease = request.args.get("disease")
    month = request.args.get("month")

    if disease not in whitelist:
        disease = 'malaria'

    if month not in months:
        month = 'november'


    if taluka != "none":
        # if distict parameter is not given
        cur = conn.cursor()
        if ' ' in taluka:
            t,x = taluka.split(' ')
            taluka = t.capitalize() + ' ' + x.capitalize()
        else:
            taluka = taluka.capitalize()
        cur.execute("SELECT " + disease +" FROM "+ month +"\
            WHERE taluka=?",(taluka,))
        rows = cur.fetchall()
        rows.append(disease)
        cur.close()

    else:
        # If district parameter is given
        district = district.capitalize()
        cur = conn.cursor()
        # ATTENTION : This is the worst SQL query you'll see in you life
        cur.execute("SELECT sum("+disease+") FROM "+month+" WHERE district=?",(district, ))
        rows = cur.fetchall()
        rows.append(disease)
        cur.close()

    return jsonify(rows)
    # output places as JSON
    #return jsonify(rows.json())

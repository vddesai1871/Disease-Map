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


conn = create_connection("Book2.db")


@app.route("/")
def index():
    """Render map."""

    return render_template("index.html", key="AIzaSyACDm3wWsEcuITsCs9kqNrE2bQ-J7a0Bvs")


# @app.route("/update")
# def update():
#     """Updates data"""
#
#     # ensure parameters are present
#     if not request.args.get("district"):
#         raise RuntimeError("missing district")
#     if not request.args.get("taluka"):
#         raise RuntimeError("missing taluka")
#     if not request.args.get("disease"):
#         raise RuntimeError("missing disease")
#     if not request.args.get("month"):
#         raise RuntimeError("missing month")
#
#     whitelist = ['malaria', 'dengue', 'typhoid', 'cholera', 'hepatitis']
#     months = ['november', 'december']
#     district = request.args.get("district")
#     taluka = request.args.get("taluka")
#     disease = request.args.get("disease")
#     month = request.args.get("month")
#
#     if disease not in whitelist:
#         disease = 'malaria'
#
#     if month not in months:
#         month = 'november'
#
#
#     if taluka != "none":
#         # if distict parameter is not given
#         cur = conn.cursor()
#         if ' ' in taluka:
#             t,x = taluka.split(' ')
#             taluka = t.capitalize() + ' ' + x.capitalize()
#         else:
#             taluka = taluka.capitalize()
#         cur.execute("SELECT " + disease +" FROM "+ month +"\
#             WHERE taluka=?",(taluka,))
#         rows = cur.fetchall()
#         rows.append(disease)
#         cur.close()
#
#     else:
#         # If district parameter is given
#         district = district.capitalize()
#         cur = conn.cursor()
#         # ATTENTION : This is the worst SQL query you'll see in you life
#         cur.execute("SELECT sum("+disease+") FROM "+month+" WHERE district=?",(district, ))
#         rows = cur.fetchall()
#         rows.append(disease)
#         cur.close()
#
#     return jsonify(rows)
#     # output places as JSON
#     #return jsonify(rows.json())

@app.route("/update")
def update():
    """Updates data"""

    # ensure parameters are present
    if not request.args.get("disease"):
        raise RuntimeError("missing disease")
    if not request.args.get("month"):
        raise RuntimeError("missing month")
    if not request.args.get("week"):
        raise RuntimeError("missing week")
    if not request.args.get("district"):
        raise RuntimeError("missing district")
    if not request.args.get("taluka"):
        raise RuntimeError("missing taluka")
    if not request.args.get("age"):
        raise RuntimeError("missing age")


    whitelist = ['malaria', 'dengue', 'typhoid', 'cholera', 'hepatitis']
    months = ['8','9']
    disease = request.args.get("disease")
    month = request.args.get("month")
    week = request.args.get("week")
    district = request.args.get("district")
    taluka = request.args.get("taluka")
    age = request.args.get("age")

    if disease not in whitelist:
        disease = 'malaria'

    if month not in months:
        month = '8'

    cur = conn.cursor()
    if age == "all":
        cur = conn.cursor()
        cur.execute("SELECT * FROM Sheet1 WHERE taluka=? AND week=? AND month=?",(taluka,week,month,))
        rows = cur.fetchall()
        list = []
        for i in rows[0]:
            list.append(i)
        list[7] = float(list[7])
        list.append(round(list[3]*100/list[7],3))
        cur.close()
    else:
        cur = conn.cursor()
        if age == "age55%2B":
            age == "age55+"
        cur.execute("SELECT taluka, temperature, rain, noofcase, humidity, population, sealevel,"+ age +" ,msex,fsex FROM Sheet1 WHERE taluka=? AND week=? AND month=?", (taluka, week, month))
        rows = cur.fetchall()
        list = []
        for i in rows[0]:
            list.append(i)
        list[5] = float(list[5])
        list.append(round(list[3]*100/list[5],3))
        cur.close()

    return jsonify(list)

@app.route("/sum")
def sum():
    """Updates data"""

    # ensure parameters are present
    if not request.args.get("disease"):
        raise RuntimeError("missing disease")
    if not request.args.get("district"):
        raise RuntimeError("missing district")
    if not request.args.get("taluka"):
        raise RuntimeError("missing taluka")


    whitelist = ['malaria', 'dengue', 'typhoid', 'cholera', 'hepatitis']
    months = ['8','9']
    disease = request.args.get("disease")
    month = request.args.get("month")
    taluka = request.args.get("taluka")

    if disease not in whitelist:
        disease = 'malaria'

    aug = []
    sep = []
    for week in ['1','2','3','4']:
        cur = conn.cursor()
        cur.execute("SELECT noofcase FROM Sheet1 WHERE taluka=? AND week=? AND month=8", (taluka, week,))
        rows = cur.fetchall()
        tmp = rows[0][0]
        aug.append(tmp)
        cur.close()

    for week in ['1','2','3','4']:
        cur = conn.cursor()
        cur.execute("SELECT noofcase FROM Sheet1 WHERE taluka=? AND week=? AND month=9", (taluka, week,))
        rows = cur.fetchall()
        tmp = rows[0][0]
        sep.append(tmp)
        cur.close()
    print(aug)
    print(sep)
    l = []
    l.append(aug)
    l.append(sep)
    return jsonify(l)


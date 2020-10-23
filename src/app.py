"""
    Developed by: Giorgi Rakviashvili
"""

from flask import Flask, send_from_directory, render_template, redirect, request, url_for, session
from flask_caching import Cache
from flask_sqlalchemy import SQLAlchemy

from flask_socketio import SocketIO

import os
from datetime import datetime
from alphabet_detector import AlphabetDetector

import pymongo

# from shared.db import db
# from models import User, Message

port = 5000
current  = f"{os.getcwd()}\\"
DATABASE = f"{current}sql\\database.db"  # database = f"{current}api\\00users.json"

categories = ["welcome", "announcements", "rules", "whoami", "general", "ლინუქსი", "მეცნიერება", "კრიპტოგრაფია",
              "coding-challenges", "movies-n-books", "hacking-penetration-forensics-ctf", "multiplayer-games",
              "good-stuff", "tldr", "memes", "python", "c-cpp", "java", "front-end", "database-languages", "el-general",
              "radio-circuits", "bot-spam", "music", "git", "github-notifs", "root"]

config = {
    "DEBUG": True,          # some Flask specific configs
    "CACHE_TYPE": "simple", # Flask-Caching related configs
    "CACHE_DEFAULT_TIMEOUT": 300
}

TEMPLATES_DIR = os.path.abspath("templates")
STATIC_DIR    = os.path.abspath("static")  # print(TEMPLATES_DIR, "\n", STATIC_DIR)

cache = Cache(config={'CACHE_TYPE': 'simple'})

app = Flask(__name__, template_folder=TEMPLATES_DIR, static_folder=STATIC_DIR)
app.config.from_mapping(config)
app.config["SECRET_KEY"]              = "$fdvnjDFE&*)EEDN@d.0("

cache.init_app(app, config={'CACHE_TYPE': 'simple'})

clients, clients_w  = [], {}  # [ips, num_of_connections]
socketio = SocketIO(app)

ad = AlphabetDetector()
status = {}

app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DATABASE}"
db = SQLAlchemy(app)


class User(db.Model):
    id       = db.Column(db.Integer,    primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    password = db.Column(db.String(15), nullable=False)
    ip       = db.Column(db.String(40), nullable=False)
    remember = db.Column(db.Integer,    nullable=False, default=0)
    # status = db.Column(db.Integer,    nullable=False, default=0)
    role     = db.Column(db.String(10), nullable=False, default="nobody")

    messages = db.relationship("Message", backref="author", lazy=True)
    # user1 = User("kommando", "123", "", "admin")

    def __repr__(self):
        return f"User('{self.username}', '{self.ip}', '{self.role}')"

    def __init__(self, username, password, ip="", role="nobody", remember=0):  # status=0, xp=0
        self.username = username
        self.password = password
        self.ip       = ip
        self.role     = role
        self.remember = remember


class Message(db.Model):
    # post = Message(category="General", username="kommando", message="none", user_id=User.query.get(1).id)
    id       = db.Column(db.Integer,    primary_key=True)
    category = db.Column(db.Text,       nullable=False)
    username = db.Column(db.String(15), nullable=False)
    message  = db.Column(db.Text,       nullable=False)
    date     = db.Column(db.Text,       nullable=False, default=datetime.now().strftime('%m-%d %H:%M'))  # db.Date
    # "{:%d-%b-%Y %H:%M}".format(datetime.now())
    user_id  = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f"Message('{self.username}', '{self.date}', '{self.category}', '{self.message}')"

    def __init__(self, category, username, message, user_id):
        self.category = category
        self.username = username
        self.message  = message
        # self.date   = date
        self.user_id  = user_id


@app.route("/home/", methods=["POST", "GET"])
@app.route("/", methods=["POST", "GET"])
def index():
    # Todo: check user
    ip_address = request.remote_addr
    session["ip_address"] = ip_address
    if not remember(ip_address):
        return redirect("/login/")

    # Todo: final page
    else:
        return redirect("/general/")


@app.route("/submit/", methods=["POST", "GET"])
def submit():
    if request.method == "POST":
        username, password = request.form["username0"], request.form["password0"]
        return login_to(username=username, password=password)
    else:
        return redirect("/login/")


def login_to(username, password, sign=False):
    """"
    if "ip_address" in session:
        ip_address = session["ip_address"]
    else:
        ip_address = request.remote_addr
    """

    ip_address = request.remote_addr

    for user in User.query.all():
        if user.ip == ip_address:
            user.ip = ""
        if user.username == username and user.password == password:
            user.ip, user.remember = ip_address, 1
            db.session.commit()
            if sign:
                socketio.emit('redirect', {'url': f'http://127.0.0.1:{port}/general/'})  # {'url': url_for('general')})
            else:
                return redirect("/general/")
    return "try again - 000"


@app.route("/<category>/", methods=["POST", "GET"])
# @cache.cached(category=50, key_prefix="all_categories")
def find_page(category):
    if category in categories:
        # Todo: get user name
        if "ip_address" in session:
            ip_address = session["ip_address"]
        else:
            ip_address = request.remote_addr

        username = User.query.filter_by(ip=ip_address).first().username
        session["username"], session["category"] = username, category

        ips = [user.ip for user in User.query.all()]
        ip_address = request.remote_addr

        if ip_address in ips and remember(ip_address):
            mm = Message.query.filter_by(category=category)

            if ad.only_alphabet_chars(category, "Latin"):
                category = category.capitalize()

            return render_template("index.html", user_name=username, title=category.encode("utf-8"), messages=mm)
        # num_of_users=num_of_users,
        # num_of_offliners=len(offliners),
        # online=online,
        # offline=offliners,
        else:
            return redirect("/login/")  # f"<h1>fuck u bitch...\nlick my \"{category}\" ass<h2>"
    else:
        # Todo: error page
        return f"<h1>404 - Page \"{category}\" not found<h2>"


@app.route("/login/", methods=["POST", "GET"])
@cache.cached(timeout=50, key_prefix="all_categories")
def log_in():
    return render_template("login.html")


@app.route("/log_out/", methods=["POST", "GET"])
def log_out():
    exit_user()

    session.pop("user", None)
    return redirect("/login/")


def exit_user():
    ip_address = session["ip_address"]

    User.query.filter_by(ip=ip_address).first().remember = 0
    status[ip_address] = False  # User.query.filter_by(ip=ip_address).first().status = 0
    db.session.commit()
    clients_w[ip_address] = 0


@app.route("/signup/", methods=["POST", "GET"])
def sign_up():
    try:
        exit_user()
    except:  # [NameError, AttributeError]
        pass

    return render_template("sign-up.html")


@socketio.on("siggnn")
def sign_uppp(json, methods=["POST", "GET"]):
    print(json)

    username, password = json["user_name"], json["password"]
    if username not in [user.username for user in User.query.all()]:
        print("fuck")
        register(username=username, password=password)

        return login_to(username=username, password=password, sign=True)
    else:
        print("not fuck")
        socketio.emit("nt_available", json)


@app.route("/admin/", methods=["POST", "GET"])
def admin():
    return ""


#@app.route('/favicon.ico')
#def favicon():
#    return send_from_directory(os.path.join(app.root_path, "static"),
#                               "favicon.ico", mimetype="image/vnd.microsoft.icon")


def remember(ip: str, name=None) -> bool:
    if name:
        pass
    else:
        try:
            if User.query.filter_by(ip=ip).first().remember == 1:
                return True
        except AttributeError:
            return False


def register(username, password):
    new_user = User(username, password)
    db.session.add(new_user)
    db.session.commit()


@socketio.on("joined")
def handle_my_custom_event(json, methods=["POST", "GET"]):
    ip = session.get("ip_address")

    status[ip] = True
    clients.append((ip, request.sid))

    if ip in clients_w:
        clients_w[ip] += 1
    else:
        clients_w[ip] = 1

    socketio.emit("connect/disconnect", load_users(), room=request.sid)
    print(f"received my event \"{ip}\": {str(json)}")  # {'user_name': 'kommando', 'data': 'User Connected'}


@socketio.on("disconnect")
def diconnect_user():
    ip = session.get("ip_address")
    print(f"user disconnected {ip}\n {clients_w}")

    clients_w[ip] -= 1
    if clients_w == 0:
        status[ip] = False

    send_all("connect/disconnect", load_users())


@socketio.on("voice")
def voice_chat(json, methods=["POST", "GET"]):
    """
    this is not functionable at the moment
    :param json:
    :param methods:
    :return:
    """
    cat = json["category"]
    print(cat)
    if cat in v_cat:
        socketio.emit("", json)


def load_users():
    admins, moderators, others, offliners = [], [], [], []

    for i in User.query.all():
        if not status[i.ip]:
            offliners.append(i.username)
            continue

        if i.role == "admin":
            admins.append(i.username)
        elif i.role == "moderator":
            moderators.append(i.username)
        else:
            others.append(i.username)

    num_of_users = [len(admins), len(moderators), len(others), len(offliners)]
    data = {"admins": admins, "moderators": moderators, "online": others, "offline": offliners, "num_of_users": num_of_users}
    return data


@socketio.on("message")
def handle_incoming_messages(json, methods=["POST", "GET"]):
    json = json
    print(f"received my event: {json}")
    json["category"] = json["category"][2:].lower()
    save_message(json)  # {'user_name': 'kommando', 'category': '# General', 'message': 'sex'}


def send_all(first, json):  # category, json-message
    global clients
    clients = list(set(clients))
    for client in clients:  # if client[0]["user_name"] != user:
        socketio.emit(first, json, room=client[1])


def save_message(json):
    usr = json["user_name"]
    new_message = Message(category=json["category"],
                          username=usr,
                          message=json["message"],
                          user_id=User.query.filter_by(username=usr).first().id)
    # "{:%d-%b-%Y %H:%M}".format(datetime.now())
    db.session.add(new_message)
    try:
        db.session.commit()
    except Exception as e:
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print(e)
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        db.session.rollback()

    json["date"] = "{:%d-%b-%Y %H:%M}".format(datetime.now())
    send_all('m_s_o', json)


def init_db():
    db.drop_all()
    db.create_all()
    db.session.commit()


def db_sqlite():
    global db

    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DATABASE}"
    db = SQLAlchemy(app)


def db_mongo():
    link = input("db address: ")

    try:
        my_client = pymongo.MongoClient(link)
        my_client.server_info()

        my_db = my_client["discord"]
        users = my_db["users"]
        messages = my_db["messages"]
    except pymongo.errors.DuplicateKeyError:
        db_mongo()


def db_choose():
    info = '''
    [m]ongoDB
    [S]QLite
    Choose your db (m or s): 
    '''

    db = "s"  # input(info).strip().lower()

    if db == "m":
        db_mongo()
    elif db == "s":
        init_db()  # comment out for a testing mode

        db_sqlite()
    else:
        db_choose()


def main():
    # db_choose()  # choose a db type

    socketio.run(app, debug=True)  # app.run(debug=True)  # debug=True, host="169.254.110.104", port=5010


if __name__ == "__main__":
    main()

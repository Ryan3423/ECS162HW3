from flask import Flask, redirect, url_for, session,send_from_directory,jsonify,render_template
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from authlib.common.security import generate_token
import os
import requests
from pymongo import MongoClient

static_path = os.getenv('STATIC_PATH','static')
template_path = os.getenv('TEMPLATE_PATH','templates')

# Mongo connection
mongo_uri = os.getenv("MONGO_URI")
mongo = MongoClient(mongo_uri)
db = mongo['mydatabase']
collection = db['articles']

# app = Flask(__name__)
app = Flask(__name__, static_folder=static_path, template_folder=template_path)
CORS(app)
app.secret_key = os.urandom(24)


oauth = OAuth(app)

nonce = generate_token()


oauth.register(
    name=os.getenv('OIDC_CLIENT_NAME'),
    client_id=os.getenv('OIDC_CLIENT_ID'),
    client_secret=os.getenv('OIDC_CLIENT_SECRET'),
    #server_metadata_url='http://dex:5556/.well-known/openid-configuration',
    authorization_endpoint="http://localhost:5556/auth",
    token_endpoint="http://dex:5556/token",
    jwks_uri="http://dex:5556/keys",
    userinfo_endpoint="http://dex:5556/userinfo",
    device_authorization_endpoint="http://dex:5556/device/code",
    client_kwargs={'scope': 'openid email profile'}
)


# Create route for NYT API and add them into data base
@app.route('/NYT/api')
def get_nytapi():
    NYtimes = 'https://api.nytimes.com/svc/search/v2/articlesearch.json'
    filter = '?q=("Sacramento", "Davis") AND fq=timesTag.location:"California"&'
    apiKey = os.getenv('NYT_API_KEY')
    article_URL = NYtimes + filter + 'api-key=' + apiKey
    
    response = requests.get(article_URL)
    if response:
        data = response.json()

        # add articles to database
        articles = data["response"]["docs"]
        for article in articles:
            if not collection.find_one({"title": article["headline"]["main"]}):
                collection.insert_one({
                    "title": article["headline"]["main"],
                    "comments": []
            })
        return jsonify(data)
    else:
        raise Exception(f"Error: {response.status_code}")
    
@app.route('/')
@app.route('/<path:path>')
def serve_frontend(path=''):
    if path != '' and os.path.exists(os.path.join(static_path,path)):
        return send_from_directory(static_path, path)
    return send_from_directory(template_path, 'index.html')

@app.route('/getUser')
def get_user():
    user = session.get('user')
    if user:
        return jsonify({'login': True, 'user': user})
    return jsonify({"login": False, "user": user})
# @app.route('/')
# def home():
#     user = session.get('user')
#     if user:
#         return f"<h2>Logged in as {user['email']}</h2><a href='/logout'>Logout</a>"
#     return '<a href="/login">Login with Dex</a>'

@app.route('/login')
def login():
    session['nonce'] = nonce
    redirect_uri = 'http://localhost:8000/authorize'
    return oauth.flask_app.authorize_redirect(redirect_uri, nonce=nonce)

@app.route('/authorize')
def authorize():
    token = oauth.flask_app.authorize_access_token()
    nonce = session.get('nonce')

    user_info = oauth.flask_app.parse_id_token(token, nonce=nonce)  # or use .get('userinfo').json()
    session['user'] = user_info
    return redirect('/')

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

@app.route("/test-mongo")
def test_mongo():
    return jsonify({"collections": db.list_collection_names()})

# if __name__ == '__main__':
#     app.run(debug=True, host='0.0.0.0', port=8000)
if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8000)),debug=debug_mode)

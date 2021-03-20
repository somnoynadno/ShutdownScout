import json
from flask import Flask, jsonify, request
import threading
from CountryTopSites_model import CountryTopSites
from flask_cors import CORS, cross_origin

app = Flask(__name__)
db_changing_lock = threading.Lock()


def init_db():
    with open('init_db/web_pool.json', "r") as f:
        top_sites_dict = json.load(f)
    for country in top_sites_dict:
        cts = CountryTopSites(country, top_sites_dict[country])
        cts.save_to_db()

@app.route('/api/web_pool')
@cross_origin()
def get_countries_top_sites():
    cts_list = CountryTopSites.get_all_records()
    ans = {}
    for cts in cts_list:
        ans[cts.country_name] = cts.sites_list
    return jsonify(ans)

@app.route('/api/ip_lookup')
@cross_origin()
def ip_lookup():
    ip = request.remote_addr
    url = f"https://ipapi.co/{ip}/json/"
    ans = requests.get(url).json()
    return jsonify(ans)

if __name__ == "__main__":
    init_db()
    app.run(port=3113, host='0.0.0.0')

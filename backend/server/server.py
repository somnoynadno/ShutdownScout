import json
from flask import Flask, jsonify, request
import threading
import requests
from CountryTopSites_model import CountryTopSites
from PingRecord_model import PingRecord
from flask_cors import CORS, cross_origin
import datetime
from collections import defaultdict

app = Flask(__name__)
db_changing_lock = threading.Lock()

def lookup(ip):
    url = f"https://ipapi.co/{ip}/json/"
    ans = requests.get(url).json()
    return ans

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
    ip = request.headers.get('X-Real-IP')
    ans = lookup(ip)
    return jsonify(ans)

@app.route('/api/send_result', methods=["POST"])
@cross_origin()
def send_result():
    ts = datetime.datetime.now(datetime.timezone.utc)
    ip = request.headers.get('X-Real-IP')
    region = lookup(ip)["region"]
    results = request.get_json()
    for country in results:
        measure = results[country]
        r = PingRecord(ts, ip, region, country, measure["Ping"], measure["Availability"])
        r.save_to_db()
    return "ok", 200

@app.route('/api/last_results')
@cross_origin()
def select_records():
    print("hh")
    ip = request.args.get("ip")
    region = request.args.get("region")
    limit = request.args.get("limit")
    print(ip, region, limit)
    results_list = PingRecord.select_records(ip, region, limit)
    ans_dict = defaultdict(dict)
    for rec in results_list:
        ans_dict[rec.timestamp][rec.pinged_county] = {"Ping":rec.ping, "Availability":rec.availability}
    print(ans_dict)
    return jsonify(list(ans_dict.values()))

    
if __name__ == "__main__":
    init_db()
    app.run(port=3113, host='0.0.0.0')

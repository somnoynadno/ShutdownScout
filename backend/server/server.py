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
        if "IP" not in ans_dict[str(rec.timestamp)].keys():
            ans_dict[str(rec.timestamp)]["Results"]={}
            ans_dict[str(rec.timestamp)]["IP"] = rec.user_ip
            ans_dict[str(rec.timestamp)]["Region"] = rec.user_region
        ans_dict[str(rec.timestamp)]["Results"][rec.pinged_county] = {"Ping":rec.ping, "Availability":rec.availability}
    print(ans_dict)
    return jsonify(ans_dict)


'''
{ 
    "IP":'95.182.120.116',
    "Protocol":['http', 'https']
    "Port":7397
}
'''
@app.route("/api/proxy", methods=["POST"])
def test_proxy():
    inp = request.get_json()
    ip = inp["IP"]
    port = inp["Port"]
    proxies = {}
    for proto in inp["Protocol"]:
        proxies[proto] = f"{proto}://{ip}:{port}"
    region = lookup(ip)["region"]
    protocols = ';'.join(inp["Protocol"])
    ans = {"IP":ip, "Port":port, "Protocol":protocols, "Region":region, "Results":{}}
    country_top_sites_records = CountryTopSites.get_all_records()
    for rec in country_top_sites_records:
        availability=0
        ping = 0
        for site in rec.sites_list:
            ts = datetime.datetime.now()
            cur_av = ping_site(site, proxies)
            if cur_av == 1:
                availability += ping_site(site, proxies)
                time_delta = datetime.datetime.now() - ts
                ping += time_delta.total_seconds()*10**3
        country_av = availability // len(rec.sites_list)
        country_ping = ping // len(rec.sites_list)
        ans["Results"][rec.country_name] = {"Ping":country_ping, "Availability":country_av}
        print(ans["Results"][rec.country_name])
    return jsonify(ans)

def ping_site(url, proxy):
    try:
        resp = requests.get(f"http://{url}", proxies=proxy, timeout=1)
        if resp.ok:
            return 1
        return 0
#    except requests.exceptions.Timeout, ConnectionResetError, requests.exceptions.ConnectionError:
    except Exception:
        return 0
    #resp = requests.get(f"https://{url}", proxies=proxy)
    #if resp.ok:
    #    return 1
    return 0

if __name__ == "__main__":
    init_db()
    app.run(port=3113, host='0.0.0.0')

import json
from flask import Flask, jsonify, request
import threading
import requests
from CountryTopSites_model import CountryTopSites
from PingRecord_model import PingRecord
from flask_cors import cross_origin
import datetime
from collections import defaultdict
import subprocess
import random
import string
import socket
import tracert_util as tu
import proxy_parser as pp

app = Flask(__name__)
db_changing_lock = threading.Lock()


def generate_random_str(n=12):
    return ''.join(random.choices(string.ascii_letters, k=n))


def lookup(ip):
    url = f"https://ipapi.co/{ip}/json/"
    ans = requests.get(url).json()
    print(ans)
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
    ip = request.args.get("ip")
    if not ip:
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
            ans_dict[str(rec.timestamp)]["Results"] = {}
            ans_dict[str(rec.timestamp)]["IP"] = rec.user_ip
            ans_dict[str(rec.timestamp)]["Region"] = rec.user_region
        ans_dict[str(rec.timestamp)]["Results"][rec.pinged_county] = {"Ping": rec.ping,
                                                                      "Availability": rec.availability}
    print(ans_dict)
    return jsonify(ans_dict)


@app.route("/api/proxy", methods=["POST"])
@cross_origin()
def test_proxy():
    inp = request.get_json()
    ip = inp["IP"]
    port = inp["Port"]
    if "Timeout" in inp:
        timeout = inp["Timeout"]
    else:
        timeout = 120
    proxies = f"{ip}:{port}"
    # region = lookup(ip)["region"]
    # protocols = ';'.join(inp["Protocol"])
    # ans = {"IP":ip, "Port":port, "Protocol":protocols, "Region":region, "Results":{}}
    filename = f"{generate_random_str()}.json"
    p = subprocess.Popen(["python3", "ping_util.py", filename, f"{proxies}"])
    p.communicate(timeout=timeout)
    with open(filename) as f:
        return jsonify(json.load(f))


@app.route("/api/ping_from_local", methods=["POST"])
@cross_origin()
def ping_from_local():
    inp = request.get_json()
    if "Timeout" in inp:
        timeout = inp["Timeout"]
    else:
        timeout = 120
    filename = "ping.json"
    p = subprocess.Popen(["python3", "ping_util.py", filename])
    p.communicate(timeout=timeout)
    with open(filename) as f:
        return jsonify(json.load(f))


@app.route("/api/tracert", methods=["POST"])
@cross_origin()
def tracert():
    dest_name = request.get_json()["Address"]
    dest_addr = socket.gethostbyname(dest_name)
    icmp = socket.getprotobyname('icmp')
    udp = socket.getprotobyname('udp')
    ttl = 1
    shouldContinue = True
    ans = []
    while True:
        if (shouldContinue):
            IP, shouldContinue = tu.check_one_node(
                dest_name, ttl, dest_addr, icmp, udp)
            # ans.append(IP)
            ip_info = {}
            if IP:
                ip_info = requests.get(f"https://freegeoip.app/json/{IP}").json()
            ans.append({"IP": IP, "Info": ip_info})
            ttl += 1
        else:
            break
    return jsonify(ans)


@app.route("/api/get_proxy_list")
@cross_origin()
def get_proxy_list():
    html = pp.load()
    proxies = pp.parse(html)
    ans = []
    for p in proxies:
        if p.is_valid and p.protocol == "https":
            ans.append({"IP": p.ip, "Port": p.port, "Country": p.country, "Protocol": p.protocol})
    return jsonify(ans)


if __name__ == "__main__":
    init_db()
    app.run(port=3113, host='0.0.0.0')

import json
from flask import Flask, jsonify, request
import threading
import requests
from CountryTopSites_model import CountryTopSites
from PingRecord_model import PingRecord, ProxyPingRecord
from flask_cors import cross_origin
import datetime
from collections import defaultdict
import subprocess
import random
import string
import socket
import tracert_util as tu
import proxy_parser as pp

from database_controller import DatabaseClient


app = Flask(__name__)
db_changing_lock = threading.Lock()

DEFAULT_POOL_FILENAME = "init_db/speedtest_available_from_europe_https_small_united.json"
CACHED_PROXIES = None
CACHE_COUNTER = 0

def generate_random_str(n=12):
    return ''.join(random.choices(string.ascii_letters, k=n))


def lookup(ip):
    req = f"https://ipinfo.io/{ip}/json"
    with DatabaseClient() as dbc:
        res = dbc.get_lookup_res(ip)
        if res:
            return json.loads(res[1]) # lookup res
            print(f"lookup for {ip} was in cache")
        else:
            lookup_info = requests.get(req).json()
            dbc.save_lookup_res(ip, json.dumps(lookup_info), req)
            print(f"lookup for {ip} was requested")
        return lookup_info


def init_db():
    with open(DEFAULT_POOL_FILENAME, "r") as f:
        top_sites_dict = json.load(f)
    for country in top_sites_dict:
        cts = CountryTopSites(country, top_sites_dict[country])
        cts.save_to_db()

@app.route('/api/init_db', methods=["POST"])
@cross_origin()
def init_db_if_it_is_empty_or_force():
    cts_list = CountryTopSites.get_all_records()
    was_loaded_again = False
    if not cts_list or request.args.get("force"):
        init_db()
        was_loaded_again = True
    cts_list = CountryTopSites.get_all_records()
    return jsonify({"reinit": was_loaded_again, "current_count": len(cts_list)})


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


def save_ping_results(ts, ip, region, results_dict, provider, scan_type, duration):
    for country in results_dict:
        measure = results_dict[country]
        r = PingRecord(ts, ip, region, country, measure["Ping"], measure["Availability"], provider, scan_type, duration)
        r.save_to_db()



@app.route('/api/send_result', methods=["POST"])
@cross_origin()
def send_result():
    ip = request.args.get("ip")
    scan_type = request.args.get("type")
    duration = request.args.get("duration")
    if not ip:
        ip = request.headers.get('X-Real-IP')

    ts = datetime.datetime.now(datetime.timezone.utc)
    ip_lookup_res = lookup(ip)
    region = ip_lookup_res["region"]
    provider = ip_lookup_res["org"]
    results = request.get_json()
    save_ping_results(ts, ip, region, results, provider, scan_type, duration)
    return "ok", 200


@app.route('/api/last_results')
@cross_origin()
def select_records():
    print("hh")
    ip = request.args.get("ip")
    region = request.args.get("region")
    limit = request.args.get("limit")
    timestamp = request.args.get("timestamp")
    print(ip, region, limit)
    results_list = PingRecord.select_records(ip, region, limit, timestamp)
    ans_dict = defaultdict(dict)
    for rec in results_list:
        # if it is first rec for this IP - we fill it. else - just add results to dict
        if "IP" not in ans_dict[str(rec.timestamp)].keys():
            ans_dict[str(rec.timestamp)]["Results"] = {}
            ans_dict[str(rec.timestamp)]["IP"] = rec.user_ip
            ans_dict[str(rec.timestamp)]["Region"] = rec.user_region
        ans_dict[str(rec.timestamp)]["Results"][rec.pinged_county] = {"Ping": rec.ping,
                                                                      "Availability": rec.availability}
    print(ans_dict)
    return jsonify(ans_dict)


@app.route('/api/last_proxy_results')
@cross_origin()
def select_proxy_records():
    ip = request.args.get("ip")
    port = request.args.get("port")
    region = request.args.get("region")
    limit = request.args.get("limit")
    print(ip, region, limit)
    results_list = ProxyPingRecord.select_records(ip, port, region, limit)
    ans_dict = defaultdict(dict)
    for rec in results_list:
        if "IP" not in ans_dict[str(rec.timestamp)].keys():
            ans_dict[str(rec.timestamp)]["Results"] = {}
            ans_dict[str(rec.timestamp)]["IP"] = rec.proxy_ip
            ans_dict[str(rec.timestamp)]["Port"] = rec.proxy_port
            ans_dict[str(rec.timestamp)]["Region"] = rec.proxy_region
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
    should_save = True
    if "ShouldSave" in inp:
        should_save = inp["ShouldSave"] == 1

    inp_filename = DEFAULT_POOL_FILENAME
    # Very stange code... Need to fix it after
    sites_was_customized = "Sites" in inp
    if sites_was_customized:
        sites_dict = {site: [site] for site in inp["Sites"]}
        inp_filename = f"/tmp/{generate_random_str()}.json"
        with open(inp_filename, "w") as f:
            json.dump(sites_dict, f)
    if "Timeout" in inp:
        timeout = inp["Timeout"]
    else:
        timeout = 120
    proxies = f"{ip}:{port}"
    lookup_res = lookup(ip)
    region = lookup_res["country_name"]
    # protocols = ';'.join(inp["Protocol"])
    # ans = {"IP":ip, "Port":port, "Protocol":protocols, "Region":region, "Results":{}}
    output_filename = f"/tmp/{generate_random_str()}.json"
    p = subprocess.Popen(["python3", "ping_util.py", "-i", inp_filename, "-o", output_filename, "-p", f"{proxies}"])
    p.communicate(timeout=timeout)
    ts = datetime.datetime.now(datetime.timezone.utc)
    with open(output_filename) as f:
        proxy_ping_res = json.load(f)
        if not sites_was_customized and should_save:
            for country in proxy_ping_res:
                record = proxy_ping_res[country]
                r = ProxyPingRecord(ts, "https", ip, port, region, country, record["Ping"], record["Availability"])
                r.save_to_db()
        return jsonify(proxy_ping_res)


@app.route("/api/ping_from_local", methods=["POST"])
@cross_origin()
def ping_from_local():
    inp = request.get_json()
    inp_filename = DEFAULT_POOL_FILENAME
    if "Sites" in inp:
        sites_dict = {site: [site] for site in inp["Sites"]}
        inp_filename = f"/tmp/{generate_random_str()}.json"
        with open(inp_filename, "w") as f:
            json.dump(sites_dict, f)
    elif "Sites_dict" in inp:
        sites_dict = inp["Sites_dict"]
        inp_filename = f"/tmp/{generate_random_str()}.json"
        with open(inp_filename, "w") as f:
            json.dump(sites_dict, f)
    if "Timeout" in inp:
        timeout = inp["Timeout"]
    else:
        timeout = 120
    output_filename = f"/tmp/{generate_random_str()}.json"
    start_time = datetime.datetime.now()
    p = subprocess.Popen(["python3", "ping_util.py", "-i", inp_filename, "-o", output_filename, '--proto', 'https' ])
    p.communicate(timeout=timeout)
    duration_microsec = (datetime.datetime.now() - start_time).microseconds // 1000
    ts = datetime.datetime.now(datetime.timezone.utc)

    with open(output_filename) as f:
        results_dict = json.load(f)
    
    save_ping_results(ts, 'local', 'local', results_dict, 'local', 'local', duration_microsec)
    return jsonify(results_dict)


# @app.route("/api/tracert", methods=["POST"])
# @cross_origin()
# def tracert():
#     dest_name = request.get_json()["Address"]
#     dest_addr = socket.gethostbyname(dest_name)
#     icmp = socket.getprotobyname('icmp')
#     udp = socket.getprotobyname('udp')
#     ttl = 1
#     shouldContinue = True
#     ans = []
#     while True:
#         if (shouldContinue):
#             IP, shouldContinue = tu.check_one_node(
#                 dest_name, ttl, dest_addr, icmp, udp)
#             # ans.append(IP)
#             ip_info = {}
#             if IP:
#                 ip_info = requests.get(f"https://freegeoip.app/json/{IP}").json()
#             ans.append({"IP": IP, "Info": ip_info})
#             ttl += 1
#         else:
#             break
#     return jsonify(ans)


# @app.route("/api/get_proxy_list")
# @cross_origin()
# def get_proxy_list():
#     global CACHED_PROXIES
#     global CACHE_COUNTER

#     if CACHE_COUNTER > 5:
#         CACHE_COUNTER = 0
#         CACHED_PROXIES = None

#     if CACHED_PROXIES:
#         CACHE_COUNTER += 1
#         return jsonify(CACHED_PROXIES)

#     html = pp.load()
#     proxies = pp.parse(html)
#     ans = []
#     for p in proxies:
#         if p.is_valid and p.protocol == "https":
#             ans.append({"IP": p.ip, "Port": p.port, "Country": p.country, "Protocol": p.protocol})

#     CACHED_PROXIES = ans
#     return jsonify(ans)


if __name__ == "__main__":
    init_db()
    app.run(port=3113, host='0.0.0.0')

import json
from sys import argv
import datetime
import requests

import threading
import resource
from itertools import zip_longest

ans_lock = threading.Lock()
ans = {}

def ping_site(url, proxy):
    try:
        resp = requests.get(f"http://{url}", proxies=proxy, timeout=5)
        if resp.ok:
            return 1
        return 0
    except Exception:
        return 0
    return 0

def ping_country(country, sites_list):
    availability=0
    ping = 0
    for site in sites_list:
        ts = datetime.datetime.now()
        cur_av = ping_site(site, proxies)
        if cur_av == 1:
            availability += ping_site(site, proxies)
            time_delta = datetime.datetime.now() - ts
            ping += time_delta.total_seconds()*10**3
    country_av = availability / len(sites_list)
    country_ping = ping // len(sites_list)
    global ans
    with ans_lock:
        ans[country] = {"Ping":country_ping, "Availability":country_av}
    print(country, ans[country])

proxy_url = argv[1]

with open('init_db/web_pool.json', "r") as f:
    top_sites = json.load(f)

ans = {}
proxies = {"http":proxy_url}
threads = []
for country in top_sites:
    thread = threading.Thread(target=ping_country, args=(country, top_sites[country]))
    threads.append(thread)
    thread.start()
for thread in threads:
    thread.join()

with open('test.json', 'w') as f:
    json.dump(ans, f)
import json
from sys import argv
import datetime
import requests

def ping_site(url, proxy):
    try:
        resp = requests.get(f"https://{url}", proxies=proxy, timeout=3)
        if resp.ok:
            return 1
        return 0
    except Exception:
        #return 0
        raise Exception
    return 0

#ip:port
proxy_url = argv[1]

with open('init_db/small_pool.json', "r") as f:
    top_sites = json.load(f)

ans = {}
p_list = proxy_url.split(':')
proxies = {p_list[0]:p_list[1]}

for country in top_sites:
    sites_list = top_sites[country]
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
    country_ping = ping / len(sites_list)
    ans[country] = {"Ping":country_ping, "Availability":country_av}
    print(country, ans[country])

with open('test.json', 'w') as f:
    json.dump(ans, f)

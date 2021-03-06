#!/usr/bin/env python3

# Console util for ping sites
# usage: ping_util OUTPUT-FILENAME [proxies]
# proxies format: ip:port, default value is {} (no proxy)

import json
import argparse
import datetime
import requests
import threading
import resource
from itertools import zip_longest

ping_result_lock = threading.Lock()
ping_res = {}

ping_site_result_lock = threading.Lock()
ping_site_res = {}

proxies = {}


def get_parsed_args():
    parser = argparse.ArgumentParser(description="ping <3")
    parser.add_argument('-o', '--output-filename',
                        default='/tmp/tmp.json', dest='output_filename')
    parser.add_argument('-i', '--input-filename', dest='input_filename',
                        default='init_db/web_pool.json')
    parser.add_argument('-p', '--proxy', dest='proxy')
    parser.add_argument('--proto', dest='proto', default="https")

    return parser.parse_args()


def grouper(iterable, n, fillvalue=None):
    args = [iter(iterable)] * n
    return list(zip_longest(*args, fillvalue=fillvalue))


def ping_site(url):
    try:
        global proxies
        resp = requests.get(f"{args.proto}://{url}", proxies=proxies, timeout=3)
        # print(resp.ok)
        if resp.ok:
            return 1
        return 0
    except Exception:
        return 0
    return 0


def scan_site(site):
    ts = datetime.datetime.now()
    time_delta = 3
    cur_av = ping_site(site)
    if cur_av == 1:
        time_delta = (datetime.datetime.now() - ts).total_seconds()
    with ping_result_lock:
        ping_site_res[site] = {"Ping": time_delta, "Availability": cur_av}


def scan_multithread(revert_dict):
    threads = []
    open_files_os_limit = resource.getrlimit(resource.RLIMIT_NOFILE)[0]
    print(f"I will run only {int(open_files_os_limit / 2)} threads at once, because of openfile limit")
    items_parts = grouper(revert_dict.items(), int(open_files_os_limit / 2))
    print(f"So there will be {len(items_parts)} parts of threads")
    # print(f"partition is {items_parts}")
    for part in items_parts:
        for item in part:
            if item is None:
                break
            thread = threading.Thread(target=scan_site, args=(item[0],))
            threads.append(thread)
            print(f"start thread for {item[0]}")
            thread.start()
        for t in threads:
            if t is None:
                break
            print(f"thread finished")
            t.join()


def init_ping_res(country_list):
    for country in country_list:
        ping_res[country] = {"Ping": 0, "Availability": 0}


def fill_ping_res():
    for site in ping_site_res:
        country = revert_dict[site]
        ping_res[country]["Ping"] += ping_site_res[site]["Ping"]
        ping_res[country]["Availability"] += ping_site_res[site]["Availability"]
    for country in ping_res:
        ping_res[country]["Ping"] = ping_res[country]["Ping"] / len(top_sites[country])
        ping_res[country]["Availability"] = ping_res[country]["Availability"] / len(top_sites[country])


args = get_parsed_args()
if args.proxy:
    p_list = args.proxy.split(':')
    proxies = {p_list[0]: p_list[1]}

with open(args.input_filename, "r") as f:
    top_sites = json.load(f)

print(f"I will scan {top_sites.keys()}")

revert_dict = {}
for country in top_sites:
    for site in top_sites[country]:
        revert_dict[site] = country

print("Dict reverted")

scan_multithread(revert_dict)

init_ping_res(top_sites.keys())
fill_ping_res()

with open(args.output_filename, 'w') as f:
    json.dump(ping_res, f)

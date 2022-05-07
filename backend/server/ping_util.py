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

TIMEOUT = 2

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


def ping_site(proto, url, proxies):
    try:
        resp = requests.get(f"{proto}://{url}", proxies=proxies, timeout=TIMEOUT)
        # print(resp.ok)
        if resp.ok:
            return 1
        return 0
    except Exception as e:
        return 0
    return 0

# default proto is http
def ping_site_like_browser(proto, url, proxies):
    path = f"{proto}://{url}/favicon.ico"
    try:
        resp = requests.get(path, proxies=proxies, timeout=TIMEOUT)
        #print(path, resp.ok)
        if resp.ok:
            return 1
        return 0
    except Exception as e:
        #print(path, e)
        return 0
    return 0


def scan_site(proto, site, proxies, func):
    ts = datetime.datetime.now()
    time_delta = 3
    cur_av = func(proto, site, proxies)
    #print(cur_av)
    if cur_av == 1:
        time_delta = (datetime.datetime.now() - ts).total_seconds()
    with ping_result_lock:
        ping_site_res[site] = {"Ping": time_delta, "Availability": cur_av}
        #print(site, ping_site_res[site])


def scan_multithread(proto, sites_list, target_func=ping_site, proxies={}):
    global ping_site_res
    ping_site_res = {}
    threads = []
    open_files_os_limit = resource.getrlimit(resource.RLIMIT_NOFILE)[0]
    print(f"I will run only {int(open_files_os_limit / 2)} threads at once, because of openfile limit")
    items_parts = grouper(sites_list, int(open_files_os_limit / 2))
    print(f"So there will be {len(items_parts)} parts of threads")
    # print(f"partition is {items_parts}")
    for part in items_parts:
        for site in part:
            if site is None:
                break
            thread = threading.Thread(target=scan_site, args=(proto, site, proxies, target_func))
            threads.append(thread)
            #print(f"start thread for {site}")
            thread.start()
        for t in threads:
            if t is None:
                break
            #print(f"thread finished")
            t.join()
    print("threads finished")
    return ping_site_res


def init_ping_res(country_list):
    for country in country_list:
        ping_res[country] = {"Ping": 0, "Availability": 0}


def fill_ping_res(ping_site_res, revert_dict, top_sites):
    for site in ping_site_res:
        country = revert_dict[site]
        ping_res[country]["Ping"] += ping_site_res[site]["Ping"]
        ping_res[country]["Availability"] += ping_site_res[site]["Availability"]
    for country in ping_res:
        ping_res[country]["Ping"] = ping_res[country]["Ping"] / len(top_sites[country])
        ping_res[country]["Availability"] = ping_res[country]["Availability"] / len(top_sites[country])

def main():
    args = get_parsed_args()
    proxies = {}
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

    ping_site_res = scan_multithread(args.proto, revert_dict.keys(), ping_site, proxies)

    init_ping_res(top_sites.keys())
    fill_ping_res(ping_site_res, revert_dict, top_sites)

    with open(args.output_filename, 'w') as f:
        json.dump(ping_res, f)
    
if __name__ == "__main__":
    main()
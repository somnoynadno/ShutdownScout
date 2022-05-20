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
import datetime

ping_site_result_lock = threading.Lock()
ping_site_res = {}

proxies = {}

TIMEOUT = 3

def get_parsed_args():
    parser = argparse.ArgumentParser(description="ping <3")
    parser.add_argument('-o', '--output-filename',
                        default='/tmp/tmp.json', dest='output_filename')
    parser.add_argument('-i', '--input-filename', dest='input_filename',
                        default='init_db/speedtest_available_from_europe_https_united_double_check_small.json')
    parser.add_argument('-p', '--proxy', dest='proxy')
    parser.add_argument('--proto', dest='proto', default="https")

    return parser.parse_args()


def grouper(iterable, n, fillvalue=None):
    args = [iter(iterable)] * n
    return list(zip_longest(*args, fillvalue=fillvalue))

def _ping(path, proxies, timeout=TIMEOUT):
    headers = {
        "User-Agent" : "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:99.0) Gecko/20100101 Firefox/99.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Encoding" : "gzip, deflate",
        "Cache-Control": "no-cache",
        "Connection":"keep-alive"
    }
    try:
        ts = datetime.datetime.now()
        resp = requests.get(path, proxies=proxies, timeout=timeout, headers=headers)
        time_delta_milliseconds = (datetime.datetime.now() - ts).microseconds // 1000
        #print(path, resp.ok)
        if resp.ok:
            return time_delta_milliseconds, 1
        else:
            pass
            #print(path, resp.status_code, resp.text)
        return timeout*1000, 0
    except requests.exceptions.RequestException as e:
        #print(path, e)
        return timeout*1000, 0


def ping_site(proto, url, proxies, timeout=TIMEOUT):
    path = f"{proto}://{url}"
    return _ping(path, proxies)

# default proto is http
def ping_site_like_browser(proto, url, proxies):
    path = f"{proto}://{url}/favicon.ico"
    return _ping(path, proxies)


def scan_site(proto, site, proxies, func, timeout):
    cur_ping, cur_av = func(proto, site, proxies, timeout)
    with ping_site_result_lock:
        ping_site_res[site] = {"Ping": cur_ping, "Availability": cur_av}


def scan_multithread(proto, sites_list, target_func=ping_site, proxies={}, timeout=TIMEOUT):
    global ping_site_res
    ping_site_res = {}
    threads = []
    open_files_os_limit = resource.getrlimit(resource.RLIMIT_NOFILE)[0]
    limit_delimiter = 32
    print(f"I will run only {int(open_files_os_limit // limit_delimiter)} threads at once, because of openfile limit")
    items_parts = grouper(sites_list, int(open_files_os_limit // limit_delimiter))
    print(f"So there will be {len(items_parts)} parts of threads")
    # print(f"partition is {items_parts}")
    for part in items_parts:
        for site in part:
            if site is None:
                break
            thread = threading.Thread(target=scan_site, args=(proto, site, proxies, target_func, timeout))
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


def get_ping_res(ping_site_res, revert_dict, top_sites):
    ping_res = {}
    for country in top_sites.keys():
        ping_res[country] = {"Ping": 0, "Availability": 0}
    for site in ping_site_res:
        country = revert_dict[site]
        ping_res[country]["Ping"] += ping_site_res[site]["Ping"]
        ping_res[country]["Availability"] += ping_site_res[site]["Availability"]
    for country in ping_res:
        ping_res[country]["Ping"] = ping_res[country]["Ping"] / len(top_sites[country])
        ping_res[country]["Availability"] = ping_res[country]["Availability"] / len(top_sites[country])
    return ping_res


def scan_web_pool(top_sites, proto, ping_func, proxies):
    print(f"I will scan {top_sites.keys()}")

    revert_dict = {}
    for country in top_sites:
        for site in top_sites[country]:
            revert_dict[site] = country

    print("Dict reverted")
    
    start = datetime.datetime.now()
    ping_site_res = scan_multithread(proto, revert_dict.keys(), ping_func, proxies)
    duration = datetime.datetime.now() - start
    print(f"scan took {duration.microseconds // 1000} milliseconds")

    ping_res = get_ping_res(ping_site_res, revert_dict, top_sites)
    return ping_res

def main():
    args = get_parsed_args()
    proxies = {}
    if args.proxy:
        p_list = args.proxy.split(':')
        proxies = {p_list[0]: p_list[1]}
    with open(args.input_filename, "r") as f:
        top_sites = json.load(f)

    ping_res = scan_web_pool(top_sites, args.proto, ping_site, proxies)

    with open(args.output_filename, 'w') as f:
        json.dump(ping_res, f)
    
if __name__ == "__main__":
    main()
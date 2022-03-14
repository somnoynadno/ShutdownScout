import json
import os
import threading
import requests
from itertools import zip_longest
import re
import socket
import whois

UNIS_INPUT_JSON = "unis.json"
UNI_SITES_CHECKED_FILENAME = "web_pool_unis_whois_all.json"
IP_INFO = {}
IP_INFO_LOCK = threading.Lock()
HTTP_REGEXP = re.compile(r"(?<=http://).+")
HTTPS_REGEXP = re.compile(r"(?<=https://).+")


def grouper(iterable, n, fillvalue=None):
    args = [iter(iterable)] * n
    return list(zip_longest(*args, fillvalue=fillvalue))


def scan_ip(host):
    country_code = get_country_code(host)
    if not country_code:
        return
    with IP_INFO_LOCK:
        if country_code not in IP_INFO:
            IP_INFO[country_code] = []
        IP_INFO[country_code].append(host)


def get_country_code(host):
    return whois.whois(host).country


def parse_multithread(uni_dict_list):
    threads = []
    open_files_os_limit = 1000
    print(
        f"I will run only {int(open_files_os_limit / 2)} threads at once, because of openfile limit"
    )
    items_parts = grouper(uni_dict_list, int(open_files_os_limit / 2))
    print(f"So there will be {len(items_parts)} parts of threads")
    for part in items_parts:
        for item in part:
            if item is None:
                break
            thread = threading.Thread(
                target=scan_ip, args=(item["domains"][0],)
            )
            threads.append(thread)
            print(f"start thread for {item['domains'][0]}")
            thread.start()
        for t in threads:
            if t is None:
                break
            print(f"thread finished")
            t.join()


with open(UNIS_INPUT_JSON) as json_file:
    uni_data = json.load(json_file)

parse_multithread(uni_data)
with open(UNI_SITES_CHECKED_FILENAME, 'w') as f:
    json.dump(IP_INFO, f)

import json
import os
import threading
import requests
from itertools import zip_longest
import re
import socket

UNIS_INPUT_JSON = "unis.json"
UNI_SITES_CHECKED_FILENAME = "web_pool_unis.json"
IP_INFO = []
IP_SCAN_LOCK = threading.Lock()
HTTP_REGEXP = re.compile(r"(?<=http://).+")
HTTPS_REGEXP = re.compile(r"(?<=https://).+")


def grouper(iterable, n, fillvalue=None):
    args = [iter(iterable)] * n
    return list(zip_longest(*args, fillvalue=fillvalue))


def scan_ip(domain):
    # hosts = HTTP_REGEXP.findall(website) + HTTPS_REGEXP.findall(website)
    #if hosts:
    ip = socket.gethostbyname(domain)
    ip_info = get_ip_info(ip)
    with IP_SCAN_LOCK:
        IP_INFO.append(ip_info)


def get_ip_info(ip):
    r = requests.get(f"https://freegeoip.app/json/{ip}")
    return r.json()


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

parse_multithread(uni_data[:5])
with open(UNI_SITES_CHECKED_FILENAME, 'w') as f:
    json.dump(IP_INFO, f)

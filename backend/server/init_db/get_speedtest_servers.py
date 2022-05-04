import requests
import re
import sys
import os
import json
from collections import defaultdict
from functools import cmp_to_key

sys.path.append(os.getcwd() + '/..')
from ping_util import ping_site, scan_multithread, ping_site_like_browser

country_site_regex = re.compile(
    r'<tr>'
    r'(\s*<td>(?P<country>[A-Za-z0-9 \-\.,:]+)</td>\s*)'
    r'(\s*<td>(?P<city>[A-Za-z0-9 \-\.,:]+)</td>\s*)'
    r'(\s*<td>(?P<provider>[A-Za-z0-9 \-\.,:]+)</td>\s*)'
    r'(\s*<td>(?P<address>[A-Za-z0-9 \-\.,:]+)</td>\s*)'
    r'(\s*<td>(?P<id>[A-Za-z0-9 \-\.,:]+)</td>\s*)'
    r'</tr>'
)

SITES_MAX_COUNT = 5

class CountryRecord:
    def __init__(self, country_name, city, provider, address, id):
        self.country_name = country_name
        self.city = city
        self.provider = provider
        self.address = address
        self.id = int(id)
    
    def __str__(self):
        return f"{self.country_name} ({self.city}, {self.provider}) : {self.address}"
    
    def __repr__(self):
        return f"{self.country_name} : {self.address}"


def fill_ping_res_file(sites_list, filename):
    ping_res = scan_multithread('http', sites_list, target_func=ping_site_like_browser)
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(ping_res, f, ensure_ascii=False, indent=4)  


def parse_list_of_sites():
    r = requests.get('https://williamyaps.github.io/wlmjavascript/servercli.html')

    matches = country_site_regex.finditer(r.text)
    sites_to_record_dict = {}

    for m in matches:
        cr = CountryRecord(
                m.group('country'),
                m.group('city'),
                m.group('provider'),
                m.group('address'),
                m.group('id'),
                )
        sites_to_record_dict[cr.address] = cr 
    return sites_to_record_dict


def make_pool_smaller(ping_res_filename, favicon_sites_filename, small_pool_filename):
    with open(ping_res_filename) as f:
        ping_records_dict = json.loads(f.read())
    with open(favicon_sites_filename) as f:
        favicon_sites = json.loads(f.read())
    small_good_sites_by_country = {}
    for country in favicon_sites:
        if len(favicon_sites[country]) <= SITES_MAX_COUNT:
            small_good_sites_by_country[country] = favicon_sites[country]
        else:
            small_good_sites_by_country[country] = get_best_sites_for_each_country(
                favicon_sites[country],
                ping_records_dict
            )
    with open(small_pool_filename, 'w') as f:
        favicon_sites = json.dump(small_good_sites_by_country, f, ensure_ascii=False, indent=4)


def get_best_sites_for_each_country(sites_list, ping_records_dict):
    if len(sites_list) <= SITES_MAX_COUNT:
        return sites_list 
    sorted_sites_list = sorted(
        sites_list,
        key=cmp_to_key(
            lambda site_a, site_b: 1 if ping_records_dict[site_a]["Ping"] > ping_records_dict[site_b]["Ping"] else -1
        )
    )
    return sorted_sites_list[:SITES_MAX_COUNT]


def fill_web_pool_by_ping_res(sites_to_record_dict, ping_res_filename, available_sites_filename):
    with open(ping_res_filename) as f:
        ping_records_dict = json.loads(f.read())
    good_sites_by_country = defaultdict(list)
    for site in ping_records_dict:
        if ping_records_dict[site]["Availability"] == 1:
            cr = sites_to_record_dict[site]
            good_sites_by_country[cr.country_name].append(site)

    with open(available_sites_filename, 'w', encoding='utf-8') as f:
        json.dump(good_sites_by_country, f, ensure_ascii=False, indent=4)


def get_sites_with_favicon(sites_to_record_dict, available_sites_filename, favicon_sites_filename):
    with open(available_sites_filename) as f:
        available_sites = json.loads(f.read())
    sites_list = []
    for country in available_sites:
        sites = available_sites[country]
        sites_list += sites
    ping_res = scan_multithread('http', sites_list, target_func=ping_site_like_browser)
    favicon_ping_res_filename = "speedtest_favicon_pingres.json"
    with open(favicon_ping_res_filename, 'w', encoding='utf-8') as f:
        json.dump(ping_res, f, ensure_ascii=False, indent=4)
    fill_web_pool_by_ping_res(sites_to_record_dict, favicon_ping_res_filename, favicon_sites_filename)


def main():
    sites_to_record_dict = parse_list_of_sites()
  
    ping_res_filename = 'speedtest_ping_res.json'
    available_sites_filename = 'speedtest_available_from_europe.json'
    #available_sites_filename = "test.json"
    favicon_sites_filename = "speedtest_favicon_available_from_europe_2.json"
    small_pool_filename = "speedtest_favicon_available_from_europe_2_small.json"

    #fill_ping_res_file(sites_to_record_dict.keys(), ping_res_filename)
    print("ping res filled")
    #fill_web_pool_by_ping_res(sites_to_record_dict, ping_res_filename, available_sites_filename)
    print("webpool filled")
    #get_sites_with_favicon(sites_to_record_dict, available_sites_filename, favicon_sites_filename)
    print("filtered by favicon")
    make_pool_smaller(ping_res_filename, favicon_sites_filename, small_pool_filename)
    print("got smaller")

    
    
    
    

    

    




    
if __name__ == "__main__":
    main()
import requests
import re
import sys
import os
import json
from collections import defaultdict

sys.path.append(os.getcwd() + '/..')
from ping_util import ping_site, scan_multithread

country_site_regex = re.compile(
    r'<tr>'
    r'(\s*<td>(?P<country>[A-Za-z0-9 \-\.,:]+)</td>\s*)'
    r'(\s*<td>(?P<city>[A-Za-z0-9 \-\.,:]+)</td>\s*)'
    r'(\s*<td>(?P<provider>[A-Za-z0-9 \-\.,:]+)</td>\s*)'
    r'(\s*<td>(?P<address>[A-Za-z0-9 \-\.,:]+)</td>\s*)'
    r'(\s*<td>(?P<id>[A-Za-z0-9 \-\.,:]+)</td>\s*)'
    r'</tr>'
)


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
    ping_res = scan_multithread('http', sites_list)
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(ping_res, f, ensure_ascii=False, indent=4)  


def main():
    r = requests.get('https://williamyaps.github.io/wlmjavascript/servercli.html')
    print(len(r.text))

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
    filename = 'speedtest_ping_res.json'
    #fill_ping_res_file(sites_to_record_dict.keys(), filename)
    with open(filename) as f:
        ping_records_dict = json.loads(f.read())
    
    good_sites_by_country = defaultdict(list)
    for site in ping_records_dict:
        if ping_records_dict[site]["Availability"] == 1:
            cr = sites_to_record_dict[site]
            good_sites_by_country[cr.country_name].append(site)
    with open('speedtest_available_from_home.json', 'w', encoding='utf-8') as f:
        json.dump(good_sites_by_country, f, ensure_ascii=False, indent=4)



    
if __name__ == "__main__":
    main()
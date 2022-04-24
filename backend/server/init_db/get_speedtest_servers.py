import requests
import re
import sys
import os

sys.path.append(os.getcwd() + '/..')
from ping_util import ping_site

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


def main():
    r = requests.get('https://williamyaps.github.io/wlmjavascript/servercli.html')
    print(len(r.text))

    matches = country_site_regex.finditer(r.text)

    result_countries = []

    for m in matches:
        if ping_site('http', m.group('address'), {}) or ping_site('https', m.group('address'), {}):
            print(m.group('address'))
            result_countries.append(
                CountryRecord(
                    m.group('country'),
                    m.group('city'),
                    m.group('provider'),
                    m.group('address'),
                    m.group('id'),
                    )
            )
        
    
if __name__ == "__main__":
    main()
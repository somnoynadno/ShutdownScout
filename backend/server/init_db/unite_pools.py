import json
import re
import requests

country_regex = re.compile(r'<a href="countries/([A-Z]+)">([A-Za-z]+)</a>')
countries_list_url = 'https://www.alexa.com/topsites/countries'

site_regex = re.compile(r'\t*<a href="/siteinfo/([a-zA-Z\._\-]+)">.*</a>\t*')

def _get_counties_codes():
    a = requests.get(countries_list_url)
    return re.findall(country_regex, a.text)


with open('web_pool.json') as alexa:
    alexa_data = json.load(alexa)

with open('web_pool_unis_whois_all.json') as uni:
    uni_data = json.load(uni)

print(type(uni_data))
# get pretty country code dict
cc = _get_counties_codes()
ccd = {}
for c in cc:
    ccd[c[0]] = c[1]

united_pool_by_country = alexa_data

for coutry_code in uni_data:
    if coutry_code in ccd:
        if ccd[coutry_code] not in united_pool_by_country:
            united_pool_by_country[ccd[coutry_code]]= []
        united_pool_by_country[ccd[coutry_code]] += uni_data[coutry_code]

with open("web_pool_united_2.json", 'w') as f:
    json.dump(united_pool_by_country, f)
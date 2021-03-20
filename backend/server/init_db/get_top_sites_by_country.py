import re
import requests
import json
from selenium import webdriver
from selenium.webdriver import FirefoxOptions
import os

country_by_code_dict = {}
domains_dict = {}

path = '/home/kami/workspace/software/geckodriver'

country_regex = re.compile(r'<a href="countries/([A-Z]+)">([A-Za-z]+)</a>')
countries_list_url = 'https://www.alexa.com/topsites/countries'

site_regex = re.compile(r'\t*<a href="/siteinfo/([a-zA-Z\._\-]+)">.*</a>\t*')

def _parse_domains_json():
    ans = {}
    with open("domain_info.json", "r") as f:
        di = json.loads(f.read())
    for dik in di:
        if dik["type"] == "country-code":
            county_name = dik["description"]
            ans[dik["domain"]] = county_name
    return ans

def _get_counties_codes():
    a = requests.get(countries_list_url)
    return re.findall(country_regex, a.text)

def _get_sites_by_code(code):
    #print(code)
    sites_list_url = f"https://www.alexa.com/topsites/countries/{code}"
    driver.get(sites_list_url)
    driver.set_page_load_timeout(15)
    dinamic_html_source = driver.page_source
    #print(dinamic_html_source)
    return re.findall(site_regex, dinamic_html_source)

def _get_sites_list(country_code):
    ans = []
    top_sites = _get_sites_by_code(country_code)
    for s in top_sites:
        site = _check_top_level_domain(country_code, s)
        if site:
            ans.append(site)
    return ans

def _check_top_level_domain(country_code, site):
    global domains_dict
    global country_by_code_dict
    top_level_domain = site.split('.')[-1]
    if country_code in country_by_code_dict and top_level_domain in domains_dict and country_by_code_dict[country_code] in domains_dict[top_level_domain]:
        return site

def _get_sites_for_all_countries():
    global country_by_code_dict
    ans = {}
    for country_code in country_by_code_dict:
        ans[country_by_code_dict[country_code]] = _get_sites_list(country_code)
    return ans

def get_top_sites():
    global driver
    global domains_dict
    global country_by_code_dict
    country_by_code_dict = {x[0]:x[1] for x in _get_counties_codes()}
    print(country_by_code_dict)
    domains_dict = _parse_domains_json()
    print(domains_dict)
    opts = FirefoxOptions()
    opts.add_argument("--headless")
    driver = webdriver.Firefox(executable_path = path, firefox_options=opts)
    ans = _get_sites_for_all_countries()
    print(ans)
    driver.close()
    return ans

ans = get_top_sites()
with open("web_pool.json", "w+") as f:
    json.dump(ans, f)
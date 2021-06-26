import requests
import threading

from bs4 import BeautifulSoup
from time import sleep
from random import choice


TIMEOUT = 3
DEBUG = False


class Proxy(object):
	def __init__(self, ip, port, country, protocol):
		super(Proxy, self).__init__()
		self.ip = ip
		self.port = port
		self.country = country
		self.protocol = protocol

		self.is_checked = False
		self.is_valid = False

	def __str__(self):
		checked = "checked" if self.is_checked else ""

		if checked:
			valid = "valid" if self.is_valid else "not valid"
		else: 
			valid = ""

		return f"Proxy {self.protocol}://{self.ip}:{self.port} ({self.country}) {checked} {valid}"

	def get_full_address(self):
		return f"http://{self.ip}:{self.port}"

	def check(self):
		proxies = {}
		proxies[self.protocol] = self.get_full_address()

		headers = {
			"User-Agent": 'Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0',
		}

		addresses = ['https://vk.com', 'https://google.com', 'https://youtube.com', 'https://yandex.ru', 'https://github.com']
		check_address = choice(addresses)
		
		try:
			r = requests.get(check_address, headers=headers, proxies=proxies, timeout=TIMEOUT)
		except Exception as e:
			if DEBUG:
				print(e)
		else:
			if r.status_code < 400 and len(r.content) > 0:
				self.is_valid = True

		self.is_checked = True

		if DEBUG:
			print(str(self))
		

def load() -> str:
	http_proxy = https_proxy = "http://somnoynadno.ru:7397"

	proxies = { 
		"http"  : http_proxy, 
		"https" : https_proxy,
	}

	headers = {
		"User-Agent": 'Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0',
	}


	s = requests.Session()
	html = s.get('https://free-proxy-list.net/', headers=headers, proxies=proxies).content
	
	return str(html)



def parse(html: str) -> [Proxy]:
	soup = BeautifulSoup(html, 'html.parser')
	tr = soup.find_all('tr')

	proxies = []
	threads = []
	for row in tr:
		td = row.find_all('td')

		if td:
			ip = td[0].get_text()
			port = td[1].get_text()
			country = td[3].get_text()
			protocol = "http" if td[6].get_text() == "no" else "https"

			proxy = Proxy(ip, port, country, protocol)
			t = threading.Thread(name=ip, target=proxy.check)
			t.start()

			threads.append(t)
			proxies.append(proxy)


	for t in threads:
		t.join()

	return proxies



if __name__ == "__main__":
	html = load()
	proxies = parse(html)

	for p in proxies:
		if p.is_valid and p.protocol == "https":
			print(p)

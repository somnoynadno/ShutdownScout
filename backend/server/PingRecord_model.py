from database_controller import DatabaseClient


# ping dict
# {
#     "Germany": {"Ping": 200, "Availability": 1},
#     "Canada": {"Ping": 500, "Availability": 0.8},
# }

class PingRecord:
    def __init__(self, timestamp, ip, region, country, ping, availability, provider="unknown", scan_type="unknown", duration=-1):
        self.timestamp = timestamp
        self.user_ip = ip
        self.user_region = region
        self.pinged_county = country
        self.ping = ping
        self.availability = availability
        self.provider = provider
        self.scan_type=scan_type
        self.duration=duration

    def save_to_db(self):
        with DatabaseClient() as db:
            db.insert_record(self.timestamp, self.user_ip, self.user_region, self.pinged_county, self.ping,
                             self.availability, self.provider, self.scan_type, self.duration)

    @classmethod
    def select_records(self, ip=None, region=None, limit=None, timestamp=None, provider=None):
        with DatabaseClient() as db:
            recs = db.select_records(ip=ip, region=region, limit=limit, timestamp=timestamp, provider=provider)
        ans = []
        for r in recs:
            ans.append(PingRecord(*r))
        return ans


class ProxyPingRecord:
    def __init__(self, timestamp, proto, ip, port, region, country, ping, availability):
        self.timestamp = timestamp
        self.proxy_protocol = proto
        self.proxy_ip = ip
        self.proxy_port = port
        self.proxy_region = region
        self.pinged_county = country
        self.ping = ping
        self.availability = availability

    def save_to_db(self):
        with DatabaseClient() as db:
            db.insert_proxy_record(self.timestamp, self.proxy_protocol, self.proxy_ip, self.proxy_port,
                                   self.proxy_region, self.pinged_county, self.ping, self.availability)

    @classmethod
    def select_records(self, ip=None, port=None, region=None, limit=None):
        with DatabaseClient() as db:
            recs = db.select_proxy_records(ip=ip, port=port, region=region, limit=limit)
        ans = []
        for r in recs:
            ans.append(ProxyPingRecord(*r))
        print(ans)
        return ans

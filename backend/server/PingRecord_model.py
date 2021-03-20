from database_controller import DatabaseClient
# ping dict
# {
#     "Germany": {"Ping": 200, "Availability": 1},
#     "Canada": {"Ping": 500, "Availability": 0.8},
# }

class PingRecord:
    def __init__(self, timestamp, ip, region, country, ping, availability):
        self.timestamp = timestamp
        self.user_ip = ip
        self.user_region = region
        self.pinged_county = country
        self.ping = ping
        self.availability = availability
    
    def save_to_db(self):
        with DatabaseClient() as db:
            db.insert_record(self.timestamp, self.user_ip, self.user_region, self.pinged_county, self.ping, self.availability)

    @classmethod
    def select_records(self, ip=None, region=None, limit=None):
        with DatabaseClient() as db:
            recs = db.select_records(ip, region, limit)
        ans = []
        for r in recs:
            ans.append(PingRecord(*r))
        return ans
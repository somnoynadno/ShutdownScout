import psycopg2

conn = None


def connect_to_db():
    global conn
    conn = psycopg2.connect(port=5432, dbname='postgres', user='postgres', password='postgres', host='postgres')


def check_and_refresh_connect():
    global conn
    try:
        conn.isolation_level
    except psycopg2.OperationalError:
        connect_to_db()
    except AttributeError:
        connect_to_db()


class DatabaseClient:
    def __init__(self):
        pass

    def __enter__(self):
        check_and_refresh_connect()
        global conn
        self.conn = conn
        self.cursor = conn.cursor()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.conn.commit()
        self.cursor.close()

    def select_sites_by_contry(self, country_name):
        self.cursor.execute('SELECT * FROM public.CountryTopSites WHERE country_name = %s', (country_name,))
        return self.cursor.fetchone()

    def select_sites_of_all_countries(self):
        self.cursor.execute('SELECT * FROM public.CountryTopSites')
        return self.cursor.fetchall()

    def insert_country_topsites_record(self, country_name, top_sites_str):
        self.cursor.execute(
            "INSERT INTO public.CountryTopSites (country_name, top_sites) VALUES(%s, %s) ON CONFLICT DO NOTHING;",
            (country_name, top_sites_str))

    def select_records(self, ip=None, region=None, limit=None, timestamp=None, provider=None):
        condition_statements = []
        values = []
        if ip:
            condition_statements.append("user_ip=%s")
            values.append(ip)
        if region:
            condition_statements.append("user_region=%s")
            values.append(region)
        if limit:
            condition_statements.append(
                f"timestamp in (select distinct timestamp from public.PingRecord order by timestamp desc limit {limit})")
        if timestamp:
            condition_statements.append("timestamp=%s")
            values.append(timestamp)
        if provider:
            condition_statements.append("provider=%s")
            values.append(provider)
        query = f"SELECT * FROM public.PingRecord"
        if len(condition_statements):
            condition = " AND ".join(condition_statements)
            query += f" where {condition}"
        query += " order by timestamp desc"

        print(query)
        self.cursor.execute(query, values)
        return self.cursor.fetchall()

    def insert_record(self, timestamp, ip, region, country, ping, availability, provider, scan_type, duration):
        self.cursor.execute(
            "INSERT INTO public.PingRecord (timestamp, user_ip, user_region, pinged_county, ping, availability, provider, type, duration_milliseconds) VALUES(%s,%s,%s,%s,%s,%s, %s, %s, %s) ON CONFLICT DO NOTHING;",
            (timestamp, ip, region, country, ping, availability, provider, scan_type, duration))

    def select_proxy_records(self, ip=None, port=None, region=None, limit=None):
        condition_statements = []
        values = []
        if ip:
            condition_statements.append("proxy_ip=%s")
            values.append(ip)
        if region:
            condition_statements.append("proxy_region=%s")
            values.append(region)
        if port:
            condition_statements.append("proxy_port=%s")
            values.append(port)
        if limit:
            condition_statements.append(
                f"timestamp in (select distinct timestamp from public.ProxyPingRecord order by timestamp desc limit {limit})")
        query = f"SELECT * FROM public.ProxyPingRecord"
        if len(condition_statements):
            condition = " AND ".join(condition_statements)
            query += f" where {condition}"
        query += " order by timestamp desc"

        print(query, values)
        self.cursor.execute(query, values)
        return self.cursor.fetchall()

    def insert_proxy_record(self, timestamp, proto, ip, port, region, country, ping, availability):
        self.cursor.execute(
            "INSERT INTO public.ProxyPingRecord (timestamp, proxy_protocol, proxy_ip, proxy_port, proxy_region, pinged_county, ping, availability) VALUES(%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING;",
            (timestamp, proto, ip, port, region, country, ping, availability))
    
    def get_lookup_res(self, ip):
        self.cursor.execute('SELECT * FROM public.lookup WHERE \"IP\" = %s', (ip,))
        return self.cursor.fetchone()
    
    def save_lookup_res(self, ip, lookup_str, lookup_server):
        self.cursor.execute(
            "INSERT INTO public.lookup (\"IP\", \"LookupRes\", \"LookupServer\") VALUES(%s, %s, %s) ON CONFLICT DO NOTHING;",
            (ip, lookup_str, lookup_server))

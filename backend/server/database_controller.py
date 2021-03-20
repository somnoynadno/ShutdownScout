import psycopg2
from hashlib import md5

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
        self.cursor.execute('SELECT * FROM public.CountryTopSites WHERE country_name = %s', (country_name, ))
        return self.cursor.fetchone()
    
    def select_sites_of_all_countries(self):
        self.cursor.execute('SELECT * FROM public.CountryTopSites')
        return self.cursor.fetchall()
    
    def insert_country_topsites_record(self, country_name, top_sites_str):
        self.cursor.execute("INSERT INTO public.CountryTopSites (country_name, top_sites) VALUES(%s, %s) ON CONFLICT DO NOTHING;", (country_name, top_sites_str))

    def select_records(self, ip=None, region=None, limit=None):
        condition_statements = []
        values = []
        if ip:
            condition_statements.append("user_ip=%s")
            values.append(ip)
        if region:
            condition_statements.append("user_region=%s")
            values.append(region)
        query = f"SELECT * FROM public.PingRecord"
        if len(condition_statements):
            condition = " AND ".join(condition_statements)
            query += f" where {condition}"
        if limit:
            query += f" limit {limit}"
        query += "order by timestamp"
        print(query)
        self.cursor.execute(query, values)
        return self.cursor.fetchall()

    def insert_record(self,timestamp, ip, region, country, ping, availability):
        self.cursor.execute("INSERT INTO public.PingRecord (timestamp, user_ip, user_region, pinged_county, ping, availability) VALUES(%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING;", (timestamp, ip, region, country, ping, availability))

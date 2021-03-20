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
    
    def insert_record(self, country_name, top_sites_str):
        self.cursor.execute("INSERT INTO public.CountryTopSites (country_name, top_sites) VALUES(%s, %s)", (country_name, top_sites_str))

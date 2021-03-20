from database_controller import DatabaseClient

class CountryTopSites:
    def __init__(self, country_name, sites_list):
        self.country_name = country_name
        self.sites_list = sites_list
        self.sites_list.sort()
    
    def save_to_db(self):
        sites_list_string = ';'.join(self.sites_list)
        with DatabaseClient() as db:
            db.insert_record(self.country_name, sites_list_string)
    
    @classmethod
    def get_all_records(self):
        ans = []
        with DatabaseClient() as db:
            rec = db.select_sites_of_all_countries()
        for r in rec:
            ans.append(CountryTopSites(r[0], r[1].split(';')))
        return ans
    
    @classmethod
    def get_record_by_country_name(self, country_name):
        ans = []
        with DatabaseClient() as db:
            r = db.select_sites_by_contry(country_name)
        return CountryTopSites(r[0], r[1].split(';'))
        
            


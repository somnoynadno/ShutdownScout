import json
from flask import Flask, jsonify, request
import threading
from CountryTopSites_model import CountryTopSites

app = Flask(__name__)
db_changing_lock = threading.Lock()


def init_db():
    with open('init_db/web_pool.json', "r") as f:
        top_sites_dict = json.load(f)
    for country in top_sites_dict:
        cts = CountryTopSites(country, top_sites_dict[country])
        cts.save_to_db()

@app.route('/api/web_pool')
def get_countries_top_sites():
    cts_list = CountryTopSites.get_all_records()
    ans = {}
    for cts in cts_list:
        ans[cts.country_name] = cts.sites_list
    return jsonify(ans)

if __name__ == "__main__":
    init_db()
    app.run(port=3113, host='0.0.0.0')

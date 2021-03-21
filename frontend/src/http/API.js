import axios from 'axios'
import {apiAddress} from "../config";

export class API {
    GetIPLookup() {
        return new Promise((resolve, reject) => {
            axios.get(apiAddress + `/ip_lookup`,)
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        })
    }

    GetWebPool() {
        return new Promise((resolve, reject) => {
            axios.get(apiAddress + `/web_pool`,)
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        })
    }

    SendResult(pingResult) {
        return new Promise((resolve, reject) => {
            axios.post(apiAddress + `/send_result`, pingResult)
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        })
    }

    GetLastResults(limit = 5, ip=undefined, region=undefined) {
        if (ip) ip = `&ip=${ip}`;
        if (region) region = `&region=${region}`;
        return new Promise((resolve, reject) => {
            axios.get(apiAddress + `/last_results?limit=${limit}${ip}${region}`)
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        })
    }
}

export const api = new API();

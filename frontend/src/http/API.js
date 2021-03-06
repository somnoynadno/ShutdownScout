import axios from 'axios'
import {apiAddress} from "../config";

export class API {
    GetIPLookup(ip="") {
        let query = ip ? "?ip=" + ip : '';
        return new Promise((resolve, reject) => {
            axios.get(apiAddress + `/ip_lookup${query}`,)
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

    GetProxyList() {
        return new Promise((resolve, reject) => {
            axios.get(apiAddress + `/get_proxy_list`,)
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        })
    }

    SendResult(pingResult, ip) {
        let query = ip ? "?ip=" + ip : '';
        return new Promise((resolve, reject) => {
            axios.post(apiAddress + `/send_result${query}`, pingResult)
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        })
    }

    GetLastResults(limit = 5, region = undefined, ip = undefined) {
        ip = (ip ? `&ip=${ip}` : '');
        region = (region ? `&region=${region}` : '');
        return new Promise((resolve, reject) => {
            axios.get(apiAddress + `/last_results?limit=${limit}${ip}${region}`)
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        })
    }

    GetLastProxyResults(limit = 5, region = undefined, ip = undefined, port = undefined) {
        ip = (ip ? `&ip=${ip}` : '');
        region = (region ? `&region=${region}` : '');
        port = (port ? `&port=${port}` : '');
        return new Promise((resolve, reject) => {
            axios.get(apiAddress + `/last_proxy_results?limit=${limit}${ip}${region}${port}`)
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        })
    }

    Tracert(ip = "8.8.8.8") {
        return new Promise((resolve, reject) => {
            axios.post(apiAddress + `/tracert`, {"Address": ip})
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        })
    }

    PingFromLocal(timeout = 60, sites=[]) {
        return new Promise((resolve, reject) => {
            let data = {"Timeout": timeout};
            if (sites.length > 0) {
                data["Sites"] = sites;
            }
            axios.post(apiAddress + `/ping_from_local`, data)
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        })
    }

    Proxy(ip = "93.184.216.34", port = 80, timeout = 60) {
        return new Promise((resolve, reject) => {
            axios.post(apiAddress + `/proxy`, {"IP": ip, "Port": port, "Timeout": timeout})
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        })
    }
}

export const api = new API();

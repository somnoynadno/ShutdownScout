import axios from 'axios'
import {apiAddress} from "../config";

export class API {
    GetIPLookup(ip = "") {
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

    GetLastResults(limit = undefined, region = undefined, ip = undefined, timestamp = undefined) {
        limit = (limit ? `&limit=${limit}` : '');
        ip = (ip ? `&ip=${ip}` : '');
        region = (region ? `&region=${region}` : '');
        timestamp = (timestamp ? `&timestamp=${timestamp}` : '');

        return new Promise((resolve, reject) => {
            axios.get(apiAddress + `/last_results?${limit}${ip}${region}${timestamp}`)
                .then(response => resolve(response.data))
                .catch(error => reject(error));
        })
    }

    GetLastProxyResults(limit = 5, region = undefined, ip = undefined, port = undefined, timestamp = undefined) {
        limit = (limit ? `&limit=${limit}` : '');
        ip = (ip ? `&ip=${ip}` : '');
        region = (region ? `&region=${region}` : '');
        port = (port ? `&port=${port}` : '');
        timestamp = (timestamp ? `&timestamp=${timestamp}` : '');

        return new Promise((resolve, reject) => {
            axios.get(apiAddress + `/last_proxy_results?${limit}${ip}${region}${port}${timestamp}`)
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

    PingFromLocal(timeout = 60, sites = []) {
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

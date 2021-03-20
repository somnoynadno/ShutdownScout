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
}

export const api = new API();

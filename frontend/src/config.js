export const mapColors = {
    "red": "#f44336",
    "yellow": "#ffeb3b",
    "green": "#4caf50",
}

export const isLocal = process.env.HOST_IP_ADDRESS === "LOCAL";
export const apiAddress = isLocal ? 'http://localhost:3113/api' : "http://scout.somnoynadno.ru/api";

export const maxPingListSize = (process.env.NODE_ENV === "production" ? 500 : 10);

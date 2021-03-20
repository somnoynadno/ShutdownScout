export const apiAddress = "http://scout.somnoynadno.ru/api";

export const mapColors = {
    "red": "#f44336",
    "yellow": "#ffeb3b",
    "green": "#4caf50",
}

export const maxPingListSize = (process.env.NODE_ENV === "production" ? 500 : 10);

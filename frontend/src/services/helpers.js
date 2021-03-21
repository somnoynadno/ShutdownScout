export function groupPingResultsForGeoChart(object = {}, key = "") {
    let result = [];
    result.push(["Country", key]);

    for (const [country, pingResult] of Object.entries(object)) {
        let row = [country];

        for (const [k, v] of Object.entries(pingResult)) {
            if (k === key) {
                row.push(v);
            }
        }
        result.push(row);
    }

    return result;
}

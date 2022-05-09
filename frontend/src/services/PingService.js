const MAX_TIMEOUT = 3000;

export async function getPingStats(countryPool) {
    return new Promise(resolve => {
        let isAvailable = 0;
        let pingAverage = 0;

        let promises = [];
        for (let host of countryPool) {
            promises.push(pingUsingOptions(`https://${host}/`));
            //promises.push(pingUsingImage(`http://${host}/favicon.ico`));
        }

        Promise.all(promises).then((res) => {
            for (let r of res) {
                if (r > 0) {
                    pingAverage += r;
                    isAvailable++;
                }
            }

            let availability = Math.round(isAvailable / countryPool.length * 100) / 100;
            if (isAvailable > 0) {
                pingAverage = Math.round(pingAverage / isAvailable);
            }

            if (pingAverage === 0) pingAverage = MAX_TIMEOUT;
            resolve({"Ping": pingAverage, "Availability": availability});
        });
    })
}

function requestImage(url) {
    return new Promise(function (resolve, reject) {
        let img = new Image();
        img.onload = function () {
            resolve(img);
        };
        img.onerror = function (err) {
            reject(err);
        };
        img.src = url + '?random-no-cache=' + Math.floor((1 + Math.random()) * 0x10000).toString(16);
        setTimeout(() => reject(new Error("Timeout")), MAX_TIMEOUT);
    });
}

function requestOptions(url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open("OPTIONS", url);

        xhr.setRequestHeader("Access-Control-Request-Method", "POST");
        xhr.setRequestHeader("Access-Control-Request-Headers", "content-type");
        //xhr.setRequestHeader("Origin", "https://reqbin.com");

        xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            //console.log(xhr.status);
            resolve(xhr.responseText);
        }};

        xhr.send();
        setTimeout(() => reject(new Error("Timeout")), MAX_TIMEOUT);
    });
}

function pingUsingOptions(url, multiplier = 1) {

    return new Promise(function (resolve, reject) {
        let start = (new Date()).getTime();
        let response = function () {
            let delta = ((new Date()).getTime() - start);
            delta *= multiplier;
            resolve(delta);
        };

        requestOptions(url).then(() => {
            response()
        }).catch(() => {
            resolve(-1);
        });

        setTimeout(function () {
            resolve(-1);
        }, MAX_TIMEOUT);
    });
}

function pingUsingImage(url, multiplier = 1) {
    return new Promise(function (resolve, reject) {
        let start = (new Date()).getTime();
        let response = function () {
            let delta = ((new Date()).getTime() - start);
            delta *= multiplier;
            resolve(delta);
        };

        requestImage(url).then(() => {
            response()
        }).catch(() => {
            resolve(-1);
        });

        setTimeout(function () {
            resolve(-1);
        }, MAX_TIMEOUT);
    });
}

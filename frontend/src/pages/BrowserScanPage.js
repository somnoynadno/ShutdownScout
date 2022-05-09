import React, {useCallback, useEffect, useState} from "react";
import {Box, Button, Center, Heading, Link, Progress, Text} from "@chakra-ui/react"
import {api} from "../http/API";
import {getPingStats} from "../services/PingService";
import {PingResultPage} from "./PingResultPage";
import {AdviceAlert} from "../components/AdviceAlert";
import {useBreakpointValue} from "@chakra-ui/media-query";
import {fadeIn} from 'react-animations';
import {css, StyleSheet} from 'aphrodite';


export const BrowserScanPage = () => {
    let [webPool, setWebPool] = useState({});
    let [lookup, setLookup] = useState(null);

    let [pingResult, setPingResult] = useState({});
    let [currentCountry, setCurrentCountry] = useState("");
    let [progress, setProgress] = useState(0);

    let [isProcessing, setIsProcessing] = useState(false);
    let [isReady, setIsReady] = useState(false);

    const adaptiveW = useBreakpointValue({base: "100%", xl: "65%", lg: "75%", md: "85%"});

    const updateResult = useCallback((country, result, duration) => {
        pingResult[country] = result;
        setPingResult(pingResult);

        let k = Object.keys(pingResult).length / Object.keys(webPool).length * 100;
        setProgress(k);

        if (k === 100) {
            setIsProcessing(false);
            setIsReady(true);

            api.SendResult(pingResult, lookup["IP"], duration)
                .then((res) => console.log(`Result saved: ${res}`))
                .catch((err) => console.log(err));
        }
    }, [lookup, pingResult, webPool]);

    const pingWebPool = async () => {
        setIsProcessing(true);
        //let start = (new Date()).getTime();

        for (let [country, list] of Object.entries(webPool)) {
            list = list.slice(0, 10);
            let res = await getPingStats(list);
            let duration = 100;

            setCurrentCountry(country);
            updateResult(country, res, duration);
            console.log(country, res);
        }
        //let deltaMilliseconds = ((new Date()).getTime() - start);
    }

    useEffect(() => {
        api.GetWebPool().then((res) => {
            let p = {};
            let i = 0;
            for (const [country, list] of Object.entries(res)) {
                p[country] = list;
                // if (++i > maxPingListSize) {
                //     break;
                // }
                if (++i > 2) {
                    break;
                }
            }
            setWebPool(p);
        }).catch((err) => {
            console.log(err);
        })

        api.GetIPLookup().then((res) => {
            console.log(res);
            setLookup(res);
        })
    }, []);

    return (
        <Box>
            <Center>
                <Box w={adaptiveW}>
                    {!isProcessing && !isReady ?
                        <Center>
                            <Box>
                                <Box maxW={"24em"}>
                                    <Text className={css(styles.fadeIn1)} align={"center"}>
                                        Вы в шаге от того, чтобы начать сканирование доступности веб-ресурсов из своей
                                        сети.
                                    </Text>
                                    <Text className={css(styles.fadeIn2)} align={"center"}>
                                        Мы делаем это средствами Вашего браузера, поэтом процесс может быть долгим
                                        (пора запастись чаем!) и несколько неточным.
                                    </Text>
                                    <Text className={css(styles.fadeIn3)} align={"center"}>
                                        Если вы хотите улучшить результат, скачайте и запустите версию <Link
                                        href="https://github.com/somnoynadno/ShutdownScout" color={"blue.500"}>Shutdown
                                        Scout</Link> на своей локальной машине.
                                    </Text>
                                    {lookup ?
                                        <Center mt={2}>
                                            <Box className={css(styles.fadeIn2)} m={4}>
                                                <Text color="gray">IP-адрес: {lookup["ip"]}</Text>
                                                <Text
                                                    color="gray">Местоположение: {lookup["country_name"]}, {lookup["city"]}</Text>
                                                <br/>
                                                <Button disabled={webPool === {} || isProcessing} size={"lg"}
                                                        colorScheme={"blue"}
                                                        onClick={() => pingWebPool()}>Начать сканирование</Button>
                                            </Box>
                                        </Center> : ''}
                                </Box>
                            </Box>
                        </Center> : ''
                    }
                    {isProcessing &&
                    <Center>
                        <Box w={adaptiveW}>
                            <br/>
                            <Heading size={"md"} align={"center"}>Текущая страна: {currentCountry}</Heading>
                            <br/>
                            <Text align={"center"} mb={2}>
                                Не переключайте
                                вкладку{adaptiveW !== "100%" && ' для более точного результата'}.
                            </Text>
                            <Progress value={progress}/>
                            <br/>
                            <AdviceAlert/>
                        </Box>
                    </Center>
                    }
                </Box>
            </Center>
            {
                (isReady ? <PingResultPage proxyUsed={false} lookup={lookup} result={pingResult}/> : '')
            }
        </Box>
    )
}


const styles = StyleSheet.create({
    fadeIn1: {
        animationName: fadeIn,
        animationDuration: '0.5s'
    },
    fadeIn2: {
        animationName: fadeIn,
        animationDuration: '1s'
    },
    fadeIn3: {
        animationName: fadeIn,
        animationDuration: '2s'
    },
})

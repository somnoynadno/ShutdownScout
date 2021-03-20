import React, {useCallback, useEffect, useState} from "react";
import {Box, Button, Center, Heading, Progress, Text} from "@chakra-ui/react"
import {api} from "../http/API";
import {getPingStats} from "../services/PingService";
import {PingResultPage} from "./PingResultPage";
import {maxPingListSize} from "../config";


export const IndexPage = () => {
    let [webPool, setWebPool] = useState({});
    let [lookup, setLookup] = useState({});

    let [pingResult, setPingResult] = useState({});
    let [currentCountry, setCurrentCountry] = useState("");
    let [progress, setProgress] = useState(0);

    let [isProcessing, setIsProcessing] = useState(false);
    let [isReady, setIsReady] = useState(false);

    const updateResult = useCallback((country, result) => {
        pingResult[country] = result;
        setPingResult(pingResult);

        let k = Object.keys(pingResult).length / Object.keys(webPool).length * 100;
        setProgress(k);

        if (k === 100) {
            setIsProcessing(false);
            setIsReady(true);

            api.SendResult(pingResult)
                .then((res) => console.log("Result saved"))
                .catch((err) => console.log(err));
        }
    }, [pingResult, webPool])

    const pingWebPool = async () => {
        setIsProcessing(true);
        for (let [country, list] of Object.entries(webPool)) {
            list = list.slice(0, 10);
            let res = await getPingStats(list);

            setCurrentCountry(country);
            updateResult(country, res);
            console.log(country, res);
        }
    }

    useEffect(() => {
        api.GetWebPool().then((res) => {
            let p = {};
            let i = 0;
            for (const [country, list] of Object.entries(res)) {
                p[country] = list;
                if (++i > maxPingListSize) {
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
                <Box w="500px">
                    {!isProcessing && !isReady ?
                        <Center>
                            <Box>
                                {lookup ? <Box>
                                    <Text align="center">IP-адрес: {lookup["ip"]}</Text>
                                    <Text align="center">Местоположение: {lookup["country_name"]}, {lookup["city"]}</Text>
                                    <Text align="center">Часовой пояс: {lookup["timezone"]} ({lookup["utc_offset"]})</Text>
                                    <Text align="center">Геометка: {lookup["longitude"]}, {lookup["latitude"]}</Text>
                                    <br/>
                                </Box> : ''}
                                <Button disabled={webPool === {} || isProcessing} size={"lg"}
                                        onClick={() => pingWebPool()}>Начать сканирование</Button>
                            </Box>
                        </Center> : ''
                    }
                    {isProcessing ?
                        <Box>
                            <br/>
                            <Heading size={"md"} align={"center"}>Текущая страна: {currentCountry}</Heading>
                            <br/>
                            <Text align={"center"}>
                                Это не быстрый процесс: можете сходить перекусить.
                            </Text>
                            <Text align={"center"}>
                                Мы стараемся не сжечь Ваш компьютер =)
                            </Text>
                            <br/>
                            <Progress value={progress}/>
                            <br/>
                            <Text align={"center"} color="gray.300">
                                P.S. Желательно не переключать данную вкладку
                            </Text>
                        </Box> : ''
                    }
                </Box>
            </Center>
            {
                (isReady ? <PingResultPage result={pingResult}/> : '')
            }
        </Box>
    )
}

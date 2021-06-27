import React, {useState} from "react";
import {Alert, AlertIcon, Box, Button, Center, Heading, Progress, Text} from "@chakra-ui/react"
import {api} from "../http/API";
import {PingResultPage} from "./PingResultPage";
import {AdviceAlert} from "../components/AdviceAlert";
import {useBreakpointValue} from "@chakra-ui/media-query";
import {fadeIn} from 'react-animations';
import {css, StyleSheet} from 'aphrodite';


export const LocalScanPage = () => {
    const lookup = {
        "ip": "127.0.0.1",
        "region_name": "[Unknown]",
        "country_name": "[Unknown]",
        "city": "[Unknown]",
        "time_zone": "[Unknown]",
        "latitude": 0,
        "longitude": 0,
    }

    let [pingResult, setPingResult] = useState({});
    let [errorText, setErrorText] = useState("");

    let [isProcessing, setIsProcessing] = useState(false);
    let [isReady, setIsReady] = useState(false);

    const adaptiveW = useBreakpointValue({base: "100%", xl: "65%", lg: "75%", md: "85%"});

    const pingWebPool = async () => {
        setIsProcessing(true);

        await api.PingFromLocal(60).then((res) => {
            setPingResult(res);
            setIsReady(true);
        }).catch((err) => setErrorText("Произошла непредвиденная ошибка, попробуйте позже."));

        setIsProcessing(false);
    }

    return (
        <Box>
            <Center>
                {errorText && <Alert status="error" mb={4}>
                    <AlertIcon/>
                    {errorText}
                </Alert>}

                <Box w={adaptiveW}>
                    {!isProcessing && !isReady ?
                        <Center>
                            <Box>
                                <Box maxW={"24em"}>
                                    <Text className={css(styles.fadeIn1)} align={"center"}>
                                        Мы обнаружили, что Вы развернули наш сервис на собственной машине.
                                    </Text>
                                    <Text className={css(styles.fadeIn2)} align={"center"}>
                                        Теперь любое Ваше сканирование будет более быстрым и точным.
                                    </Text>
                                    <Text className={css(styles.fadeIn3)} align={"center"}>
                                        Спасибо за доверие к сервису.
                                    </Text>
                                    {lookup ?
                                        <Center mt={2}>
                                            <Box className={css(styles.fadeIn2)} m={4}>
                                                <Text color="gray">IP-адрес: {lookup["ip"]}</Text>
                                                <Text
                                                    color="gray">Местоположение: {lookup["country_name"]}</Text>
                                                <br/>
                                                <Button size={"lg"}
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
                            <Heading size={"md"} align={"center"}>Сканируем сеть</Heading>
                            <br/>
                            <Text align={"center"} mb={2}>
                                Займёт буквально минуту...
                            </Text>
                            <Progress isIndeterminate/>
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

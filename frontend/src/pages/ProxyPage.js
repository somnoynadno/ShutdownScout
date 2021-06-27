import React, {useEffect, useState} from "react";
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Center,
    Heading,
    HStack,
    Input,
    Progress,
    Table,
    TableCaption,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr
} from "@chakra-ui/react"
import {api} from "../http/API";
import {useBreakpointValue} from "@chakra-ui/media-query";
import {CheckIcon, SearchIcon} from '@chakra-ui/icons'
import {PingResultPage} from "./PingResultPage";
import {AdviceAlert} from "../components/AdviceAlert";
import {fadeIn} from 'react-animations';
import {css, StyleSheet} from 'aphrodite';



export const ProxyPage = () => {
    const timeout = 60;

    let [isProcessing, setIsProcessing] = useState(false);
    let [isReady, setIsReady] = useState(false);

    let [progress, setProgress] = useState(0);
    let [lookup, setLookup] = useState({});
    let [pingResult, setPingResult] = useState({});
    let [proxyList, setProxyList] = useState([]);
    let [proxyAddress, setProxyAddress] = useState("");
    let [errorText, setErrorText] = useState("");

    const adaptiveSize = useBreakpointValue({base: "sm", xl: "lg", lg: "md", md: "md"});
    const adaptiveW = useBreakpointValue({base: "100%", xl: "65%", lg: "75%", md: "85%"});

    const tryProxy = async () => {
        setErrorText('');
        setIsReady(false);

        let split = proxyAddress.split(':');
        if (split.length !== 2) {
            setErrorText("Неверный адрес сервера");
            return
        }

        let ip = split[0];
        let port = parseInt(split[1]);

        if (!port) {
            setErrorText("Неверный порт");
            return;
        }

        setIsProcessing(true);
        setProgress(0);

        let tick = 0;
        let t = setInterval(() => {
            setProgress(tick++);
        }, 1000)

        api.GetIPLookup(ip).then((res) => {
            setLookup(res);
        }).catch((err) => console.log(err));

        await api.Proxy(ip, port, timeout).then((res) => {
            setPingResult(res);
            setIsReady(true);
        }).catch((err) => {
            console.log(err);
            setErrorText("К сожалению, результат не был получен, попробуйте другой адрес");
        });

        clearInterval(t);
        setIsProcessing(false);
    };

    const tryAnotherProxy = async () => {
        setErrorText('');
        setIsReady(false);
        setProxyAddress('');
        setLookup({});
        setPingResult({});
    }

    useEffect(() => {
        api.GetProxyList().then((res) => {
            setProxyList(res);
            if (res.length === 0) {
                setErrorText("Сейчас все сервера плохие, попробуйте позже")
            }
        }).catch(err => setErrorText("Не удалось получить список прокси-серверов"))
    }, [setProxyList]);

    return (
        <Box>
            <Center>
                <Box w={adaptiveW}>
                    {errorText && <Alert status="error">
                        <AlertIcon/>
                        {errorText}
                    </Alert>}
                    <HStack mb={isReady ? 4 : 12} mt={isReady ? 1 : 4} justify={"center"} >
                        <Input value={proxyAddress} onChange={(event) => setProxyAddress(event.target.value)}
                               style={styles.inputStyle} size={adaptiveSize} w={adaptiveW}
                               placeholder="Адрес прокси-сервера (IP:порт)"/>
                        <Button size={adaptiveSize} leftIcon={adaptiveSize !== "sm" ? <SearchIcon/> : ''}
                                colorScheme="blue" onClick={() => tryProxy()} disabled={isProcessing}>
                            Проверить
                        </Button>
                    </HStack>
                    {isReady && <Box>
                        <PingResultPage proxyUsed={true} lookup={lookup} result={pingResult}/>
                        <Button onClick={() => tryAnotherProxy()}>Попробовать другой сервер</Button>
                    </Box>
                    }
                    {isProcessing && <Center>
                        <Box w={adaptiveW}>
                            <Center>
                                <Text mb={2} colorScheme="gray">Проверяем этот сервер{adaptiveSize !== "sm" ? `, это займёт примерно ${timeout} секунд` : ''}...</Text>
                            </Center>
                            <Progress mb={3} value={progress}/>
                            <AdviceAlert/>
                        </Box>
                    </Center>
                    }
                    {!isReady && !isProcessing && <Box>
                        {
                            (proxyList.length > 0) ? <Box>
                                    <Center>
                                        <Heading mb={4} size={adaptiveSize}>Подобрали для Вас лучшие
                                            прокси-серверы</Heading>
                                    </Center>
                                    <Table style={styles.tableStyle} size={adaptiveSize} variant="striped"
                                           colorScheme="blue">
                                        <TableCaption>Таблица только что проверенных прокси-серверов</TableCaption>
                                        <Thead>
                                            <Tr>
                                                {adaptiveSize !== "sm" ? <Th>Протокол</Th> : ''}
                                                <Th>IP</Th>
                                                <Th>Порт</Th>
                                                <Th>Страна</Th>
                                                <Th/>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {proxyList.map((p, i) => {
                                                return <Tr className={css(styles.fadeIn)} key={i}>
                                                    {adaptiveSize !== "sm" ? <Td>HTTP/HTTPS</Td> : ''}
                                                    <Td>{p["IP"]}</Td>
                                                    <Td>{p["Port"]}</Td>
                                                    <Td>{p["Country"]}</Td>
                                                    <Td>
                                                        <Button size="sm" leftIcon={<CheckIcon/>}
                                                                colorScheme="green" variant="solid"
                                                                onClick={() => setProxyAddress(`${p["IP"]}:${p["Port"]}`)}>
                                                            {adaptiveSize !== "sm" ? "Выбрать" : ""}
                                                        </Button>
                                                    </Td>
                                                </Tr>
                                            })}
                                        </Tbody>
                                    </Table>
                                </Box> :
                                <Box className={css(styles.fadeIn)}>
                                    <Progress mb={3} isIndeterminate/>
                                    <Text align="center" colorScheme="gray">Загружаем для Вас наши лучшие прокси, подождите...</Text>
                                </Box>
                        }
                    </Box>
                    }
                </Box>
            </Center>
        </Box>
    )
}

const styles = StyleSheet.create({
    tableStyle: {
        maxWidth: 800,
    },
    inputStyle: {
        maxWidth: 450,
    },
    fadeIn: {
        animationName: fadeIn,
        animationDuration: '2s'
    },
});

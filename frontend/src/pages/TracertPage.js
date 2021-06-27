import React, {useState} from "react";
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Center,
    Divider,
    Heading,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Progress,
    Table,
    TableCaption,
    Tbody,
    Td,
    Text,
    Textarea,
    Th,
    Thead,
    Tr,
    useDisclosure,
    VStack
} from "@chakra-ui/react";
import {CheckIcon, CloseIcon, SearchIcon, ViewIcon} from '@chakra-ui/icons';
import {api} from "../http/API";
import {fadeIn} from 'react-animations';
import {css, StyleSheet} from 'aphrodite';
import {useBreakpointValue} from "@chakra-ui/media-query";
import Chart from "react-google-charts";


export const TracertPage = () => {
    let [lookup, setLookup] = useState(null);
    let [address, setAddress] = useState("");
    let [resources, setResources] = useState("");
    let [pingResult, setPingResult] = useState(null);
    let [errorText, setErrorText] = useState("");

    let [traceRoute, setTraceRoute] = useState([]);
    let [traceCoordinates, setTraceCoordinates] = useState([]);
    let [isProcessing, setIsProcessing] = useState(false);
    let [pingIsProcessing, setPingIsProcessing] = useState(false);

    const adaptiveSize = useBreakpointValue({base: "sm", xl: "lg", lg: "md", md: "md"});
    const adaptiveW = useBreakpointValue({base: "100%", xl: "65%", lg: "75%", md: "85%"});

    const lookupDisclosure = useDisclosure();
    const isLookupOpen = lookupDisclosure.isOpen;
    const onOpenLookup =  lookupDisclosure.onOpen;
    const onCloseLookup = lookupDisclosure.onClose;

    let {isOpen, onOpen, onClose} = useDisclosure();

    const pingMultiple = async () => {
        setPingIsProcessing(true);
        setErrorText("");

        let sites = resources.split('\n');
        await api.PingFromLocal(60, sites).then((res) => {
            setPingResult(res);
        }).catch((err) => setErrorText("Произошла непредвиденная ошибка, попробуйте позже."));

        setPingIsProcessing(false);
    }

    const makeLookup = async (address) => {
        setErrorText("");

        api.GetIPLookup(address).then((res) => {
            setLookup(res);
            onOpenLookup();
        });
    }

    const tracert = async () => {
        setErrorText("");
        setTraceCoordinates([]);
        setTraceRoute([]);
        setIsProcessing(true);

        await api.Tracert(address).then((res) => {
            let coords = [['Lat', "Long", 'Номер узла']];
            for (let i = 0; i < res.length; i++) {
                const t = res[i];
                if (t) {
                    const lat = t["Info"]["latitude"];
                    const long = t["Info"]["longitude"];
                    if (lat && long) {
                        coords.push([lat, long, i]);
                    }
                }
            }

            if (coords.length > 1) {
                setTraceCoordinates(coords);
            } else {
                setErrorText("Не удалось получить ни одной координаты на пути к ресурсу");
            }

            setTraceRoute(res);
        }).catch((err) => setErrorText("К сожалению, мы не смогли построить маршрут до этого адреса."));

        setIsProcessing(false);
    }

    return <Center>
        <Box w={adaptiveW}>
            {errorText && <Alert status="error" mb={4}>
                <AlertIcon/>
                {errorText}
            </Alert>}

            <Heading size="lg">Построение маршрута</Heading>
            <HStack mb={4} mt={4} justify={"center"}>
                <Input value={address} onChange={(event) => setAddress(event.target.value)}
                       style={styles.inputStyle} size={adaptiveSize} w={adaptiveW}
                       placeholder="Адрес сервера в формате tsu.ru или 34.120.177.193"/>
                <Button size={adaptiveSize} leftIcon={adaptiveSize !== "sm" ? <SearchIcon/> : ''}
                        colorScheme="blue" onClick={() => tracert()} disabled={isProcessing}>
                    Начать
                </Button>
            </HStack>

            {isProcessing && <Center>
                <Box w={adaptiveW}>
                    <Center>
                        <Text mb={2} colorScheme="gray">Трассируем
                            пакет{adaptiveSize !== "sm" ? `, это займёт пару минут` : ''}...</Text>
                    </Center>
                    <Progress mb={3} isIndeterminate/>
                </Box>
            </Center>
            }

            <Center mb={4}>
                {traceRoute.length > 0 && <VStack className={css(styles.fadeIn)}>
                    <Chart
                        width={'500px'}
                        height={'300px'}
                        chartType="GeoChart"
                        data={traceCoordinates}
                        options={{
                            sizeAxis: {minValue: 0, maxValue: 100},
                            colorAxis: {colors: ['#4374e0', '#e7711c']}, // blue to orange
                            tooltip: {textStyle: {color: '#444444'}}
                        }}
                    />
                    <Button onClick={onOpen}>Полный путь</Button>
                </VStack>}
            </Center>

            <Divider mb={6}/>

            <Heading size="lg" mb={4}>Пинг списка ресурсов</Heading>
            <VStack className={css(styles.fadeIn)} mb={4} mt={4} justify={"center"}>
                <Textarea
                    value={resources}
                    onChange={(event) => setResources(event.target.value)}
                    placeholder="Построчно введите веб-ресурсы, которые вы хотите проверить (например, yandex.ru или 8.8.8.8)"
                    size={adaptiveSize} w={adaptiveW}
                />
                <Text color="gray" align="center">
                    <i>Обратите внимание, что пинг происходит из внутренней сети сервера, где развёрнуто приложение.
                        Для Вашей локальной сети результат может сильно отличаться.</i>
                </Text>
                <Button onClick={pingMultiple} colorScheme="blue" size={"lg"} mt={4} disabled={pingIsProcessing}>
                    Проверить
                </Button>
            </VStack>
            <Table className={css(styles.fadeInLong)} size={adaptiveSize} variant="striped" colorScheme="blue">
                <TableCaption placement={"top"}>Результаты пинга в формате таблицы</TableCaption>
                <Thead>
                    <Tr>
                        <Th>Адрес</Th>
                        <Th isNumeric>Доступность</Th>
                        <Th isNumeric>Пинг</Th>
                        <Th/>
                    </Tr>
                </Thead>
                <Tbody>
                    {pingResult && Object.entries(pingResult).map((obj, i) => {
                        let address = obj[0];
                        let p = obj[1];
                        return <Tr className={css(styles.fadeIn)} key={i}>
                            <Td>{address}</Td>
                            <Td isNumeric>{p["Availability"] !== 0 ? <CheckIcon color="green"/> :
                                <CloseIcon color="red"/>}</Td>
                            <Td isNumeric>{p["Availability"] !== 0 ? p["Ping"] : '-'}</Td>
                            <Td>
                                <Button size="sm" leftIcon={<ViewIcon/>}
                                        colorScheme="blue" variant="solid" onClick={() => {
                                            makeLookup(address);
                                }}>
                                    {adaptiveSize !== "sm" ? "Подробнее" : ""}
                                </Button>
                            </Td>
                        </Tr>
                    })}
                </Tbody>
            </Table>
        </Box>

        {/*Full traceroute modal*/}
        <Modal size={"4xl"} isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Подробная маршрутизация</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Table size={"sm"} className={css(styles.fadeInLong)} variant="striped"
                           colorScheme="blue">
                        <TableCaption>Путешествие пакета по магистральным маршрутизаторам</TableCaption>
                        <Thead>
                            <Tr>
                                <Th>IP</Th>
                                <Th>Местоположение</Th>
                                {adaptiveSize !== "sm" && <Th>Часовой пояс</Th>}
                                {adaptiveSize !== "sm" && <Th>Геометка</Th>}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {traceRoute.map((t, i) => {
                                if (t && t.IP) {
                                    return <Tr className={css(styles.fadeIn)} key={i}>
                                        <Td>{t["Info"]?.ip}</Td>
                                        <Td>{t["Info"]?.country_name}{t["Info"]?.city && `, ${t["Info"]?.city}`}</Td>
                                        {adaptiveSize !== "sm" && <Td>{t["Info"]?.time_zone}</Td>}
                                        {adaptiveSize !== "sm" &&
                                        <Td>({t["Info"]?.latitude}, {t["Info"]?.longitude})</Td>}
                                    </Tr>
                                } else return '';
                            })}
                        </Tbody>
                    </Table>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={onClose}>
                        Закрыть
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>

        {/*Lookup modal*/}
        <Modal isOpen={isLookupOpen} onClose={onCloseLookup}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Подробности</ModalHeader>
                <ModalCloseButton/>
                    {lookup && <ModalBody>
                        <Box className={css(styles.fadeIn)} m={4}>
                            <Text>IP-адрес: {lookup["ip"]}</Text>
                            <Text>Местоположение: {lookup["country_name"]}, {lookup["city"]}</Text>
                            <Text>Часвой пояс: {lookup["time_zone"]}</Text>
                            <Text>Координаты: ({lookup["latitude"]}, {lookup["longitude"]})</Text>
                            <br/>
                            <Button onClick={() => {
                                setAddress(lookup.ip);
                                onCloseLookup();
                            }}>Построить маршрут</Button>
                        </Box>
                    </ModalBody>
                    }
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={onCloseLookup}>
                        Закрыть
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </Center>
}

const styles = StyleSheet.create({
    fadeIn: {
        animationName: fadeIn,
        animationDuration: '1.5s'
    },
    fadeInLong: {
        animationName: fadeIn,
        animationDuration: '3s'
    }
})

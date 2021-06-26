import React, {useEffect, useState} from "react";
import {
    Alert,
    AlertIcon,
    Box,
    Button,
    Center,
    Divider,
    Heading,
    Link,
    Stack, Table,
    TableCaption, Tbody, Td,
    Text,
    Textarea, Th, Thead, Tr
} from "@chakra-ui/react";
import {ArrowRightIcon, CheckIcon, CloseIcon, SearchIcon} from '@chakra-ui/icons';
import history from "../history";
import {api} from "../http/API";
import {fadeIn} from 'react-animations';
import {css, StyleSheet} from 'aphrodite';
import {useBreakpointValue} from "@chakra-ui/media-query";


export const TracertPage = () => {
    let [resources, setResources] = useState("");
    let [pingResult, setPingResult] = useState(null);
    let [errorText, setErrorText] = useState("");

    const adaptiveSize = useBreakpointValue({base: "sm", xl: "lg", lg: "md", md: "md"});
    const adaptiveW = useBreakpointValue({base: "100%", xl: "65%", lg: "75%", md: "85%"});

    const pingMultiple = () => {
        let sites = resources.split('\n');
        api.PingFromLocal(60, sites).then((res) => {
            setPingResult(res);
        }).catch((err) => setErrorText("Произошла ошибка, попробуйте позже."));
    }

    return <Center>
        <Box w={adaptiveW}>
            {errorText && <Alert status="error">
                <AlertIcon/>
                {errorText}
            </Alert>}
            <Heading size="lg" mb={4}>Построение маршрута</Heading>
            <Text>В разработке</Text>
            <Divider mb={6}/>

            <Heading size="lg" mb={4}>Пинг списка ресурсов</Heading>
            <Textarea
                value={resources}
                onChange={(event) => setResources(event.target.value)}
                placeholder="Построчно введите веб-ресурсы, которые вы хотите проверить (например, yandex.ru или 8.8.8.8)"
                size={adaptiveSize}
            />
            <Text color="gray">
                <i>Обратите внимание, что пинг происходит из внутренней сети сервера, где развёрнуто приложение.
                    Для Вашей локальной сети результат может сильно отличаться.</i>
            </Text>
            <Center>
            <Button onClick={pingMultiple} colorScheme="blue" size={"lg"} mt={4}>
                Проверить
            </Button>
            </Center>
            <Table size={adaptiveSize} variant="striped" colorScheme="blue">
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
                            <Td isNumeric>{p["Availability"] !== 0 ? <CheckIcon color="green" /> : <CloseIcon color="red" />}</Td>
                            <Td isNumeric>{p["Availability"] !== 0 ? p["Ping"] : '-'}</Td>
                            <Td>
                                <Button size="sm" leftIcon={<SearchIcon/>}
                                        colorScheme="blue" variant="solid" disabled>
                                    {adaptiveSize !== "sm" ? "Подробнее" : ""}
                                </Button>
                            </Td>
                        </Tr>
                    })}
                </Tbody>
            </Table>
        </Box>
    </Center>
}

const styles = StyleSheet.create({
    fadeIn: {
        animationName: fadeIn,
        animationDuration: '1.5s'
    }
})

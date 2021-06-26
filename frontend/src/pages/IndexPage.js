import React, {useEffect, useState} from "react";
import {
    Box,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Center,
    Heading, Text, Button,
    Divider,
    Link, Stack, Flex
} from "@chakra-ui/react";
import {ArrowRightIcon} from '@chakra-ui/icons';
import history from "../history";
import {api} from "../http/API";
import {maxPingListSize} from "../config";



export const IndexPage = () => {
    let [lookup, setLookup] = useState({});

    useEffect(() => {
        api.GetIPLookup().then((res) => {
            setLookup(res);
        })
    }, []);

    return <>
        <Box maxW="52rem">
        <Heading mb={4}>Проблемы с доступом к сайтам?</Heading>
        <Text fontSize="xl" mb={4}>
            Многие интернет-провайдеры блокируют доступ к определённым интернет-ресурсам, а сайты ограничивают доступ к ним из определённых регионов.
        </Text>
        <Text fontSize="xl" mb={4}>
            К сожалению, с развитием технологий и ежегодным ростом числа веб-сайтов эта ситуация только ухудшается.
        </Text>
            <Divider variant="dashed" colorScheme="gray" mb={6}/>

            <Stack direction={"row"} align={"left"} mb={4}>
                <Heading color="black.900" size="lg">Что такое</Heading>
                <Heading color="black.700" size="lg">Shutdown</Heading>
                <Heading color="blue.500" size="lg">Scout</Heading>
            </Stack>
            <Text fontSize="xl" mb={4}>
                <strong>Shutdown Scout</strong> — это комплексное решение по обнаружению и обходу такого рода блокировок и ограничений.
            </Text>
            <Text fontSize="xl" mb={4} pl={6}>
                <ol>
                    <li>Оцените доступность наиболее популярных веб-ресурсов из вашей локальной сети.</li>
                    <li>Подберите прокси-сервер для снятия ограничений вашей точки доступа.</li>
                    <li>Проверьте качество выбранного вами прокси-сервера.</li>
                    <li>Установите выбранный прокси в настройках вашего браузера или ОС.</li>
                </ol>
            </Text>
            <Divider variant="dashed" colorScheme="gray" mb={6}/>
            <Heading size="lg" mb={4}>Мы выступаем за приватность</Heading>
            <Text fontSize="xl" mb={4}>
                Ваша конфиденциальность — это наша ценность.
                </Text>
            <Text fontSize="xl" mb={4}>
            Сервис не собирает о вас никакой дополнительной информации,
                кроме общедоступной: вашего публичного IP-адреса ({lookup["ip"]}),
                региона точки доступа ({lookup["country_name"]},{lookup["city"]}),
                часового пояса ({lookup["timezone"]} {lookup["utc_offset"]})
                и геометки ({lookup["longitude"]}, {lookup["latitude"]}).
            </Text>
            <Text fontSize="xl" mb={4} color="gray">
                <i>Когда вы начнёте использовать прокси-сервер, эти данные будут подменены.</i>
            </Text>
            <Text fontSize="xl" mb={4}>
                Наш проект имеет полностью <Link color="blue.500" href='https://github.com/somnoynadno/ShutdownScout'>открытый исходный код</Link>, и вы можете внести свой вклад в его дальнейшее развитие.
            </Text>
        </Box>
        <Center>
            <Button onClick={() => history.push('/scan')} size="lg" colorScheme="green" mt={6} mb={6} rightIcon={<ArrowRightIcon/>}>
                Перейти к сканированию
            </Button>
        </Center>
        </>
}


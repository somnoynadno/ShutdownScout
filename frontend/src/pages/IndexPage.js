import React, {useEffect, useState} from "react";
import {Box, Button, Center, Divider, Heading, Link, Stack, Text} from "@chakra-ui/react";
import {ArrowRightIcon} from '@chakra-ui/icons';
import history from "../history";
import {api} from "../http/API";
import {fadeIn} from 'react-animations';
import {css, StyleSheet} from 'aphrodite';
import {isLocal} from "../config";


export const IndexPage = () => {
    let [lookup, setLookup] = useState({});

    useEffect(() => {
        if (!isLocal) {
            api.GetIPLookup().then((res) => {
                setLookup(res);
            });
        }
    }, [isLocal]);

    return <>
        <Box maxW="52rem">
            <Heading mb={4}>Проблемы с доступом к сайтам?</Heading>
            <Text className={css(styles.fadeIn)} fontSize="xl" mb={4}>
                Многие интернет-провайдеры блокируют доступ к определённым интернет-ресурсам, а сайты ограничивают
                доступ к ним из определённых регионов.
            </Text>
            <Text className={css(styles.fadeIn)} fontSize="xl" mb={4}>
                К сожалению, с развитием технологий и ежегодным ростом числа веб-сайтов эта ситуация только ухудшается.
            </Text>
            <Divider variant="dashed" colorScheme="gray" mb={6}/>

            <Stack direction={"row"} align={"left"} mb={4}>
                <Heading color="black.900" size="lg">Что такое</Heading>
                <Heading color="black.700" size="lg">Shutdown</Heading>
                <Heading color="blue.500" size="lg">Scout</Heading>
            </Stack>
            <Text className={css(styles.fadeIn)} fontSize="xl" mb={4}>
                <strong>Shutdown Scout</strong> — это комплексное решение по обнаружению и обходу такого рода блокировок
                и ограничений.
            </Text>
            <Text className={css(styles.fadeIn)} fontSize="xl" mb={4} pl={6}>
                <ol>
                    <li><Link onClick={() => history.push('/scan')}>Оцените доступность</Link> наиболее популярных веб-ресурсов из вашей локальной сети.</li>
                    <li><Link onClick={() => history.push('/proxy')}>Подберите прокси-сервер</Link> для снятия ограничений вашей точки доступа.</li>
                    <li><Link onClick={() => history.push('/trace')}>Проверьте качество</Link> выбранного вами прокси-сервера.</li>
                    <li>Установите выбранный прокси в настройках вашего браузера или ОС.</li>
                </ol>
            </Text>
            <Divider variant="dashed" colorScheme="gray" mb={6}/>
            {!isLocal && <Box>
                <Heading size="lg" mb={4}>Мы выступаем за приватность</Heading>
                <Text className={css(styles.fadeIn)} fontSize="xl" mb={4}>
                    Ваша конфиденциальность — это наша ценность.
                </Text>
                <Text className={css(styles.fadeIn)} fontSize="xl" mb={4}>
                    Сервис не собирает о вас никакой дополнительной информации,
                    кроме общедоступной: вашего публичного IP-адреса ({lookup["ip"]}),
                    региона точки доступа ({lookup["country_name"]}, {lookup["city"]}),
                    часового пояса ({lookup["time_zone"]})
                    и геометки ({lookup["longitude"]}, {lookup["latitude"]}).
                </Text>
                <Text className={css(styles.fadeIn)} fontSize="xl" mb={4} color="gray">
                    <i>Когда вы начнёте использовать прокси-сервер, эти данные будут подменены.</i>
                </Text>
                <Text className={css(styles.fadeIn)} fontSize="xl" mb={4}>
                    Наш проект имеет полностью <Link color="blue.500"
                                                     href='https://github.com/somnoynadno/ShutdownScout'>открытый
                    исходный код</Link>, и вы можете внести свой вклад в его дальнейшее развитие.
                </Text>
            </Box>
            }
        </Box>
        <Center>
            <Button className={css(styles.fadeInLong)} onClick={() => history.push('/scan')} size="lg"
                    colorScheme="green" mt={6} mb={6}
                    rightIcon={<ArrowRightIcon/>}>
                Перейти к сканированию
            </Button>
        </Center>
    </>
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

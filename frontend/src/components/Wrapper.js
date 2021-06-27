import React from 'react';
import {Route} from "react-router-dom";

import {
    Box,
    Button,
    Container,
    Divider,
    Flex,
    Heading,
    Link,
    ListItem,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spacer,
    Stack,
    Text,
    UnorderedList,
    useDisclosure
} from "@chakra-ui/react";

import {useBreakpointValue} from "@chakra-ui/media-query";

import history from "../history";
import {BrowserScanPage} from "../pages/BrowserScanPage";
import {ProxyPage} from "../pages/ProxyPage";
import {IndexPage} from "../pages/IndexPage";
import {TracertPage} from "../pages/TracertPage";


export const Wrapper = () => {
    const adaptiveDirection = useBreakpointValue({base: "column", md: "row"});
    const adaptiveAlign = useBreakpointValue({base: "center", sm: "stretch"});

    const {isOpen, onOpen, onClose} = useDisclosure();

    return (
        <Container maxW="6xl" p={4} pt={1}>
            <Flex direction={"row"} align={"center"}>
                <Stack onClick={() => history.push('/')} direction={"row"}
                       m={4} align={adaptiveAlign} style={{cursor: "pointer"}}>
                    <Heading color="gray.700" size="lg">Shutdown</Heading>
                    <Heading color="blue.500" size="lg">Scout</Heading>
                </Stack>
                <Stack direction={adaptiveDirection} spacing={4} align={adaptiveAlign}>
                    <Button colorScheme="blue" onClick={() => history.push('/scan')}
                            variant="link" isActive={window.location.pathname === '/scan'}>
                        Сканирование
                    </Button>
                    <Button colorScheme="blue" onClick={() => history.push('/proxy')}
                            variant="link" isActive={window.location.pathname === '/proxy'}>
                        Проверка прокси
                    </Button>
                    <Button colorScheme="blue" onClick={() => history.push('/trace')}
                            variant="link" isActive={window.location.pathname === '/trace'}>
                        Проверка ресурса
                    </Button>
                </Stack>
                <Spacer/>
                {adaptiveAlign === "stretch" && <Stack direction={"row"} m={3}>
                    <Button onClick={onOpen}>Помощь</Button>
                </Stack>}
            </Flex>
            <Divider mb={5}/>

            <Box>
                <Route exact path="/" component={IndexPage}/>
                <Route exact path="/scan" component={BrowserScanPage}/>
                <Route exact path="/proxy" component={ProxyPage}/>
                <Route exact path="/trace" component={TracertPage}/>
            </Box>

            <Modal size={"xl"} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>FAQ</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Heading size="sm">
                            Q: Могут ли интернет-провайдеры блокировать веб-сайты?
                        </Heading>
                        <Text>
                            A: Да, они правда могут это делать. Провайдер без труда может решать, какими сайтами вам разрешено пользоваться, а какими нет.
                        </Text>
                        <br/>
                        <Heading size="sm">
                            Q: Как обойти блокировку сайта?
                        </Heading>
                        <Text>
                            A: Существует несколько способов. Наиболее простые и популярные: использование VPN или прокси-сервера.
                        </Text>
                        <br/>
                        <Heading size="sm">
                            Q: Что такое прокси-сервер?
                        </Heading>
                        <Text>
                            A: Прокси выполняет роль посредника между вами и ресурсом, к которому вы хотите обратиться, тем самым скрывая это обращение от глаз провайдера.
                            <br/>
                            С подробной схемой работы можно ознакомиться <Link color="blue.500" href="https://proglib.io/p/kak-rabotaet-proksi-server-maksimalno-prostoe-obyasnenie-2020-08-21">в статье</Link>.
                        </Text>
                        <br/>
                        <Heading size="sm">
                            Q: Как мне использовать прокси-сервер?
                        </Heading>
                        <Text>
                            A: Порядок установки прокси сервера зависит от вашего браузера и операционной системы.
                            <br/>
                            Можно ознакомиться с несколькими
                            гайдами <Link color="blue.500" href="https://lifehacker.ru/kak-nastroit-svoj-proksi-server/">здесь</Link>,
                             <Link color="blue.500" href="https://best-proxies.ru/kb/kak-nastroit-proksi-v-google-chrome/"> здесь</Link>,
                            и <Link color="blue.500" href="https://proxyline.net/instrukcija-legkaja-nastrojka-proksi-v-android-za-30-sekund">здесь</Link>.
                        </Text>
                        <br/>
                        <Heading size="sm">
                            Q: У меня нет прокси-сервера. Что делать?
                        </Heading>
                        <Text>
                            A: Используя <Link color="blue.500" onClick={() => {
                                onClose();
                                history.push('/proxy');
                        }}>наш веб-сервис</Link>,
                            можно найти неплохие открытые прокси-сервера, но если он
                            вам нужен на постоянной основе, то желательно найти и приобрести хороший сервер в интернете.
                        </Text>

                        <Divider m={4}/>
                        <Text fontSize="sm">Разработчики:
                            <UnorderedList>
                                <ListItem><Link href={"https://github.com/somnoynadno"}>@somnoynadno</Link></ListItem>
                                <ListItem><Link href={"https://github.com/amoniaka_knabino"}>@amoniaka_knabino</Link></ListItem>
                            </UnorderedList>
                        </Text>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Понятно
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Container>
    );
};

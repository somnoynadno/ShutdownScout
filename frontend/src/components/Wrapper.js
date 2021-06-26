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


export const Wrapper = () => {
    const adaptiveDirection = useBreakpointValue({base: "column", md: "row"});
    const adaptiveAlign = useBreakpointValue({base: "center", sm: "stretch"});

    const {isOpen, onOpen, onClose} = useDisclosure();

    return (
        <Container maxW="6xl" p={4} pt={1}>
            <Flex direction={"row"} align={"center"}>
                <Stack onClick={() => history.push('/')} direction={"row"}
                       m={4} align={adaptiveAlign} style={{cursor: "pointer"}}>
                    <Heading color="gray.700" size="lg">{adaptiveAlign !== "stretch" ? "S" : "Shutdown"}</Heading>
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
                    <Button colorScheme="blue" onClick={() => history.push('/host')}
                            variant="link" isActive={window.location.pathname === '/host'}>
                        Проверка ресурса
                    </Button>
                </Stack>
                <Spacer/>
                <Stack direction={"row"} m={3}>
                    <Button onClick={onOpen}>О сервисе</Button>
                </Stack>
            </Flex>
            <Divider mb={5}/>

            <Box>
                <Route exact path="/scan" component={BrowserScanPage}/>
                <Route exact path="/proxy" component={ProxyPage}/>
            </Box>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay/>
                <ModalContent>
                    <ModalHeader>О сервисе</ModalHeader>
                    <ModalCloseButton/>
                    <ModalBody>
                        <Text>
                            <strong>Shutdown Scout</strong> позволяет оценить доступность
                            сайтов стран всего мира из вашей локальной сети.
                        </Text>
                        <br/>
                        <Text>
                            Проверяйте скорость вашей текущей точки доступа
                            и сравнивайте с результатами других пользователей.
                        </Text>
                        <br/>
                        <Text>
                            Не дайте вашему провайдеру вас обмануть!
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

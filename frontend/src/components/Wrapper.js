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
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spacer,
    Stack,
    Text, ListItem, UnorderedList,
    useDisclosure
} from "@chakra-ui/react";

import {useBreakpointValue} from "@chakra-ui/media-query";

import history from "../history";
import {IndexPage} from "../pages/IndexPage";


export const Wrapper = () => {
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
                <Spacer/>
                <Stack direction={"row"} m={3}>
                    <Button onClick={onOpen}>О сервисе</Button>
                </Stack>
            </Flex>
            <Divider mb={5}/>

            <Box>
                <Route exact path="/" component={IndexPage}/>
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

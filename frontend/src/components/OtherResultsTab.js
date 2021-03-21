import React, {useEffect, useState} from "react";
import {
    Box,
    Button,
    Divider,
    Heading,
    Link,
    List,
    ListIcon,
    ListItem,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Tag,
    useDisclosure
} from "@chakra-ui/react";
import {SearchIcon} from '@chakra-ui/icons';
import moment from "moment";
import {api} from "../http/API";
import {GeoChart} from "./GeoChart";
import {mapColors} from "../config";
import {groupPingResultsForGeoChart} from "../services/helpers";

export const OtherResultsTab = (props) => {
    const lookup = props.lookup;

    let [lastResults, setLastResults] = useState({});
    let [resultsByRegion, setResultsByRegion] = useState({});

    let [selectedPingResult, setSelectedPingResult] = useState({});
    let [selectedAvailabilityResult, setSelectedAvailabilityResult] = useState({});

    const {isOpen, onOpen, onClose} = useDisclosure();

    const prepareAndShowCharts = (result) => {
        let pingData = groupPingResultsForGeoChart(result, "Ping");
        let availabilityData = groupPingResultsForGeoChart(result, "Availability");

        setSelectedAvailabilityResult(availabilityData);
        setSelectedPingResult(pingData);

        onOpen();
    }

    useEffect(() => {
        api.GetLastResults(6)
            .then((res) => setLastResults(res))
            .catch((err) => console.log(err))

        api.GetLastResults(6, lookup.region)
            .then((res) => setResultsByRegion(res))
            .catch((err) => console.log(err))
    }, [lookup]);

    return <Box>
        <Heading size={"lg"}>Последние запросы</Heading>
        <br/>
        <List spacing={3}>
            {Object.entries(lastResults).reverse().map((e, i) => {
                if (i === 0) return '';
                const date = moment(e[0]).format("MM.DD.YYYY hh:mm");
                const payload = e[1];
                return <ListItem key={i}>
                    <ListIcon as={SearchIcon} color="blue.500"/>
                    <Link onClick={() => prepareAndShowCharts(payload["Results"])}>
                        {payload["Region"]} ({payload["IP"]})</Link> <Tag size={"sm"}>{date}</Tag>
                </ListItem>
            })}
        </List>
        <Divider m={4}/>
        <Heading size={"lg"}>Запросы с вашего региона</Heading>
        <br/>
        <List spacing={3}>
            <List spacing={3}>
                {Object.entries(resultsByRegion).reverse().map((e, i) => {
                    if (i === 0) return '';
                    const date = moment(e[0]).format("MM.DD.YYYY hh:mm");
                    const payload = e[1];
                    return <ListItem key={i}>
                        <ListIcon as={SearchIcon} color="blue.500"/>
                        <Link onClick={() => prepareAndShowCharts(payload["Results"])}>
                            {payload["Region"]} ({payload["IP"]})</Link> <Tag size={"sm"}>{date}</Tag>
                    </ListItem>
                })}
            </List>
        </List>
        <Modal size={"3xl"} isOpen={isOpen} onClose={onClose}>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>Отчёт</ModalHeader>
                <ModalCloseButton/>
                <ModalBody>
                    <Heading m={2} size={"lg"}>Скорость соединения</Heading>
                    <GeoChart data={selectedPingResult} colors={[mapColors.green, mapColors.yellow, mapColors.red]}/>
                    <Divider m={4}/>
                    <Heading m={2} size={"lg"}>Доступность веб-сервисов</Heading>
                    <GeoChart data={selectedAvailabilityResult}
                              colors={[mapColors.red, mapColors.yellow, mapColors.green]}/>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={onClose}>
                        Закрыть
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </Box>
}

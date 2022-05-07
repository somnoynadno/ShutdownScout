import React, {useState} from "react";
import {Alert, AlertIcon, Box, Button, Center, Heading, Input} from "@chakra-ui/react"
import {api} from "../http/API";
import {GeoChart} from "../components/GeoChart";
import {mapColors} from "../config";
import {groupPingResultsForGeoChart} from "../services/helpers";


export const FindScanPage = () => {
    let [pingResult, setPingResult] = useState(null);
    let [availabilityResult, setAvailabilityResult] = useState(null);

    let [errorText, setErrorText] = useState("");
    let [timestamp, setTimestamp] = useState("");

    const findResult = async () => {
        api.GetLastProxyResults(undefined, undefined, undefined, undefined, timestamp)
            .then((res) => prepareAndShowCharts(res))
            .catch((err) => setErrorText(err.toString()))
    }

    const prepareAndShowCharts = (result) => {
        let pingData = groupPingResultsForGeoChart(result[timestamp]['Results'], "Ping");
        let availabilityData = groupPingResultsForGeoChart(result[timestamp]['Results'], "Availability");

        setAvailabilityResult(availabilityData);
        setPingResult(pingData);
    }

    return (
        <Box>
            {errorText && <Alert status="error" mb={4}>
                <AlertIcon/>
                {errorText}
            </Alert>}

            <Box w="100%">
                <Center>
                    <Input value={timestamp} w="50%"
                           onChange={(event) => setTimestamp(event.target.value)}
                           placeholder="2020-06-04 15:56:48.528461"/>
                    <Button onClick={() => findResult()}>Найти</Button>
                </Center>
            </Box>
            <br/>
            {pingResult && availabilityResult ?
                <Center w="100%">
                    <Box w="75%">
                        <Heading m={2} size={"lg"}>Скорость соединения</Heading>
                        <GeoChart data={pingResult}
                                  colors={[mapColors.green, mapColors.yellow, mapColors.red]}/>
                        <br/><br/>
                        <Heading m={2} size={"lg"}>Доступность ресурсов</Heading>
                        <GeoChart data={availabilityResult}
                                  colors={[mapColors.red, mapColors.yellow, mapColors.green]}/>
                    </Box>
                </Center> : ''}
                <br/>
        </Box>
    )
}

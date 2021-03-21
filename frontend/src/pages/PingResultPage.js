import React from "react";
import {Box, Tab, TabList, TabPanel, TabPanels, Tabs} from "@chakra-ui/react"
import {mapColors} from "../config";
import {OtherResultsTab} from "../components/OtherResultsTab";
import {GeoChart} from "../components/GeoChart";
import {groupPingResultsForGeoChart} from "../services/helpers";


export const PingResultPage = (props) => {
    let result = props.result;
    let lookup = props.lookup;

    let pingData = groupPingResultsForGeoChart(result, "Ping");
    let availabilityData = groupPingResultsForGeoChart(result, "Availability");

    return (
        <Box>
            <Tabs isFitted isLazy>
                <TabList>
                    <Tab>Скорость соединения</Tab>
                    <Tab>Доступность сервисов</Tab>
                    <Tab>Другие результаты</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <GeoChart colors={[mapColors.green, mapColors.yellow, mapColors.red]} data={pingData}/>
                    </TabPanel>
                    <TabPanel>
                        <GeoChart colors={[mapColors.red, mapColors.yellow, mapColors.green]} data={availabilityData}/>
                    </TabPanel>
                    <TabPanel>
                        <OtherResultsTab lookup={lookup}/>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    )
}


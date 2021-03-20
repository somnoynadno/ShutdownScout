import React from "react";
import {Box, Tab, TabList, TabPanel, TabPanels, Tabs} from "@chakra-ui/react"
import Chart from "react-google-charts";
import {mapColors} from "../config";
import {OtherResultsTab} from "../components/OtherResultsTab";


export const PingResultPage = (props) => {
    let result = props.result;

    let pingData = groupDataByKey(result, "Ping");
    let availabilityData = groupDataByKey(result, "Availability");

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
                        <Chart
                            chartEvents={[
                                {
                                    eventName: "select",
                                    callback: ({chartWrapper}) => {
                                        const chart = chartWrapper.getChart();
                                        const selection = chart.getSelection();
                                        if (selection.length === 0) return;
                                        const region = pingData[selection[0].row + 1];
                                        console.log("Selected : " + region);
                                    }
                                }
                            ]}
                            chartType="GeoChart"
                            width="100%"
                            height="400px"
                            data={pingData}
                            options={{
                                colorAxis: {colors: [mapColors.green, mapColors.yellow, mapColors.red]},
                            }}
                        />
                    </TabPanel>
                    <TabPanel>
                        <Chart
                            chartEvents={[
                                {
                                    eventName: "select",
                                    callback: ({chartWrapper}) => {
                                        const chart = chartWrapper.getChart();
                                        const selection = chart.getSelection();
                                        if (selection.length === 0) return;
                                        const region = pingData[selection[0].row + 1];
                                        console.log("Selected : " + region);
                                    }
                                }
                            ]}
                            chartType="GeoChart"
                            width="100%"
                            height="400px"
                            data={availabilityData}
                            options={{
                                colorAxis: {colors: [mapColors.red, mapColors.yellow, mapColors.green]},
                            }}
                        />
                    </TabPanel>
                    <TabPanel>
                        <OtherResultsTab/>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    )
}

function groupDataByKey(object = {}, key = "") {
    let result = [];
    result.push(["Country", key]);

    for (const [country, pingResult] of Object.entries(object)) {
        let row = [country];

        for (const [k, v] of Object.entries(pingResult)) {
            if (k === key) {
                row.push(v);
            }
        }
        result.push(row);
    }

    return result;
}

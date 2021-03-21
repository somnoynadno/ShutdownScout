import React from "react";
import Chart from "react-google-charts";

export const GeoChart = (props) => {
    const data = props.data;
    const colors = props.colors;

    return <Chart
        chartEvents={[
            {
                eventName: "select",
                callback: ({chartWrapper}) => {
                    const chart = chartWrapper.getChart();
                    const selection = chart.getSelection();
                    if (selection.length === 0) return;
                    const region = data[selection[0].row + 1];
                    console.log("Selected : " + region);
                }
            }
        ]}
        chartType="GeoChart"
        width="100%"
        height="400px"
        data={data}
        options={{
            colorAxis: {colors: colors},
        }}
    />
}

import React from "react";
import {
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
} from "@chakra-ui/react"


export const AdviceAlert = (props) => {
    return <Alert status="info">
        <AlertIcon />
        Chakra is going live on August 30th. Get ready!
    </Alert>
}

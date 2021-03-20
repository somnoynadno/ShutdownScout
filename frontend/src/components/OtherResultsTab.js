import React from "react";
import {Box, Heading, Divider, Link, List, ListIcon, ListItem, Tag} from "@chakra-ui/react";
import {SearchIcon} from '@chakra-ui/icons';
import moment from "moment";

export const OtherResultsTab = () => {
    return <Box>
        <Heading size={"lg"}>Последние запросы</Heading>
        <br/>
        <List spacing={3}>
            <ListItem>
                <ListIcon as={SearchIcon} color="blue.500"/>
                <Link>95.182.120.116</Link> <Tag size={"sm"}>{moment(Date.now()).format("LL")}</Tag>
            </ListItem>
            <ListItem>
                <ListIcon as={SearchIcon} color="blue.500"/>
                <Link>173.194.73.138</Link> <Tag size={"sm"}>{moment(Date.now()).format("LL")}</Tag>
            </ListItem>
            <ListItem>
                <ListIcon as={SearchIcon} color="blue.500"/>
                <Link>87.250.250.242</Link> <Tag size={"sm"}>{moment(Date.now()).format("LL")}</Tag>
            </ListItem>
        </List>
        <Divider m={4}/>
        <Heading size={"lg"}>Запросы с вашего региона</Heading>
        <br/>
        <List spacing={3}>
            <ListItem>
                <ListIcon as={SearchIcon} color="blue.500"/>
                <Link>95.182.120.116</Link> <Tag size={"sm"}>{moment(Date.now()).format("LL")}</Tag>
            </ListItem>
            <ListItem>
                <ListIcon as={SearchIcon} color="blue.500"/>
                <Link>173.194.73.138</Link> <Tag size={"sm"}>{moment(Date.now()).format("LL")}</Tag>
            </ListItem>
            <ListItem>
                <ListIcon as={SearchIcon} color="blue.500"/>
                <Link>87.250.250.242</Link> <Tag size={"sm"}>{moment(Date.now()).format("LL")}</Tag>
            </ListItem>
        </List>
    </Box>
}

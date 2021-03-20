import {extendTheme} from "@chakra-ui/react"

const config = {
    initialColorMode: "light",
    useSystemColorMode: false,
}

if (!localStorage.getItem("chakra-ui-color-mode")) {
    localStorage.setItem("chakra-ui-color-mode", config.initialColorMode);
}

const theme = extendTheme({config});

export default theme;

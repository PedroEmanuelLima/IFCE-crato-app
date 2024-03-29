import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { StyleSheet } from "react-native";
import { defaultStyleProperties } from "../../base/styles";

const styles = StyleSheet.create({
    containerMenu: {
        width: '100%',
        paddingHorizontal: RFValue(16),
        paddingTop: '2%',
        paddingBottom: 10,

        backgroundColor: defaultStyleProperties.greenColor
    },

    content: {
        width: '58%',
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    logoMenuContent: {
        width: RFValue(48),
        height: RFValue(48),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: defaultStyleProperties.whiteColor,
        borderRadius: RFPercentage(50),
    },

    logoMenu: {
        width: RFValue(24),
        height: RFValue(32),
    },

    iconsMenu: {
        fontSize: RFPercentage(4),
        color: defaultStyleProperties.whiteColor
    },
});

export default styles;
import React, { useContext } from 'react';
import {
    Text, View, ScrollView, Linking,
    TouchableOpacity, Image, Dimensions
} from "react-native";
import Modal from 'react-native-modal';
import { format, parseISO } from "date-fns";
import { Item as ItemType } from "../../base/Types";

import styles from "./styles";
import { Button } from "../Button";
import { AuthContext } from '../../context/auth';
import { RFValue } from 'react-native-responsive-fontsize';

interface IInfoProps {
    item: ItemType;
    bgc: string;
    visivel: boolean;
    setVisivel: Function;
}

function MaisInfo({ item, bgc, visivel, setVisivel }: IInfoProps) {

    const { aviso } = useContext(AuthContext);

    const abrir = async (link: string) => {
        try {
            await Linking.openURL(link);
        } catch (error) {
            aviso('Não foi possível abrir a URL.', 'danger', RFValue(64));
            menosInformacoes();
        }

    }

    const menosInformacoes = () => {
        setVisivel({ exibir: false, item: null })
    }

    return (
        <Modal
            animationIn="zoomInDown"
            animationOut="zoomOutUp"
            isVisible={visivel}
            backdropOpacity={0.5}
            onBackButtonPress={menosInformacoes}
            onBackdropPress={menosInformacoes}
            statusBarTranslucent={true}
            deviceHeight={Dimensions.get('window').height + 40}
        >
            <View style={styles.viewModal}>
                <View style={[styles.contentModalInfo, { backgroundColor: bgc }]}>
                    <ScrollView
                        showsVerticalScrollIndicator={true}
                    >

                        <View style={styles.titleAndImage}>
                            <Text style={styles.titleModal}>{item.title}</Text>
                            {item.resource && (
                                <Image style={styles.imageModal} source={{ uri: item.resource.secure_url }} />
                            )}
                        </View>

                        <View>
                            <Text style={styles.contentsInfo}>{item.contents}</Text>
                            {item.referenceLinks &&
                                <View style={styles.listaLinks}>
                                    {item.referenceLinks.map((link: string, index: number) => (
                                        <TouchableOpacity key={index} onPress={() => abrir(link)}>
                                            <Text style={styles.textLink}>{link}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            }
                        </View>

                        <View style={styles.footerModal}>
                            <Text style={styles.dataModal}>{format(parseISO(item.createdAt), 'dd/MM/yyyy')}</Text>

                            <View style={styles.containerBtnOk}>
                                <Button typeButton="mainButton" onPress={() => menosInformacoes()}>
                                    <Text style={styles.textBtnOk} >OK</Text>
                                </Button>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </View>

        </Modal>
    )
}

export default MaisInfo;
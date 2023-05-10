import React, { useContext } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ScrollView } from 'react-native-gesture-handler';
import Menu from "../../components/Menu";
import EmptyRefectory from './EmptyRefectory';
import { Button as ButtonComponent } from '../../components/Button';
import { RefectoryChoices } from '../../components/RefectoryChoices';
import { OpenURLButton } from '../../components/OpenUrlButton';
import MenuFormUrlModal from '../../components/MenuFormUrlModal';
import styles from './styles';
import { refectoryStatusConstants } from '../../base/constants';
import { format } from 'date-fns';
import { RefreshControl } from 'react-native-gesture-handler'

import { RefectoryContext } from '../../context/refectory.context'
import { AuthContext } from '../../context/auth'
import { UserPermitions } from '../../base/Enums';
import ButtonLoading from '../../components/ButtonLoading';
import { defaultStyleProperties } from '../../base/styles';
import { api } from '../../config';
import RefectoryAlreadyAnswered from './RefectoryAlreadyAnswered';

const Refectory = () => {
    const [isVisible, setVisible] = React.useState<boolean>(false)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [refreshing, setRefreshing] = React.useState(false);

    const { user, aviso } = useContext(AuthContext)
    const { refectory, checkboxAnswerFields, setCheckboxAnswerFields, setRefectoryStoraged, loadCurrentRefectory } = useContext(RefectoryContext)

    const navigation = useNavigation<DrawerNavigationProp<any>>();

    const handleSubmit = async () => {
        const filter = Object.values(checkboxAnswerFields).filter(val => val !== 0)
        if (!filter.length) return aviso('Nenhuma opção selecionada', 'warning')
        setLoading(true)

        try {
            await api.post(`/refectory/create/answer/${refectory?.id}`, checkboxAnswerFields)
            setCheckboxAnswerFields({ afternoonSnack: 0, breakfast: 0, dinner: 0, lunch: 0, nightSnack: 0 })

            if (refectory) {
                await setRefectoryStoraged({ ...refectory, hasAnswered: true })
            }
            aviso('Registramos a sua resposta, obrigado!', 'success')
            setLoading(false)
            navigation.navigate('Mural')
        } catch (error: any) {
            console.log(error.response)
            aviso('Falha ao submeter formulário.', 'danger')
            setLoading(false)

        }
    }

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await loadCurrentRefectory()
        setRefreshing(false)
    }, []);

    return (
        <>
            <Menu />
                {!refectory
                    ?
                    (
                        <ScrollView
                            contentContainerStyle={{ height: '100%' }}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}
                            />}
                        >
                            <EmptyRefectory />
                        </ScrollView>
                    )
                    :
                    (
                        <>
                            <MenuFormUrlModal isVisible={isVisible} setVisible={() => setVisible(!isVisible)} action='update' />
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                            >
                                <View style={styles.container}>
                                    <Text style={styles.titlePage}>Refeitório</Text>

                                    <View style={styles.dateForms}>
                                        <Text style={styles.statusForms}>Status: <Text style={{ color: refectoryStatusConstants[refectory.status].color, fontWeight: 'bold' }}> {refectoryStatusConstants[refectory.status].text} </Text> </Text>
                                        <Text style={styles.dateFormsReference}>Formulário referente a {format(refectory.vigencyDate, 'dd/MM/yyyy')}</Text>
                                        <Text style={styles.dateFormsClosing}>
                                            <Text numberOfLines={2} style={{ color: 'red' }}>Encerramento</Text>:
                                            Respostas aceitas até {format(refectory.startAnswersDate, 'dd/MM/yyyy')} às 19h
                                        </Text>
                                    </View>

                                    <View style={styles.cardapio}>
                                        <Text style={styles.title}>Cardápio</Text>
                                        <Text style={styles.subtitle} >Acesse a planilha do cardápio através do botão abaixo</Text>

                                        <View style={styles.menuContainer}>
                                            <OpenURLButton
                                                url={refectory.menuUrl}
                                                textColor='white'
                                                icon={<Icon color={'white'} style={styles.menuIcon} name='microsoft-excel' />}
                                            >
                                                Cardápio
                                            </OpenURLButton>
                                            {!user.roles.includes(UserPermitions.RM) ? '' : (
                                                <View style={styles.editMenuIconContainer}>
                                                    <TouchableOpacity onPress={() => setVisible(true)}>
                                                        <Icon style={styles.editMenuIcon} color={'white'} name='pencil-outline' />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    <View style={styles.refectoryChoices}>
                                        {refectory.hasAnswered ? <RefectoryAlreadyAnswered /> : <RefectoryChoices />}
                                    </View>

                                    {!user.roles.includes(UserPermitions.RM) ? '' : (
                                        <TouchableOpacity style={styles.formButton} >
                                            <ButtonComponent typeButton='extraButton' onPress={() => navigation.navigate('Formulários do Refeitório')}>
                                                <Text style={styles.formTitle}>Formulários</Text>
                                                <Icon color={'white'} style={styles.formIcon} name='clipboard-edit-outline' />
                                            </ButtonComponent>
                                        </TouchableOpacity>
                                    )}

                                    <View style={styles.actionButtonContainer}>
                                        <ButtonComponent typeButton='backButton' onPress={() => navigation.navigate('Mural')} >
                                            <Text style={styles.actionButtomTitle} >Voltar</Text>
                                        </ButtonComponent>

                                        <ButtonComponent disabled={refectory.hasAnswered} typeButton='mainButton' onPress={handleSubmit}>
                                            <Text style={{ ...styles.actionButtomTitle, opacity: refectory.hasAnswered ? 0.2 : 1 }} >
                                                {loading ?
                                                    <ButtonLoading size={'small'} color={defaultStyleProperties.blueColor} />
                                                    :
                                                    'Enviar'
                                                }
                                            </Text>
                                        </ButtonComponent>

                                    </View>
                                </View>
                            </ScrollView>
                        </>
                    )}
        </>
    )
}

export default Refectory;
import React, { useContext } from "react";
import Modal from "react-native-modal";
import { View, Text, Pressable, TouchableOpacity } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CheckBox from "expo-checkbox";

import { defaultStyleProperties } from "../../base/styles";
import { AuthContext } from "../../context/auth";
import ButtonLoading from "../ButtonLoading";
import { UserPermitions, UserTypes } from "../../base/Enums";
import { api } from "../../config";
import styles from "./styles";


type BoxProps = {
  isVisible: boolean;
  setVisible: () => void;
  id: string;
  name: string;
  type: UserTypes;
  identification: string;
  email: string;
  roles: UserPermitions[];
  reloadUsers(searchPhrase: string): Promise<void>;
};

function UserPermissionsModal({
  isVisible,
  setVisible,
  id,
  name,
  email,
  identification,
  type,
  roles,
  reloadUsers
}: BoxProps) {
  const [checkboxAnswerFields, setCheckboxAnswerFields] =
    React.useState<UserPermitions[]>(roles);
  const [loading, setLoading] = React.useState<boolean>(false);

  const { aviso } = useContext(AuthContext);

  const handleChange = (key: UserPermitions) => {
    const alreadyExists = checkboxAnswerFields.includes(key);
    if (alreadyExists) {
      setCheckboxAnswerFields(
        checkboxAnswerFields.filter((item) => item !== key)
      );
    } else {
      setCheckboxAnswerFields([...checkboxAnswerFields, key]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.patch(`/users/roles/${id}`, { roles: checkboxAnswerFields });
      setLoading(false);
      setVisible();
      aviso("Permissões atualizadas com sucesso.", "success", RFValue(64));
      reloadUsers('');
    } catch (error) {
      aviso("Falha ao atuaizar permissões de usuário.", "danger", RFValue(64));
      setLoading(false);
      setVisible();
    }
  };

  return (
    <Modal
      animationIn="zoomInDown"
      animationOut="zoomOutUp"
      isVisible={isVisible}
      backdropOpacity={0.8}
      onBackButtonPress={setVisible}
      onBackdropPress={setVisible}
      statusBarTranslucent={true}
    >
      <View style={styles.viewModal}>
        <View style={styles.contentModalInfo}>
          <Icon style={styles.closeIcon} onPress={setVisible} name="close" />

          <View>
            <View style={styles.nameContainer}>
              <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                style={styles.nameText}
              >
                {" "}
                {name}{" "}
              </Text>
              <Text style={styles.typeText}> {type} </Text>
            </View>

            <View style={styles.identificationContainerStyle}>
              <View style={styles.identificationStyle}>
                <Icon
                  name="badge-account-horizontal-outline"
                  style={styles.iconStyle}
                />
                <Text style={styles.identificationTextStyle}>
                  {identification}
                </Text>
              </View>
              <View style={styles.emailStyle}>
                <Icon name="email" style={styles.iconStyle} />
                <Text
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  style={styles.emailTextStyle}
                >
                  {email}
                </Text>
              </View>
            </View>
          </View>

          <View>
            <View style={styles.optionContainer}>
              <CheckBox
                value={checkboxAnswerFields.includes(UserPermitions.PM)}
                onValueChange={() => handleChange(UserPermitions.PM)}
                color={
                  checkboxAnswerFields.includes(UserPermitions.PM)
                    ? defaultStyleProperties.greenColor
                    : defaultStyleProperties.whiteColor
                }
              />
              <Text style={styles.optionText}>Gestor de Permissões</Text>
            </View>
            
            <View style={styles.optionContainer}>
              <CheckBox
                value={checkboxAnswerFields.includes(UserPermitions.RM)}
                onValueChange={() => handleChange(UserPermitions.RM)}
                color={
                  checkboxAnswerFields.includes(UserPermitions.RM)
                    ? defaultStyleProperties.greenColor
                    : defaultStyleProperties.whiteColor
                }
              />
              <Text style={styles.optionText}>Gestor de Refeitório</Text>
            </View>

            <View style={styles.optionContainer}>
              <CheckBox
                value={checkboxAnswerFields.includes(UserPermitions.MM)}
                onValueChange={() => handleChange(UserPermitions.MM)}
                color={
                  checkboxAnswerFields.includes(UserPermitions.MM)
                    ? defaultStyleProperties.greenColor
                    : defaultStyleProperties.whiteColor
                }
              />
              <Text style={styles.optionText}>Gestor de Mural</Text>
            </View>
          </View>

          <View style={styles.containerBtn}>
            <Pressable style={styles.btnOk} onPress={handleSave}>
              <Text style={styles.textBtn}>
                {loading ? (
                  <ButtonLoading
                    size={"small"}
                    color={defaultStyleProperties.blueColor}
                  />
                ) : (
                  "Salvar"
                )}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default UserPermissionsModal;

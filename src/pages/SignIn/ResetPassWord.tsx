import React, { useState, useContext } from "react";
import { View, TouchableOpacity, Text, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { RFValue } from "react-native-responsive-fontsize";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AuthContext } from "../../context/auth";
import { InputGroup } from "../../components/InputGroup";
import CodeInput from "../../components/CodeInput";
import styles from "./styles";
import { api } from "../../config";
import { Button } from "../../components/Button";
import Tooltip from "../../components/Tooltip";
import VALIDATION from "../SignUp/Validations";

interface IResetPassWord {
  newPass: string;
  confirmeNewPass: string;
}

const ResetPassWord = ({ route }: any) => {
  const email = route.params!.email;
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { aviso, changeUserValues, setLoggedUser, setScreenLoading } =
    useContext(AuthContext);

  const [code, setCode] = useState<string>("");
  const [codeValid, setCodeValid] = useState(true);
  const [formResetPass, setFormResetPass] = useState<IResetPassWord>({
    newPass: "",
    confirmeNewPass: "",
  });
  const [formHasBeenSent, setFormHasBeenSent] = useState(false);

  const handleChangeNewPass = (value: string) => {
    setFormResetPass({ ...formResetPass, newPass: value });
  };

  const handleChangeConfirmeNewPass = (value: string) => {
    setFormResetPass({ ...formResetPass, confirmeNewPass: value });
  };

  function maskEmail(email: string) {
    const atIndex = email.indexOf("@");
    const domain = email.slice(atIndex + 1);
    const maskedUsername = email.slice(0, 2) + "*".repeat(atIndex - 2);
    const maskedDomain =
      domain.slice(0, 1) + "*".repeat(domain.length - 5) + domain.slice(-3);
    return maskedUsername + "@" + maskedDomain;
  }

  const handleCodeNewPass = async () => {
    try {
      await api.post("/auth/forgot-password", { email });
      aviso("Email de recuperação de senha enviado com sucesso", "success");
      return;
    } catch (error: any) {
      aviso("Ocorreu um erro inesperado, tente mais tarde!", "danger");
    }
  };

  const verifyErrors = (): string[] => {
    const errors = [];

    if (!VALIDATION.PASSWORD(formResetPass.newPass)) errors.push("Nova Senha");

    if (
      formResetPass.confirmeNewPass !== formResetPass.newPass &&
      formResetPass.confirmeNewPass
    )
      errors.push("Confirmação de Senha");

    if (code.trim().length !== 4) {
        errors.push("Código de confirmação");
        setCodeValid(false);
    } else {
        setCodeValid(true);
    }

    return errors;
  };

  const submitForm = () => {
    setFormHasBeenSent(true);
    setTimeout(() => {
      setFormHasBeenSent(false);
    }, 1000);
  };

  const handlePassword = async () => {
    submitForm();
    const errors = verifyErrors();
    if (errors.length) {
      return aviso(
        `Verifique os seguintes campos:\n${errors.join("\n")}`,
        "danger"
      );
    }
    try {
      const userResponse = await api.patch("/auth/reset-password", {
        code,
        newPassword: formResetPass.newPass,
      });
      await changeUserValues(userResponse.data);
      setLoggedUser();
      aviso("Senha alterada com sucesso", "success", RFValue(64));
      setScreenLoading(false);
      return;
    } catch (error: any) {
      setScreenLoading(false);
      if (error?.response.data.message == "Invalid code") {
        aviso("Código inválido!", "danger");
        return;
      }
      aviso("Ocorreu um erro inesperado, tente mais tarde!", "danger");
    }
  };

  const confirPass = (cp: string) =>
    cp === formResetPass.newPass && !!cp.length;

  return (
    <View style={[styles.container, { paddingHorizontal: RFValue(16) }]}>
      <View style={styles.containerBack}>
        <TouchableOpacity onPress={() => navigation.navigate("login")}>
          <Icon name="keyboard-return" style={styles.iconBack} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentResentMail}
        keyboardShouldPersistTaps={"handled"}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <View style={styles.containerTitle}>
            <Text style={styles.titleValidation}>Redefinição de senha</Text>
            <Tooltip tooltipText="Caso não encontre o email na caixa principal, verifique em SPANS.">
              <Icon
                style={styles.iconInformations}
                name="information-outline"
              />
            </Tooltip>
          </View>
          <View style={styles.containerCodeValidation}>
            <Text style={styles.codeInformtions}>
              Informe abaixo o código enviado para: {maskEmail(email)}
            </Text>
            <CodeInput
              code={code}
              setCode={setCode}
              valid={{
                isValid: codeValid,
                message: "Código inválido",
              }}
            />

            <TouchableOpacity
              style={styles.btnNewCode}
              onPress={handleCodeNewPass}
            >
              <Text style={styles.textBtnCode}>Reenvie um novo código</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.passWordContainer}>
            <InputGroup
              label="Nova Senha"
              value={formResetPass.newPass}
              type="pass"
              required={true}
              submit={formHasBeenSent}
              atualiza={handleChangeNewPass}
              errorMessage={{
                valueIsValid: VALIDATION.PASSWORD,
                messageErro: "Nova senha deve ter no minimo 8 caracteres!",
              }}
            />

            <InputGroup
              label="Confirmar Senha"
              value={formResetPass.confirmeNewPass}
              type="pass"
              required={true}
              submit={formHasBeenSent}
              atualiza={handleChangeConfirmeNewPass}
              errorMessage={{
                valueIsValid: confirPass,
                messageErro: formResetPass.confirmeNewPass
                  ? "As senhas não são iguais!"
                  : "Confirmar senha!",
              }}
            />
          </View>
        </View>

        <Button typeButton="mainButton" onPress={handlePassword}>
          <Text style={styles.btnText}>Atualizar senha</Text>
        </Button>
      </ScrollView>
    </View>
  );
};

export default ResetPassWord;

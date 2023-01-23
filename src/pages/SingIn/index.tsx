import React, { useContext, useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'
import FlashMessage, { showMessage } from 'react-native-flash-message';

import { AuthContext } from '../../context/auth';
import LogoIF from '../../components/LogoIF';
import styles from './styles'

export default function Login() {

  const { singIn } = useContext(AuthContext);
  const navigation = useNavigation<StackNavigationProp<any>>();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [visible, setVisible] = useState(true);
  const [resetEmail, setResetEmail] = useState(false);

  const handleResetSenha = () => {
    if (!email.trim()) {
      alert('Insira um email válido');
      return;
    }

    try {
      setResetEmail(true);
      showMessage({
        message: "Email de recuperação de senha enviado com sucesso",
        type: 'success',
        duration: 5000,
        hideOnPress: true
      });

    } catch (error) {
      alert("Ocorreu um erro inesperado, tente mais tarde!")
    }
  }

  const entrar = () => {
    singIn({email, password: senha});
  }

  return (
    <>
      <View style={styles.container}>
        <LogoIF/>

        <View style={styles.content}>
        <Text style={styles.titleForm}>IFCE-Crato-Estudante</Text>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} enabled>
            <View style={styles.contenteForm}>
            <View style={styles.contntInpuPass}>
                <TextInput
                style={styles.inputLog}
                value={email}
                onChangeText={setEmail}
                placeholder='Email'
                />
            </View>
            <View style={styles.contntInpuPass}>
                <TextInput
                style={styles.inputLog}
                value={senha}
                secureTextEntry={visible}
                textContentType='password'
                onChangeText={setSenha}
                placeholder='Senha'
                />
                <TouchableOpacity onPress={() => setVisible(!visible)} style={styles.viewPass}>
                <Image style={{width:25, height: 25}} source={require('../../assets/images/viewPass.png')} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => handleResetSenha()}>
                <Text style={styles.textLink}>Esqueceu a senha?</Text>
            </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>

        <View style={styles.btnGroup}>
            <TouchableOpacity style={styles.btnEntrar} onPress={() => entrar()}>
            <Text style={[styles.textBtn, {color: '#fff'}]}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
            <Text style={[styles.textLink, styles.textBtn]}>Ainda não é Cadastrado?</Text>
            </TouchableOpacity>
        </View>
        </View>
        <FlashMessage position={'top'}/>

      </View>
    </>
  );
}
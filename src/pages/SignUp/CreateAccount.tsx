import React, { useState, useContext, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

import { AuthContext } from '../../context/auth';
import { InputGroup, SelectGroup} from '../../components/InputGroup';
import { ICheckRegister } from '../../base/Interfaces';
import LogoIF from '../../components/LogoIF';
import styles from './styles';
import { UserTypes } from '../../base/Enums';
import { Button } from '../../components/Button';

export default function CreateAccount() {

  const [user, setUser] = useState<ICheckRegister>({type: UserTypes.STD} as ICheckRegister);

  const { signUp } = useContext(AuthContext);
  const navigation = useNavigation<DrawerNavigationProp<any>>()

  useFocusEffect(
    useCallback(() => {
      setUser({type: UserTypes.STD} as ICheckRegister);
    }, [])
  )

  const cadastrar = () => {
    signUp(user);
  }

  const setNome = (nome: string) => {
    setUser(prevState => {
      return {...prevState, name: nome}
    })
  }
  
  const setCargo = (cargo: UserTypes) => {
    setUser(prevState => {
      return {...prevState, type: cargo}
    })
  }
  
  const setIdentificacao = (identificacao: string) => {
    setUser(prevState => {
      return {...prevState, identification: identificacao}
    })
  }

  const setEmail = (email: string) => {
    setUser(prevState => {
      return {...prevState, email: email}
    })
  }
  
  const setCelular = (celular: string) => {
    setUser(prevState => {
      return {...prevState, phoneNumber: celular}
    })
  }
  
  const setSenha = (senha: string) => {
    setUser(prevState => {
      return {...prevState, password: senha}
    })
  }

  const setConfirmeSenha = (confirmeSenha: string) => {
    setUser(prevState => {
      return {...prevState, confirmPassword: confirmeSenha}
    })
  }

  return (

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled style={styles.container}
      >
        <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps={'handled'}>
          <View style={styles.content}>
            <LogoIF />

            <View style={styles.form}>
              <Text style={styles.titleForm}>Cadastro</Text>
              <View style={styles.formGroup}>
                <View style={styles.inputGroupAll}>
                  <InputGroup
                    label="Nome"
                    value={user.name}
                    required={true}
                    atualiza={setNome}/>
                  <SelectGroup label="Nível de Acesso" lista={[
                      { label: "Aluno", value: UserTypes.STD },
                      { label: "Servidor", value: UserTypes.EMP },
                    ]}
                    required={true}
                    atualiza={setCargo}
                  />
                  <InputGroup
                    label="Matrícula/SIAPE"
                    value={user.identification || ''}
                    required={true}
                    atualiza={setIdentificacao}
                    keyboardType='number-pad'
                  />
                  <InputGroup
                    label="Email"
                    value={user.email}
                    required={true}
                    atualiza={setEmail}/>
                  <InputGroup
                    label="Celular"
                    value={user.phoneNumber || ''}
                    atualiza={setCelular}
                    required={false}
                    keyboardType='number-pad'
                  />
                  <InputGroup
                    label="Senha"
                    value={user.password}
                    pass={true}
                    required={true}
                    atualiza={setSenha}/>
                  <InputGroup
                    label="Confirmar Senha"
                    value={user.confirmPassword}
                    pass={true}
                    required={true}
                    atualiza={setConfirmeSenha}/>
                </View>

                <View style={styles.butnGroup}>
                  <Button
                    typeButton='backButton'
                    onPress={() => navigation.navigate('Login')}
                  >
                    <Text style={styles.textBtn}>Cancelar</Text>
                  </Button>

                  <Button
                    typeButton='mainButton'
                    onPress={() => cadastrar()}
                  >
                    <Text style={styles.textBtn}>Cadastrar</Text>
                  </Button>       
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
  );
}
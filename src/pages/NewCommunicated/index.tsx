import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {  useFocusEffect, useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { api } from '../../config';
import FormData from 'form-data';

import styles from './styles';
import Menu from '../../components/Menu';
import { InputGroup, SelectGroup } from '../../components/InputGroup';
import LinkList from '../../components/LinkList';
import { constantCategories } from '../../base/constants';
import { AuthContext } from '../../context/auth';

interface ISelectedImage {
  uri: string,
  name?: string,
  type: string,
}

export default function NewCommunicated() {

  const [link, setLink] = useState('');
  const [selectedImage, setSelectedImage] = useState<ISelectedImage | null>(null);
  const [referenceLinks, setReferenceLinks] = useState<string[]>([]);
  const { aviso } = useContext(AuthContext);
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const [inputValues, setInputValues] = useState({
    category: 'Notice',
    title: '',
    contents: ''
  })

  const handleInputChange = (input: { name: string; value: string; }) => {
    const { name, value } = input
    setInputValues({ ...inputValues, [name]: value })
  }
  
  useFocusEffect(
    React.useCallback(() => {
      setLink('');
      setSelectedImage(null);
      setReferenceLinks([]);
    }, [])
  )

  const handleAddLink = () => {
    if(!link) {
      aviso('Preencha o campo para adicionar referências.', 'warning');
    }

    const record = referenceLinks.find((item) => item == link.trim())

    if (record) {
      aviso('Mesmo link já inserido.', 'warning')
      return
    }
  
    setReferenceLinks([...referenceLinks, link.trim()])
    setLink('')
  }

  const handleRemoveLink = (link: string) => {
    const records = referenceLinks.filter((item) => item !== link)
    setReferenceLinks(records)
    setLink('')
  }

  const handleUpload = async () => {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled) {
          return;
      }

      const localUri = result.assets[0].uri;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename as string);
      const type = match ? `image/${match[1]}` : `image`;
      setSelectedImage({
        uri: localUri,
        name: filename,
        type
      })
    } catch (error) {
      aviso('Error ao anexar imagem', 'danger');
    }
  };

  const handleSubmit = async () => {
    const { title, category, contents } = inputValues;
    
    const data = new FormData();

    data.append('category', category)
    data.append('title', title)
    data.append('contents', contents)
    
    if (selectedImage) {
      data.append('file', selectedImage)
    }

    if (referenceLinks.length) {
      referenceLinks.forEach((link, index) => {
        data.append(`referenceLinks[${index}]`, link);
      });
    }

    
    try {
      await api.post('communique', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      aviso('Comunicado criado com sucesso.', 'success');
      navigation.navigate('Mural');
    } catch (error: any) {
      aviso('Falha ao criar comunicado.', 'danger');
      return
    }
  }

  const setRemoveImage = () => {
    setSelectedImage(null)
  }

  return (
    <View style={styles.container}>
      <Menu />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled style={{flex: 1}}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps={'handled'}
        >
            <Text style={styles.title}>Novo Comunicado</Text>

            <View style={styles.form}>
              <SelectGroup
                label='Categoria'
                lista={[
                  { label: "Aviso", value: constantCategories['Avisos'] },
                  { label: "Evento", value: constantCategories['Eventos'] },
                  { label: "Notícia", value: constantCategories['Notícias'] },
                  { label: "Palestra", value: constantCategories['Palestras'] }
                ]}
                required={true}
                atualiza={(value) => handleInputChange({name: 'category', value: value})}
              />

              <InputGroup
                label='Titulo'
                value={inputValues.title}
                required={true}
                atualiza={(value) => handleInputChange({name: 'title', value: value})}
              />

              <View>
                <Text style={styles.clipTxt}>Anexar imagem</Text>
                <View style={styles.optionsImage}>
                  {selectedImage ? (
                    <View style={styles.image}>
                      <TouchableOpacity onPress={setRemoveImage} style={styles.imageTrash}>
                        <Icon name='trash-can-outline' color={'#000'} style={styles.iconTrash}/>
                      </TouchableOpacity>
                      <Image
                        source={{ uri: selectedImage.uri }}
                        style={styles.imagePreview} />
                    </View>
                  ) : 
                    <TouchableOpacity onPress={handleUpload} style={styles.clipContainer}>
                      <Icon style={styles.clipIcon} name="paperclip" color="#000"/>
                    </TouchableOpacity>
                  }
                </View>
              </View>

              <InputGroup
                label="Conteúdo"
                value={inputValues.contents}
                atualiza={(value) => handleInputChange({name: 'contents', value: value})}
                required={true}
                multiline={true}
                numberLines={5}
              />

              <View style={styles.containeLink}>
                <View style={styles.inputLink}>
                  <InputGroup
                    label='Adicionar link de referência'
                    value={link}
                    atualiza={setLink}
                    required={false}
                  />
                </View>

                <TouchableOpacity
                  style={styles.btnPlus}
                  onPress={handleAddLink}
                >
                  <Icon style={styles.plus} name='plus-thick' color="#fff"/>
                </TouchableOpacity>
              </View>

              <View>
                {referenceLinks.map((l, i) => (
                  <LinkList link={l} indexLink={i} key={i} removeLink={() => handleRemoveLink(l)}/>
                ))}
              </View>
              
            </View>
        </ScrollView>
        <View style={styles.butnGroup}>
          <TouchableOpacity onPress={() => console.log('Voltar')} style={styles.butnCancelar}>
            <Text style={styles.textBtn}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSubmit} style={styles.butnCriar}>
            <Text style={styles.textBtn}>Criar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

        
    </View>

  );
}
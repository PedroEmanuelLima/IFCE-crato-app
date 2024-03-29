import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActionSheetIOS
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FormData from "form-data";
import { manipulateAsync } from "expo-image-manipulator";

import { api } from "../../config";
import styles from "./styles";
import Menu from "../../components/Menu";
import { InputGroup } from "../../components/InputGroup";
import { SelectGroup } from "../../components/SelectGroup";
import LinkList from "../../components/LinkList";
import { constantCategories } from "../../base/constants";
import { AuthContext } from "../../context/auth";
import { Button } from "../../components/Button";
import Tooltip from "../../components/Tooltip";
import { RFValue } from "react-native-responsive-fontsize";
import { defaultStyleProperties } from "../../base/styles";

interface ISelectedImage {
  uri: string;
  name?: string;
  type: string;
}

export default function NewCommunicated() {
  const [link, setLink] = useState("");
  const { aviso, setScreenLoading } = useContext(AuthContext);
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const [referenceLinks, setReferenceLinks] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<ISelectedImage | null>(
    null
  );
  const [heightInputContent, setHeightInputContent] = useState(40);
  const [inputValues, setInputValues] = useState({
    category: "Notice",
    title: "",
    contents: "",
  });
  const [formHasBeenSent, setFormHasBeenSent] = useState(false);

  const handleContentSizeChange = (event: any) => {
    setHeightInputContent(event.nativeEvent.contentSize.height);
  };

  const handleInputChange = (input: { name: string; value: string }) => {
    const { name, value } = input;
    setInputValues({ ...inputValues, [name]: value });
  };

  useFocusEffect(
    React.useCallback(() => {
      setLink("");
      setSelectedImage(null);
      setReferenceLinks([]);
      setInputValues({
        category: "Notice",
        title: "",
        contents: "",
      });
    }, [])
  );

  const handleAddLink = () => {
    if (!link) {
      aviso("Preencha o campo para adicionar referências.", "warning", RFValue(64));
      return;
    }

    const regExp = /^(https?):\/\/[^\s$.?#].[^\s]*$/g;
    const url = link.trim();
    const result = regExp.test(url);

    if (!result) {
      aviso("Link inválido!", "warning");
      return;
    }

    const record = referenceLinks.find((item) => item == link.trim());

    if (record) {
      aviso("Mesmo link já inserido.", "warning", RFValue(64));
      return;
    }

    setReferenceLinks([...referenceLinks, link.trim()]);
    setLink("");
  };

  const handleRemoveLink = (link: string) => {
    const records = referenceLinks.filter((item) => item !== link);
    setReferenceLinks(records);
    setLink("");
  };

  const handleUpload = async () => {
    try {
      const { granted } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [10, 8],
        quality: 1,
      });

      if (result.canceled) {
        return;
      }

      const manipulatedImage = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.5 }
      );

      const localUri = manipulatedImage.uri;
      const filename = localUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename as string);
      const type = match ? `image/${match[1]}` : `image`;
      setSelectedImage({
        uri: Platform.OS === "ios" ? localUri.replace("file://", "") : localUri,
        name: filename,
        type,
      });
    } catch (error) {
      aviso("Error ao anexar imagem", "danger", RFValue(64));
    }
  };

  const verifyErrors = (): string[] => {
    const errors = [];

    if (!inputValues.title.trim()) errors.push("Titulo");

    if (!inputValues.category.trim()) errors.push("Categoria");

    return errors;
  }

  const submitForm = () => {
    setFormHasBeenSent(true);
    setTimeout(() => {
      setFormHasBeenSent(false);
    }, 1000);
  };

  const handleSubmit = async () => {
    
    submitForm();
    const errors = verifyErrors();
    if(errors.length){
      return aviso(
        `Verifique os seguintes campos:\n${errors.join('\n')}`,
        'danger', RFValue(64));;
      }
      
    const { title, category, contents } = inputValues;
    const data = new FormData();

    data.append("category", category);
    data.append("title", title);
    data.append("contents", contents);

    if (selectedImage) {
      data.append("file", selectedImage);
    }

    if (referenceLinks.length) {
      referenceLinks.forEach((link, index) => {
        data.append(`referenceLinks[${index}]`, link);
      });
    }

    try {
      setScreenLoading(true);
      await api.post("communique", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      aviso("Comunicado criado com sucesso.", "success", RFValue(64));
      navigation.navigate("Mural");
    } catch (error: any) {
      aviso("Falha ao criar comunicado.", "danger", RFValue(64));
      return;
    }
    setScreenLoading(false);
  };

  const setRemoveImage = () => {
    setSelectedImage(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled
      style={styles.container}
    >
      <Menu />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps={"handled"}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Novo Comunicado</Text>

        <View style={styles.form}>
          <SelectGroup
            osType={Platform.OS}
            label="Categoria"
            value={inputValues.category}
            lista={Object.keys(constantCategories).map((key: any) => ({
              label: key,
              value: constantCategories[key],
            }))}
            atualiza={(value: string) =>
              handleInputChange({ name: "category", value: value })
            }
            messageErro="Selecione um curso!"
          />

          <InputGroup
            label="Titulo"
            value={inputValues.title}
            required={true}
            atualiza={(value: string) =>
              handleInputChange({ name: "title", value: value })
            }
            submit={formHasBeenSent}
            errorMessage={{
              valueIsValid: (value: string) => !!value.trim(),
              messageErro: "Informe um titulo para o comunicado!",
            }}
          />

          <View>
            <View style={styles.imageTooltipContainer}>
              <Text style={styles.clipTxt}>Anexar imagem</Text>
              <Tooltip tooltipText="Certifique-se de selecionar uma imagem com dimensões adequadas pra um bom enquadramento.">
                <Icon style={styles.tooltipIcon} name="information-outline" />
              </Tooltip>
            </View>
            <View style={styles.optionsImage}>
              {selectedImage ? (
                <View style={styles.image}>
                  <TouchableOpacity
                    onPress={setRemoveImage}
                    style={styles.imageTrash}
                  >
                    <Icon name="trash-can-outline" style={styles.iconTrash} />
                  </TouchableOpacity>
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={styles.imagePreview}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleUpload}
                  style={styles.clipContainer}
                >
                  <Icon style={styles.clipIcon} name="paperclip" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <InputGroup
            label="Conteúdo"
            value={inputValues.contents}
            atualiza={(value) =>
              handleInputChange({ name: "contents", value: value })
            }
            required={true}
            multiline={true}
            heigth={80}
            onContentSizeChange={handleContentSizeChange}
            errorMessage={{
              valueIsValid: (value: string) => !!value.trim(),
              messageErro: "Insira uma descrição!",
            }}
            submit={formHasBeenSent}
          />

          <View style={styles.containeLink}>
            <View style={styles.inputLink}>
              <InputGroup
                label="Adicionar link de referência"
                value={link}
                keyboardType="url"
                autoCapitalize="none"
                atualiza={setLink}
                required={false}
              />
            </View>

            <TouchableOpacity style={styles.btnPlus} onPress={handleAddLink}>
              <Icon style={styles.plus} name="plus-thick" />
            </TouchableOpacity>
          </View>

          <View>
            {referenceLinks.map((l, i) => (
              <LinkList
                link={l}
                indexLink={i}
                key={i}
                removeLink={() => handleRemoveLink(l)}
              />
            ))}
          </View>
        </View>

        <View style={styles.butnGroup}>
          <Button
            typeButton="mainButton"
            onPress={handleSubmit}
            style={styles.butnCriar}
          >
            <Text style={styles.textBtn}>Criar</Text>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { TextInput, View, StyleSheet,
    NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';

interface ICodeInputProps {
    code: string;
    setCode: React.Dispatch<React.SetStateAction<string>>;
}

const CodeInput = ({ setCode, code }: ICodeInputProps) => {

    const [inputIndex, setInputIndex] = useState<number>();
    useEffect(() => {
        if (!code.trim()) codeInputRefs[0].current?.focus();
    }, [code])
  const codeInputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleFocus = (index: number) => {
    if (index > code.split('').length){
        codeInputRefs[code.split('').length].current?.focus();
    }
  }

  const handleCodeChange = (value: string, index: number) => {
    setCode((prevCode) => {
        const newCode = prevCode.split('');
        newCode[index] = value;
        return newCode.join('');
    });

    if (value && index < 3) {
        codeInputRefs[index + 1].current?.focus();
    }

    if (index > 0 && !value && !code[index - 1]) {
        codeInputRefs[index - 2].current?.focus();
    }
  };

  const handleCodeKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    const key = event.nativeEvent.key;
    const keyboards = ['0','1','2','3','4','5','6','7','8','9']
    if (index < 3 && keyboards.includes(key)){
        if(code[index]) handleCodeChange(key, index)
    }

    if (key === 'Backspace' && index > 0) {
        codeInputRefs[index - 1].current?.focus();
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.container}>
            {Array.from({ length: 4 }).map((_, index) => (
                <TextInput
                    key={index}
                    ref={codeInputRefs[index]}
                    style={styles.codeInput}
                    maxLength={1}
                    value={code[index]}
                    onChangeText={(value) => handleCodeChange(value, index)}
                    onKeyPress={(event) => handleCodeKeyPress(event, index)}
                    keyboardType="number-pad"
                    onFocus={() => handleFocus(index)}
                />
            ))}
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        width: '90%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    codeInput: {
        padding: 16,
        textAlign: 'center',
        fontSize: 24,
        backgroundColor: '#D8D8D8',
        borderWidth: 1,
        borderColor: '#727272',
        borderRadius: 8
    },
});

export default CodeInput;
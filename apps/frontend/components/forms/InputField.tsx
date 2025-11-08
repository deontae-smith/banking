import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: string;
  secure?: boolean;
}

export function InputField({
  placeholder,
  value,
  onChangeText,
  icon,
  secure,
}: Props) {
  return (
    <View style={styles.inputContainer}>
      {icon && (
        <Ionicons
          name={icon as any}
          size={20}
          color='#9ca3af'
          style={{ marginRight: 8 }}
        />
      )}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        style={styles.input}
        placeholderTextColor='#9ca3af'
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
});

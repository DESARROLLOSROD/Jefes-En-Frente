import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { COLORS } from '../constants/config';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  helperText?: string;
  variant?: 'default' | 'login';
  containerStyle?: ViewStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  required,
  icon,
  helperText,
  secureTextEntry,
  style,
  variant = 'default',
  containerStyle,
  placeholder,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const showPasswordToggle = secureTextEntry !== undefined;
  const actualSecureEntry = showPasswordToggle && !isPasswordVisible;

  const isLoginVariant = variant === 'login';

  const finalPlaceholder =
    isLoginVariant && placeholder ? placeholder.toUpperCase() : placeholder;

  const wrapperStyle = [
    isLoginVariant ? styles.loginInputWrapper : styles.inputWrapper,
    !isLoginVariant && {
      backgroundColor: theme.inputBackground,
      borderColor: theme.inputBorder,
    },
    isFocused && !isLoginVariant && { borderColor: theme.primary, borderWidth: 2 },
    isFocused && isLoginVariant && { borderColor: COLORS.orange.primary, borderWidth: 1 },
    error && { borderColor: theme.danger },
    containerStyle,
  ];

  const inputStyle = [
    isLoginVariant ? styles.loginInput : styles.input,
    !isLoginVariant && icon ? styles.inputWithIcon : {},
    { color: isLoginVariant ? COLORS.dark : theme.text },
    style,
  ];

  return (
    <View style={styles.container}>
      {label && !isLoginVariant && (
        <Text style={[styles.label, { color: theme.text }]}>
          {label}
          {required && <Text style={[styles.required, { color: theme.danger }]}> *</Text>}
        </Text>
      )}
      <View style={wrapperStyle}>
        {icon && !isLoginVariant && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? theme.danger : isFocused ? theme.primary : theme.textSecondary}
            style={styles.icon}
          />
        )}
        <TextInput
          style={inputStyle}
          placeholder={finalPlaceholder}
          placeholderTextColor={isLoginVariant ? COLORS.gray : theme.inputPlaceholder}
          secureTextEntry={actualSecureEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.passwordToggle}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={theme.danger} />
          <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
        </View>
      )}
      {helperText && !error && (
        <Text style={[styles.helperText, { color: theme.textSecondary }]}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {},
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingLeft: 8,
  },
  icon: {
    marginRight: 4,
  },
  passwordToggle: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  // Login Variant
  loginInputWrapper: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.gray,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  loginInput: {
    fontSize: 14,
    color: COLORS.dark,
  },
});

export default Input;

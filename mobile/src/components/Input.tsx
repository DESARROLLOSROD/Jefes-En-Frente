import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  required,
  icon,
  helperText,
  secureTextEntry,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const showPasswordToggle = secureTextEntry !== undefined;
  const actualSecureEntry = showPasswordToggle && !isPasswordVisible;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.text }]}>
          {label}
          {required && <Text style={[styles.required, { color: theme.danger }]}> *</Text>}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
          isFocused && { borderColor: theme.primary, borderWidth: 2 },
          error && { borderColor: theme.danger },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? theme.danger : isFocused ? theme.primary : theme.textSecondary}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon, { color: theme.text }, style]}
          placeholderTextColor={theme.inputPlaceholder}
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
});

export default Input;

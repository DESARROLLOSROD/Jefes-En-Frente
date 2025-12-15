import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = [styles.button];

    // Size variants
    switch (size) {
      case 'small':
        baseStyle.push(styles.buttonSmall);
        break;
      case 'large':
        baseStyle.push(styles.buttonLarge);
        break;
      default:
        baseStyle.push(styles.buttonMedium);
    }

    // Color variants
    switch (variant) {
      case 'secondary':
        baseStyle.push({ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.primary });
        break;
      case 'danger':
        baseStyle.push({ backgroundColor: theme.danger });
        break;
      case 'success':
        baseStyle.push({ backgroundColor: theme.success });
        break;
      case 'outline':
        baseStyle.push({ backgroundColor: 'transparent', borderWidth: 2, borderColor: theme.primary });
        break;
      default:
        baseStyle.push({ backgroundColor: theme.primary });
    }

    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }

    if (disabled || loading) {
      baseStyle.push(styles.buttonDisabled);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText];

    // Size text
    switch (size) {
      case 'small':
        baseStyle.push(styles.textSmall);
        break;
      case 'large':
        baseStyle.push(styles.textLarge);
        break;
      default:
        baseStyle.push(styles.textMedium);
    }

    // Color text
    switch (variant) {
      case 'secondary':
      case 'outline':
        baseStyle.push({ color: theme.primary });
        break;
      default:
        baseStyle.push({ color: theme.white });
    }

    return baseStyle;
  };

  const getIconColor = () => {
    if (variant === 'secondary' || variant === 'outline') {
      return theme.primary;
    }
    return theme.white;
  };

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={getIconColor()} />;
    }

    return (
      <View style={styles.buttonContent}>
        {icon && iconPosition === 'left' && (
          <Ionicons name={icon} size={iconSize} color={getIconColor()} style={styles.iconLeft} />
        )}
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
        {icon && iconPosition === 'right' && (
          <Ionicons name={icon} size={iconSize} color={getIconColor()} style={styles.iconRight} />
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Sizes
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 36,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
  },
  // States
  buttonDisabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  // Text
  buttonText: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  // Icons
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;

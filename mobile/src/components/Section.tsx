import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../constants/config';

type SectionVariant = 'default' | 'orange' | 'blue' | 'green' | 'purple';

interface SectionProps {
  title: string;
  children: ReactNode;
  variant?: SectionVariant;
  style?: ViewStyle;
}

const Section: React.FC<SectionProps> = ({
  title,
  children,
  variant = 'default',
  style,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'orange':
        return {
          container: styles.containerOrange,
          title: styles.titleOrange,
        };
      case 'blue':
        return {
          container: styles.containerBlue,
          title: styles.titleBlue,
        };
      case 'green':
        return {
          container: styles.containerGreen,
          title: styles.titleGreen,
        };
      case 'purple':
        return {
          container: styles.containerPurple,
          title: styles.titlePurple,
        };
      default:
        return {
          container: {},
          title: styles.titleDefault,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.container, variantStyles.container, style]}>
      <Text style={[styles.title, variantStyles.title]}>{title}</Text>
      <View>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderTopWidth: 5,
    borderColor: COLORS.gray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  // Default
  titleDefault: {
    color: COLORS.dark,
  },
  // Orange Variant
  containerOrange: {
    borderColor: COLORS.orange.primary,
  },
  titleOrange: {
    color: COLORS.orange.primary,
  },
  // Blue Variant
  containerBlue: {
    borderColor: COLORS.info, // info color
  },
  titleBlue: {
    color: COLORS.info,
  },
  // Green Variant
  containerGreen: {
    borderColor: COLORS.success,
  },
  titleGreen: {
    color: COLORS.success,
  },
  // Purple Variant
  containerPurple: {
    borderColor: COLORS.purple.primary,
  },
  titlePurple: {
    color: COLORS.purple.primary,
  },
});

export default Section;

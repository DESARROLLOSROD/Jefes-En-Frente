import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

interface ImageViewerProps {
  images: string[];
  initialIndex?: number;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ images, initialIndex = 0 }) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (images.length === 0) return null;

  const openViewer = (index: number) => {
    setCurrentIndex(index);
    setVisible(true);
  };

  const closeViewer = () => {
    setVisible(false);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <>
      {/* Thumbnails */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbnailContainer}
      >
        {images.map((uri, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => openViewer(index)}
            style={styles.thumbnailWrapper}
          >
            <Image source={{ uri }} style={styles.thumbnail} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Full Screen Viewer */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={closeViewer}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.black }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <TouchableOpacity onPress={closeViewer} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={theme.white} />
            </TouchableOpacity>
            <View style={styles.counter}>
              <Ionicons name="images" size={20} color={theme.white} />
              <Text style={[styles.counterText, { color: theme.white }]}>
                {currentIndex + 1} / {images.length}
              </Text>
            </View>
          </View>

          {/* Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: images[currentIndex] }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>

          {/* Navigation */}
          {images.length > 1 && (
            <View style={styles.navigation}>
              <TouchableOpacity
                onPress={goToPrevious}
                disabled={currentIndex === 0}
                style={[
                  styles.navButton,
                  { backgroundColor: 'rgba(0,0,0,0.5)' },
                  currentIndex === 0 && styles.navButtonDisabled,
                ]}
              >
                <Ionicons
                  name="chevron-back"
                  size={32}
                  color={currentIndex === 0 ? theme.textDisabled : theme.white}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={goToNext}
                disabled={currentIndex === images.length - 1}
                style={[
                  styles.navButton,
                  { backgroundColor: 'rgba(0,0,0,0.5)' },
                  currentIndex === images.length - 1 && styles.navButtonDisabled,
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={32}
                  color={
                    currentIndex === images.length - 1 ? theme.textDisabled : theme.white
                  }
                />
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  thumbnailContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  thumbnailWrapper: {
    marginRight: 8,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterText: {
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: height - 150,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
});

export default ImageViewer;

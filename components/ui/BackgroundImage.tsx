import React from 'react';
import { ImageBackground, StyleSheet, View, ViewProps } from 'react-native';

const background = require('../../assets/images/background.png');

export default function BackgroundImage({ children, style, ...props }: ViewProps) {
  return (
    <ImageBackground
      source={background}
      style={[styles.background, style]}
      resizeMode="cover"
    >
      <View style={styles.overlay} {...props}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: undefined,
    height: undefined,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
}); 
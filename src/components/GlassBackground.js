import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Fundo padrão de todas as telas do app: um gradiente escuro com
// "blobs" coloridos desfocados atrás, que é o que dá profundidade
// para o efeito de vidro (glass) dos cartões que ficam por cima.
export default function GlassBackground({ children, style }) {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#0A1628', '#0F2548', '#0A1628']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={[styles.blob, styles.blobAzul]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobRoxo]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobCiano]} />
      <View style={styles.conteudo}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  conteudo: { flex: 1 },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.35 },
  blobAzul: {
    width: 260,
    height: 260,
    backgroundColor: '#1D4ED8',
    top: -60,
    right: -70,
  },
  blobRoxo: {
    width: 220,
    height: 220,
    backgroundColor: '#6D28D9',
    bottom: 40,
    left: -80,
  },
  blobCiano: {
    width: 180,
    height: 180,
    backgroundColor: '#0EA5E9',
    bottom: -60,
    right: -40,
  },
});

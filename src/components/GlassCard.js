import React from 'react';
import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

// Cartão "vidro fosco" reutilizável: usa BlurView para desfocar o que
// está atrás e uma sobreposição branca translúcida + borda clara por
// cima, criando o clássico efeito glassmorphism.
export default function GlassCard({
  children,
  style,
  intensity = 40,
  tint = 'light',
  ...props
}) {
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[styles.glass, style]}
      {...props}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  glass: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
});

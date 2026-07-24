import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

// Mostra a foto do usuário quando ele tem uma. Quando NÃO tem
// (uri vazio/null), mostra um círculo com a inicial do nome em vez de
// puxar uma foto aleatória da internet.
export default function Avatar({ uri, nome, size = 60, style }) {
  const dimensao = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.imagem, dimensao, style]} />;
  }

  return (
    <View style={[styles.placeholder, dimensao, style]}>
      <Text style={[styles.inicial, { fontSize: size * 0.4 }]}>
        {nome ? nome.charAt(0).toUpperCase() : '?'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  imagem: { backgroundColor: 'rgba(255,255,255,0.2)' },
  placeholder: {
    backgroundColor: '#1D4ED8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inicial: { color: '#FFF', fontWeight: 'bold' },
});

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useApp } from '../context/AppContext';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import Avatar from '../components/Avatar';
import NotificationBell from '../components/NotificationBell';

export default function ChatListScreen({ navigation }) {
  const { listarMinhasConversas, getUsuarioPorId, projetos } = useApp();
  const conversas = listarMinhasConversas();

  return (
    <GlassBackground style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Minhas conversas</Text>
        <NotificationBell />
      </View>
      <FlatList
        data={conversas}
        keyExtractor={(item) => item.chave}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const outroUsuario = getUsuarioPorId(item.outroUsuarioId);
          const projeto = projetos.find((p) => p.id === item.projetoId);
          return (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Chat', {
                  projetoId: item.projetoId,
                  outroUsuarioId: item.outroUsuarioId,
                })
              }>
              <GlassCard style={styles.chatItem}>
                <Avatar
                  uri={outroUsuario?.avatar}
                  nome={outroUsuario?.nome}
                  size={55}
                />
                <View style={styles.info}>
                  <Text style={styles.nome}>{outroUsuario?.nome}</Text>
                  <Text style={styles.projeto}>📁 {projeto?.titulo}</Text>
                  <Text numberOfLines={1} style={styles.ultimaMensagem}>
                    {item.ultimaMensagem.texto}
                  </Text>
                </View>
              </GlassCard>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.vazio}>Você ainda não possui conversas.</Text>
        }
      />
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 14,
  },
  info: { flex: 1, marginLeft: 15 },
  nome: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  projeto: { color: '#93C5FD', marginTop: 3, fontWeight: '600' },
  ultimaMensagem: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
    fontSize: 14,
  },
  vazio: {
    textAlign: 'center',
    marginTop: 40,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
});

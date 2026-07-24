import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import GlassCard from './GlassCard';

const ICONES_TIPO = {
  interesse: 'heart',
  salvo: 'bookmark',
  chat: 'chatbubble-ellipses',
};

// Sino de notificações reutilizável. Mostra um badge com a quantidade
// de novidades (interesses, salvamentos e mensagens) e, ao tocar,
// abre uma listinha em glass com o detalhe de cada uma.
export default function NotificationBell() {
  const { getNotificacoes } = useApp();
  const [aberto, setAberto] = useState(false);
  const notificacoes = getNotificacoes();

  return (
    <>
      <TouchableOpacity
        style={styles.botaoSino}
        onPress={() => setAberto(true)}>
        <Ionicons name="notifications" size={24} color="#FFF" />
        {notificacoes.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeTexto}>
              {notificacoes.length > 9 ? '9+' : notificacoes.length}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={aberto}
        transparent
        animationType="fade"
        onRequestClose={() => setAberto(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setAberto(false)}>
          <View style={styles.wrapperLista}>
            <GlassCard style={styles.card} intensity={60}>
              <Text style={styles.titulo}>Notificações</Text>
              <FlatList
                data={notificacoes}
                keyExtractor={(item) => item.id}
                style={styles.lista}
                renderItem={({ item }) => (
                  <View style={styles.item}>
                    <Ionicons
                      name={ICONES_TIPO[item.tipo] || 'notifications'}
                      size={18}
                      color="#93C5FD"
                    />
                    <Text style={styles.itemTexto}>{item.texto}</Text>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.vazio}>
                    Nenhuma notificação por aqui ainda.
                  </Text>
                }
              />
            </GlassCard>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  botaoSino: { padding: 6 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeTexto: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  wrapperLista: { width: 300 },
  card: { padding: 16 },
  titulo: { color: '#FFF', fontWeight: 'bold', fontSize: 17, marginBottom: 10 },
  lista: { maxHeight: 350 },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  itemTexto: {
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  vazio: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

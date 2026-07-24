import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useApp } from '../context/AppContext';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';

export default function ChatScreen({ route }) {
  const { projetoId, outroUsuarioId } = route.params;
  const { getMensagens, enviarMensagem, usuarioAtual, getUsuarioPorId } =
    useApp();
  const [texto, setTexto] = useState('');
  const mensagens = getMensagens(projetoId, outroUsuarioId);
  const outroUsuario = getUsuarioPorId(outroUsuarioId);

  const handleEnviar = async () => {
    if (!texto.trim()) return;
    await enviarMensagem(projetoId, outroUsuarioId, texto);
    setTexto('');
  };

  return (
    <GlassBackground>
      <GlassCard style={styles.header} intensity={30}>
        <Text style={styles.titulo}>{outroUsuario?.nome}</Text>
      </GlassCard>
      <FlatList
        data={mensagens}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const ehMinha = item.de === usuarioAtual.id;
          return (
            <View style={ehMinha ? styles.mensagemMinha : styles.mensagemOutro}>
              <Text style={ehMinha ? styles.textoMinha : styles.textoOutro}>
                {item.texto}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma mensagem ainda. Diga olá!</Text>
        }
      />
      <GlassCard style={styles.rodape} intensity={30}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={texto}
          onChangeText={setTexto}
        />
        <AnimatedButton style={styles.botaoEnviar} onPress={handleEnviar}>
          <Text style={styles.textoBotao}>Enviar</Text>
        </AnimatedButton>
      </GlassCard>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 0,
    borderWidth: 0,
    borderBottomWidth: 1,
  },
  titulo: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  lista: { padding: 16 },
  mensagemMinha: {
    alignSelf: 'flex-end',
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    marginBottom: 10,
    maxWidth: '75%',
  },
  mensagemOutro: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    marginBottom: 10,
    maxWidth: '75%',
  },
  textoMinha: { color: '#FFF', fontSize: 15 },
  textoOutro: { color: '#FFF', fontSize: 15 },
  vazio: { textAlign: 'center', color: '#FFF', marginTop: 40, fontSize: 16 },
  rodape: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    borderRadius: 0,
    borderWidth: 0,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    color: '#FFF',
  },
  botaoEnviar: {
    marginLeft: 10,
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
  },
  textoBotao: { color: '#FFF', fontWeight: 'bold' },
});

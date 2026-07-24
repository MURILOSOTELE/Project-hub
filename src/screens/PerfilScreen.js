import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useApp } from '../context/AppContext';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import Avatar from '../components/Avatar';
import AnimatedButton from '../components/AnimatedButton';
import NotificationBell from '../components/NotificationBell';

const ABAS = [
  { chave: 'meus', label: 'Meus projetos' },
  { chave: 'salvos', label: 'Salvos' },
  { chave: 'interesse', label: 'Tenho interesse' },
];

export default function PerfilScreen({ navigation }) {
  const { usuarioAtual, projetos, logout } = useApp();
  const [aba, setAba] = useState('meus');

  const meusProjetos = projetos.filter((p) => p.autorId === usuarioAtual.id);
  const projetosSalvos = projetos.filter((p) =>
    usuarioAtual.salvos.includes(p.id)
  );
  const projetosComInteresse = projetos.filter((p) =>
    p.interessados.includes(usuarioAtual.id)
  );

  const listaDaAba =
    aba === 'meus'
      ? meusProjetos
      : aba === 'salvos'
      ? projetosSalvos
      : projetosComInteresse;
  const textoVazio =
    aba === 'meus'
      ? 'Você ainda não publicou nenhum projeto.'
      : aba === 'salvos'
      ? 'Você ainda não salvou nenhum projeto.'
      : 'Você ainda não demonstrou interesse em nenhum projeto.';

  return (
    <GlassBackground>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <NotificationBell />
        </View>

        <GlassCard style={styles.card}>
          <Avatar
            uri={usuarioAtual.avatar}
            nome={usuarioAtual.nome}
            size={110}
            style={styles.avatar}
          />
          <Text style={styles.nome}>{usuarioAtual.nome}</Text>
          <Text style={styles.email}>{usuarioAtual.email}</Text>
          <Text style={styles.cidade}>📍 {usuarioAtual.cidade}</Text>
          <Text style={styles.bio}>
            {usuarioAtual.bio || 'Nenhuma descrição ainda.'}
          </Text>
          <AnimatedButton
            style={styles.botao}
            onPress={() => navigation.navigate('EditarPerfil')}>
            <Text style={styles.textoBotao}>Editar perfil</Text>
          </AnimatedButton>
          <AnimatedButton
            style={[styles.botao, styles.botaoSair]}
            onPress={logout}>
            <Text style={styles.textoBotao}>Sair</Text>
          </AnimatedButton>

          <View style={styles.linhaAbas}>
            {ABAS.map((item) => (
              <AnimatedButton
                key={item.chave}
                style={[styles.aba, aba === item.chave && styles.abaAtiva]}
                onPress={() => setAba(item.chave)}>
                <Text
                  style={[
                    styles.textoAba,
                    aba === item.chave && styles.textoAbaAtiva,
                  ]}>
                  {item.label}
                </Text>
              </AnimatedButton>
            ))}
          </View>

          {listaDaAba.length === 0 ? (
            <Text style={styles.vazio}>{textoVazio}</Text>
          ) : (
            listaDaAba.map((item) => (
              <GlassCard
                key={item.id}
                style={styles.projetoCard}
                intensity={25}>
                <Text style={styles.tituloProjeto}>{item.titulo}</Text>
                <Text style={styles.interessados}>
                  👥 {item.interessados.length} pessoa(s) interessada(s)
                </Text>
                {aba === 'meus' ? (
                  <AnimatedButton
                    style={styles.botaoEditarProjeto}
                    onPress={() =>
                      navigation.navigate('EditarProjeto', {
                        projetoId: item.id,
                      })
                    }>
                    <Text style={styles.textoEditar}>Editar projeto</Text>
                  </AnimatedButton>
                ) : (
                  <AnimatedButton
                    style={styles.botaoEditarProjeto}
                    onPress={() =>
                      navigation.navigate('ProjetoDetalhe', {
                        projetoId: item.id,
                      })
                    }>
                    <Text style={styles.textoEditar}>Ver projeto</Text>
                  </AnimatedButton>
                )}
              </GlassCard>
            ))
          )}
        </GlassCard>
      </ScrollView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 20, paddingBottom: 30 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  card: { padding: 20 },
  avatar: {
    alignSelf: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#60A5FA',
  },
  nome: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  email: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 5,
  },
  cidade: {
    fontSize: 15,
    color: '#93C5FD',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  bio: {
    marginTop: 18,
    marginBottom: 20,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },
  botao: {
    backgroundColor: '#1D4ED8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  botaoSair: { backgroundColor: '#F44336' },
  textoBotao: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  linhaAbas: { flexDirection: 'row', gap: 8, marginTop: 20, marginBottom: 18 },
  aba: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  abaAtiva: { backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' },
  textoAba: {
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
  textoAbaAtiva: { color: '#FFF' },
  projetoCard: { padding: 15, marginBottom: 15 },
  tituloProjeto: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  interessados: { marginTop: 8, color: 'rgba(255,255,255,0.75)', fontSize: 15 },
  botaoEditarProjeto: {
    backgroundColor: '#1D4ED8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  textoEditar: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  vazio: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    marginTop: 15,
    marginBottom: 10,
  },
});

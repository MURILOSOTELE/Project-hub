import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import Avatar from '../components/Avatar';
import AnimatedButton from '../components/AnimatedButton';

export default function ProjetoDetalheScreen({ route, navigation }) {
  const { projetoId } = route.params;

  const { projetos, usuarioAtual, demonstrarInteresse, salvarProjeto, getUsuarioPorId } = useApp();

  const projeto = projetos.find((p) => p.id === projetoId);
  const autor = getUsuarioPorId(projeto?.autorId);
  const jaTemInteresse = projeto?.interessados.includes(usuarioAtual.id);
  const jaSalvo = usuarioAtual.salvos.includes(projetoId);
  const ehMeuProprioProjeto = projeto?.autorId === usuarioAtual.id;

  if (!projeto) {
    return (
      <GlassBackground style={styles.container}>
        <Text style={styles.erro}>Projeto não encontrado.</Text>
      </GlassBackground>
    );
  }

  return (
    <GlassBackground>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.container}>
          <GlassCard style={styles.cardTopo}>
            <View style={styles.headerAutor}>
              <Avatar uri={autor?.avatar} nome={autor?.nome} size={60} />
              <View>
                <Text style={styles.nomeAutor}>{autor?.nome}{autor?.verificado ? ' ✔' : ''}</Text>
                <Text style={styles.cidade}>{autor?.cidade}</Text>
              </View>
            </View>

            {projeto.imagem && <Image source={{ uri: projeto.imagem }} style={styles.imagemProjeto} />}

            <Text style={styles.tipo}>{projeto.tipo === 'investidor' ? '💰 Busca investidor' : '🤝 Busca parceiro'}</Text>
            <Text style={styles.titulo}>{projeto.titulo}</Text>
            <Text style={styles.resumo}>{projeto.resumo}</Text>
          </GlassCard>

          <GlassCard style={styles.cardInfo}>
            <Text style={styles.label}>📁 Categoria</Text>
            <Text style={styles.valor}>{projeto.categoria}</Text>

            <Text style={styles.label}>📍 Localização</Text>
            <Text style={styles.valor}>{projeto.localizacao}</Text>

            <Text style={styles.label}>📅 Publicado em</Text>
            <Text style={styles.valor}>{projeto.data}</Text>

            {projeto.tipo === 'investidor' && projeto.valor && (
              <>
                <Text style={styles.label}>💰 Valor buscado</Text>
                <Text style={styles.valor}>{projeto.valor}</Text>
              </>
            )}

            {projeto.tipo === 'equipe' && projeto.procura && (
              <>
                <Text style={styles.label}>🤝 Procura</Text>
                <Text style={styles.valor}>{projeto.procura.join(', ')}</Text>
              </>
            )}

            <Text style={styles.label}>❤️ Interessados</Text>
            <Text style={styles.valor}>{projeto.interessados.length} pessoa(s)</Text>
          </GlassCard>

          {ehMeuProprioProjeto ? (
            <View style={styles.linhaBotoes}>
              <AnimatedButton style={styles.botaoMeuProjeto} onPress={() => navigation.navigate('EditarProjeto', { projetoId: projeto.id })}>
                <Text style={styles.textoBotao}>Gerenciar meu projeto</Text>
              </AnimatedButton>
            </View>
          ) : (
            <View style={styles.linhaBotoes}>
              <View style={styles.primeiraLinha}>
                <AnimatedButton style={[styles.botao, jaTemInteresse ? styles.botaoInteressado : styles.botaoInteresse]} onPress={() => demonstrarInteresse(projeto.id)}>
                  <Text style={styles.textoBotao}>{jaTemInteresse ? 'Interesse ✓' : 'Tenho interesse'}</Text>
                </AnimatedButton>
                <AnimatedButton style={[styles.botao, jaSalvo ? styles.botaoSalvo : styles.botaoSalvar]} onPress={() => salvarProjeto(projeto.id)}>
                  <Text style={styles.textoBotao}>{jaSalvo ? 'Salvo ✓' : 'Salvar'}</Text>
                </AnimatedButton>
              </View>
              <AnimatedButton style={styles.botaoGrande} onPress={() => navigation.navigate('Chat', { projetoId: projeto.id, outroUsuarioId: projeto.autorId })}>
                <Text style={styles.textoBotao}>Conversar com o autor</Text>
              </AnimatedButton>
            </View>
          )}
        </View>
      </ScrollView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  cardTopo: { padding: 18 },
  headerAutor: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 15 },
  nomeAutor: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  cidade: { color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  imagemProjeto: { width: '100%', height: 220, borderRadius: 18, marginBottom: 18 },
  tipo: { color: '#93C5FD', fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#FFF' },
  resumo: { marginTop: 15, fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 24 },
  cardInfo: { padding: 18, marginTop: 22 },
  label: { fontWeight: 'bold', fontSize: 15, color: '#93C5FD', marginTop: 12 },
  valor: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  linhaBotoes: { marginTop: 25, gap: 12 },
  primeiraLinha: { flexDirection: 'row', gap: 12 },
  botao: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  botaoInteresse: { backgroundColor: '#10B981' },
  botaoInteressado: { backgroundColor: '#047857' },
  botaoSalvar: { backgroundColor: '#f95777' },
  botaoSalvo: { backgroundColor: '#d8274a' },
  botaoGrande: { backgroundColor: '#1D4ED8', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  textoBotao: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  botaoMeuProjeto: { width: '100%', backgroundColor: '#6D28D9', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  erro: { textAlign: 'center', fontSize: 18, color: '#F44336', fontWeight: 'bold', marginTop: 40 },
});
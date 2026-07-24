import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import Avatar from '../components/Avatar';
import AnimatedButton from '../components/AnimatedButton';
import NotificationBell from '../components/NotificationBell';

const UMA_SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

const OPCOES_ORDENACAO = [
  { chave: 'recentes', label: 'Recentes' },
  { chave: 'mais_interesse', label: 'Mais interesse' },
  { chave: 'menos_interesse', label: 'Menos interesse' },
];

export default function FeedScreen({ navigation }) {
  const { projetos, usuarioAtual, demonstrarInteresse, salvarProjeto, getUsuarioPorId } = useApp();
  const [ordenacao, setOrdenacao] = useState('recentes');

  // Ordena os projetos de acordo com o critério escolhido. "Recentes"
  // prioriza quem postou na última semana; os demais critérios olham
  // a quantidade de interessados (nosso "like" de projeto).
  const projetosOrdenados = useMemo(() => {
    const agora = Date.now();
    const copia = [...projetos];

    if (ordenacao === 'recentes') {
      return copia.sort((a, b) => {
        const recenteA = agora - new Date(a.data).getTime() <= UMA_SEMANA_MS;
        const recenteB = agora - new Date(b.data).getTime() <= UMA_SEMANA_MS;
        if (recenteA !== recenteB) return recenteA ? -1 : 1;
        return new Date(b.data) - new Date(a.data);
      });
    }
    if (ordenacao === 'mais_interesse') {
      return copia.sort((a, b) => b.interessados.length - a.interessados.length);
    }
    if (ordenacao === 'menos_interesse') {
      return copia.sort((a, b) => a.interessados.length - b.interessados.length);
    }
    return copia;
  }, [projetos, ordenacao]);

  const renderProjeto = ({ item: projeto }) => {
    const autor = getUsuarioPorId(projeto.autorId);
    const jaTemInteresse = projeto.interessados.includes(usuarioAtual.id);
    const jaSalvo = usuarioAtual.salvos.includes(projeto.id);
    const ehMeuProprioProjeto = projeto.autorId === usuarioAtual.id;

    return (
      <TouchableOpacity onPress={() => navigation.navigate('ProjetoDetalhe', { projetoId: projeto.id })}>
        <GlassCard style={styles.card}>
          <View style={styles.headerAutor}>
            <Avatar uri={autor?.avatar} nome={autor?.nome} size={52} />
            <View style={styles.infoAutor}>
              <Text style={styles.nomeAutor}>{autor?.nome}{autor?.verificado ? ' ✔' : ''}</Text>
              <Text style={styles.cidade}>{autor?.cidade}</Text>
            </View>
          </View>
          {projeto.imagem && <Image source={{ uri: projeto.imagem }} style={styles.imagemProjeto} />}
          <Text style={styles.tipo}>{projeto.tipo === 'investidor' ? '💰 Busca investidor' : '🤝 Busca parceiro'}</Text>
          <Text style={styles.tituloProjeto}>{projeto.titulo}</Text>
          <Text style={styles.resumo}>{projeto.resumo}</Text>
          <Text style={styles.info}>Categoria: {projeto.categoria}</Text>
          <Text style={styles.info}>Por: {autor?.nome} • {autor?.cidade}</Text>
          <View style={styles.linhaBotoes}>
            {!ehMeuProprioProjeto ? (
              <>
                <View style={styles.primeiraLinha}>
                  <AnimatedButton style={[styles.botao, jaTemInteresse ? styles.botaoInteressado : styles.botaoInteresse]} onPress={() => demonstrarInteresse(projeto.id)}>
                    <Text style={styles.textoBotao}>{jaTemInteresse ? '✓ Interessado' : 'Tenho interesse'}</Text>
                  </AnimatedButton>
                  <AnimatedButton style={[styles.botao, jaSalvo ? styles.botaoSalvo : styles.botaoSalvar]} onPress={() => salvarProjeto(projeto.id)}>
                    <Text style={styles.textoBotao}>{jaSalvo ? '✓ Salvo' : 'Salvar'}</Text>
                  </AnimatedButton>
                </View>
                <AnimatedButton style={styles.botaoGrande} onPress={() => navigation.navigate('Chat', { projetoId: projeto.id, outroUsuarioId: projeto.autorId })}>
                  <Text style={styles.textoBotao}>💬 Conversar</Text>
                </AnimatedButton>
              </>
            ) : (
              <AnimatedButton style={styles.botaoMeuProjeto} onPress={() => navigation.navigate('ProjetoDetalhe', { projetoId: projeto.id })}>
                <Text style={styles.textoBotao}>Detalhes</Text>
              </AnimatedButton>
            )}
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <GlassBackground style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Feed de Projetos</Text>
        <NotificationBell />
      </View>

      <View style={styles.linhaOrdenacao}>
        {OPCOES_ORDENACAO.map((opcao) => (
          <AnimatedButton
            key={opcao.chave}
            style={[styles.chipOrdenacao, ordenacao === opcao.chave && styles.chipOrdenacaoAtivo]}
            onPress={() => setOrdenacao(opcao.chave)}
          >
            <Text style={[styles.textoChip, ordenacao === opcao.chave && styles.textoChipAtivo]}>{opcao.label}</Text>
          </AnimatedButton>
        ))}
      </View>

      <FlatList contentContainerStyle={styles.lista} data={projetosOrdenados} keyExtractor={(item) => item.id} renderItem={renderProjeto} showsVerticalScrollIndicator={false} ListEmptyComponent={<Text style={styles.vazio}>Nenhum projeto publicado ainda.</Text>} />
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 25, paddingTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titulo: { fontSize: 25, fontWeight: 'bold', color: '#FFF' },
  linhaOrdenacao: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  chipOrdenacao: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.08)' },
  chipOrdenacaoAtivo: { backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' },
  textoChip: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600' },
  textoChipAtivo: { color: '#FFF' },
  lista: { paddingBottom: 20 },
  card: { overflow: 'hidden', padding: 18, marginBottom: 20 },
  headerAutor: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  infoAutor: { marginLeft: 12 },
  nomeAutor: { fontSize: 17, fontWeight: 'bold', color: '#FFF' },
  cidade: { color: 'rgba(255,255,255,0.7)' },
  imagemProjeto: { width: '100%', height: 190, borderRadius: 14, marginBottom: 18 },
  tipo: { fontSize: 15, fontWeight: 'bold', color: '#93C5FD', marginBottom: 8 },
  tituloProjeto: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  resumo: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 12, lineHeight: 22 },
  info: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 5 },
  linhaBotoes: { marginTop: 18, gap: 12 },
  primeiraLinha: { flexDirection: 'row', gap: 12 },
  botao: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  botaoInteresse: { backgroundColor: '#10B981' },
  botaoInteressado: { backgroundColor: '#047857' },
  botaoSalvar: { backgroundColor: '#f95777' },
  botaoSalvo: { backgroundColor: '#d02245' },
  botaoGrande: { width: '100%', backgroundColor: '#1D4ED8', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  botaoMeuProjeto: { width: '100%', backgroundColor: '#6D28D9', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  textoBotao: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  vazio: { textAlign: 'center', color: '#FFF', marginTop: 60, fontSize: 18 },
});
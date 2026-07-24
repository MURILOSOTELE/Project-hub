import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useApp } from '../context/AppContext';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';

export default function EditarProjetoScreen({ route, navigation }) {
  const { projetoId } = route.params;
  const { projetos, editarProjeto } = useApp();
  const projeto = projetos.find((p) => p.id === projetoId);
  const [titulo, setTitulo] = useState(projeto?.titulo || '');
  const [resumo, setResumo] = useState(projeto?.resumo || '');
  const [valor, setValor] = useState(projeto?.valor || '');
  const [procura, setProcura] = useState(projeto?.procura?.join(', ') || '');
  const [salvando, setSalvando] = useState(false);

  if (!projeto) {
    return (
      <GlassBackground style={styles.container}>
        <Text style={styles.erro}>Projeto não encontrado.</Text>
      </GlassBackground>
    );
  }

  const handleSalvar = async () => {
    if (!titulo.trim() || !resumo.trim()) {
      Alert.alert('Atenção', 'Título e resumo são obrigatórios.');
      return;
    }
    setSalvando(true);
    const resultado = await editarProjeto(projetoId, {
      titulo: titulo.trim(),
      resumo: resumo.trim(),
      valor: projeto.tipo === 'investidor' ? valor.trim() : null,
      procura:
        projeto.tipo === 'equipe'
          ? procura
              .split(',')
              .map((p) => p.trim())
              .filter(Boolean)
          : null,
    });
    setSalvando(false);
    if (resultado.sucesso) navigation.goBack();
    else Alert.alert('Erro', resultado.erro);
  };

  return (
    <GlassBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.card}>
          <Text style={styles.titulo}>Editar projeto</Text>
          <TextInput
            style={styles.input}
            placeholder="Título do projeto"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={titulo}
            onChangeText={setTitulo}
          />
          <TextInput
            style={[styles.input, styles.inputResumo]}
            placeholder="Descreva seu projeto..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={resumo}
            onChangeText={setResumo}
            multiline
          />
          {projeto.tipo === 'investidor' && (
            <TextInput
              style={styles.input}
              placeholder="Valor buscado"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={valor}
              onChangeText={setValor}
              keyboardType="numeric"
            />
          )}
          {projeto.tipo === 'equipe' && (
            <TextInput
              style={styles.input}
              placeholder="Quem você procura? (Designer, Programador...)"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={procura}
              onChangeText={setProcura}
            />
          )}
          <AnimatedButton
            style={styles.botaoSalvar}
            onPress={handleSalvar}
            disabled={salvando}>
            <Text style={styles.textoBotao}>
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </Text>
          </AnimatedButton>
          <AnimatedButton
            style={styles.botaoCancelar}
            onPress={() => navigation.goBack()}>
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </AnimatedButton>
        </GlassCard>
      </ScrollView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  conteudo: { padding: 20, paddingBottom: 30 },
  card: { padding: 20 },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 15,
    marginBottom: 16,
    color: '#FFF',
  },
  inputResumo: { height: 120, textAlignVertical: 'top' },
  botaoSalvar: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  textoBotao: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  botaoCancelar: {
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#F44336',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  textoCancelar: { color: '#F44336', fontWeight: 'bold', fontSize: 16 },
  erro: {
    textAlign: 'center',
    fontSize: 18,
    color: '#F44336',
    fontWeight: 'bold',
    marginTop: 40,
  },
});

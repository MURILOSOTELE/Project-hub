import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { CATEGORIAS } from '../data/mockData';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';

export default function PublicarScreen({ navigation }) {
  const { publicarProjeto } = useApp();
  const [tipo, setTipo] = useState('investidor');
  const [titulo, setTitulo] = useState('');
  const [resumo, setResumo] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [localizacao, setLocalizacao] = useState('');
  const [imagem, setImagem] = useState(null);
  const [valor, setValor] = useState('');
  const [procura, setProcura] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);
  const [erroLocalizacao, setErroLocalizacao] = useState(false);

  // Busca a localização automaticamente assim que a tela abre.
  // A pessoa NÃO digita a localização — só pode tocar em "tentar
  // novamente" caso o GPS falhe.
  useEffect(() => {
    pegarLocalizacaoAtual();
  }, []);

  const pegarLocalizacaoAtual = async () => {
    setBuscandoLocalizacao(true);
    setErroLocalizacao(false);
    try {
      const permissao = await Location.requestForegroundPermissionsAsync();
      if (!permissao.granted) {
        setErroLocalizacao(true);
        Alert.alert(
          'Permissão necessária',
          'Precisamos acessar sua localização para publicar o projeto. Ative a permissão de localização e tente novamente.'
        );
        return;
      }
      const coords = await Location.getCurrentPositionAsync({});
      const endereco = await Location.reverseGeocodeAsync(coords.coords);
      if (endereco.length > 0) {
        const { city, region } = endereco[0];
        setLocalizacao([city, region].filter(Boolean).join(', '));
      } else {
        setErroLocalizacao(true);
      }
    } catch (e) {
      setErroLocalizacao(true);
    } finally {
      setBuscandoLocalizacao(false);
    }
  };

  const escolherImagem = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      aspect: [16, 9],
    });
    if (!resultado.canceled) setImagem(resultado.assets[0].uri);
  };

  const handlePublicar = async () => {
    if (!titulo.trim() || !resumo.trim()) {
      Alert.alert('Atenção', 'Preencha título e resumo.');
      return;
    }
    if (!localizacao.trim()) {
      Alert.alert(
        'Atenção',
        'Não conseguimos confirmar sua localização. Toque em "tentar novamente".'
      );
      return;
    }
    const dados = {
      tipo,
      titulo: titulo.trim(),
      resumo: resumo.trim(),
      categoria,
      localizacao: localizacao.trim(),
      imagem,
      valor: tipo === 'investidor' ? valor.trim() : null,
      procura:
        tipo === 'equipe'
          ? procura
              .split(',')
              .map((p) => p.trim())
              .filter(Boolean)
          : null,
    };
    setEnviando(true);
    const resultado = await publicarProjeto(dados);
    setEnviando(false);
    if (resultado.sucesso) {
      Alert.alert('Sucesso', 'Projeto publicado!');
      setTitulo('');
      setResumo('');
      setValor('');
      setProcura('');
      setImagem(null);
      navigation.navigate('FeedTab');
    } else Alert.alert('Erro', resultado.erro);
  };

  return (
    <GlassBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.card}>
          <Text style={styles.titulo}>Publicar projeto</Text>
          <View style={styles.linhaTipos}>
            <AnimatedButton
              style={[
                styles.botaoTipo,
                tipo === 'investidor' && styles.botaoTipoSelecionado,
              ]}
              onPress={() => setTipo('investidor')}>
              <Text
                style={[
                  styles.textoTipo,
                  tipo === 'investidor' && styles.textoTipoSelecionado,
                ]}>
                💰 Investidor
              </Text>
            </AnimatedButton>
            <AnimatedButton
              style={[
                styles.botaoTipo,
                tipo === 'equipe' && styles.botaoTipoSelecionado,
              ]}
              onPress={() => setTipo('equipe')}>
              <Text
                style={[
                  styles.textoTipo,
                  tipo === 'equipe' && styles.textoTipoSelecionado,
                ]}>
                🤝 Equipe
              </Text>
            </AnimatedButton>
          </View>

          <TouchableOpacity style={styles.areaImagem} onPress={escolherImagem}>
            {imagem ? (
              <Image source={{ uri: imagem }} style={styles.imagemPreview} />
            ) : (
              <View style={styles.imagemVazia}>
                <Ionicons
                  name="image-outline"
                  size={30}
                  color="rgba(255,255,255,0.6)"
                />
                <Text style={styles.textoImagemVazia}>
                  Adicionar imagem do projeto (opcional)
                </Text>
              </View>
            )}
            {imagem && (
              <TouchableOpacity
                style={styles.botaoRemoverImagem}
                onPress={() => setImagem(null)}>
                <Ionicons name="close" size={16} color="#FFF" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

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

          <View style={styles.blocoLocalizacao}>
            <Text style={styles.labelLocalizacao}>📍 Sua localização</Text>
            {buscandoLocalizacao ? (
              <View style={styles.linhaBuscando}>
                <ActivityIndicator color="#93C5FD" size="small" />
                <Text style={styles.textoBuscando}>
                  Buscando sua localização...
                </Text>
              </View>
            ) : localizacao ? (
              <Text style={styles.valorLocalizacao}>{localizacao}</Text>
            ) : (
              <View>
                <Text style={styles.textoErroLocalizacao}>
                  Não foi possível confirmar sua localização.
                </Text>
                <TouchableOpacity onPress={pegarLocalizacaoAtual}>
                  <Text style={styles.linkTentarNovamente}>
                    Tentar novamente
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.obsLocalizacao}>
              A localização é detectada automaticamente e não pode ser digitada.
            </Text>
          </View>

          {tipo === 'investidor' && (
            <TextInput
              style={styles.input}
              placeholder="Valor buscado (ex: R$ 10.000)"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={valor}
              onChangeText={setValor}
              keyboardType="numeric"
            />
          )}
          {tipo === 'equipe' && (
            <TextInput
              style={styles.input}
              placeholder="Quem você procura? (Ex: Designer, Programador)"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={procura}
              onChangeText={setProcura}
            />
          )}

          <AnimatedButton
            style={styles.botaoPublicar}
            onPress={handlePublicar}
            disabled={enviando}>
            <Text style={styles.textoBotao}>
              {enviando ? 'Publicando...' : 'Publicar projeto'}
            </Text>
          </AnimatedButton>
        </GlassCard>
      </ScrollView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  conteudo: { padding: 20 },
  card: { padding: 20, marginBottom: 20 },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
    color: '#FFF',
  },
  inputResumo: { height: 120, textAlignVertical: 'top' },
  linhaTipos: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  botaoTipo: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#60A5FA',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botaoTipoSelecionado: { backgroundColor: '#1D4ED8', borderColor: '#1D4ED8' },
  textoTipo: { color: '#60A5FA', fontWeight: 'bold' },
  textoTipoSelecionado: { color: '#FFF' },
  areaImagem: { marginBottom: 16, borderRadius: 14, overflow: 'hidden' },
  imagemPreview: { width: '100%', height: 160, borderRadius: 14 },
  imagemVazia: {
    height: 110,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  textoImagemVazia: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  botaoRemoverImagem: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 14,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blocoLocalizacao: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  labelLocalizacao: {
    color: '#93C5FD',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
  },
  linhaBuscando: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  textoBuscando: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  valorLocalizacao: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  textoErroLocalizacao: { color: '#F87171', fontSize: 14 },
  linkTentarNovamente: { color: '#93C5FD', fontWeight: 'bold', marginTop: 6 },
  obsLocalizacao: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    marginTop: 8,
  },
  botaoPublicar: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});
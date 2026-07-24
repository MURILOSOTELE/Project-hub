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
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useApp } from '../context/AppContext';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import Avatar from '../components/Avatar';
import AnimatedButton from '../components/AnimatedButton';

export default function EditarPerfilScreen({ navigation }) {
  const {
    usuarioAtual,
    editarPerfil,
    solicitarCodigoEmail,
    confirmarCodigoEmail,
    cancelarVerificacaoEmail,
  } = useApp();
  const [nome, setNome] = useState(usuarioAtual.nome);
  const [cidade, setCidade] = useState(usuarioAtual.cidade);
  const [bio, setBio] = useState(usuarioAtual.bio);
  const [avatar, setAvatar] = useState(usuarioAtual.avatar);
  const [salvando, setSalvando] = useState(false);
  const [pegandoLocalizacao, setPegandoLocalizacao] = useState(false);

  // ---- Troca de e-mail (exige código de verificação) ----
  const [trocandoEmail, setTrocandoEmail] = useState(false);
  const [novoEmail, setNovoEmail] = useState('');
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoDigitado, setCodigoDigitado] = useState('');
  const [enviandoCodigo, setEnviandoCodigo] = useState(false);
  const [confirmandoCodigo, setConfirmandoCodigo] = useState(false);

  const escolherFoto = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Permissão necessária', 'Precisamos acessar sua galeria.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });
    if (!resultado.canceled) setAvatar(resultado.assets[0].uri);
  };

  const pegarLocalizacao = async () => {
    setPegandoLocalizacao(true);
    const permissao = await Location.requestForegroundPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert(
        'Permissão necessária',
        'Precisamos acessar sua localização.'
      );
      setPegandoLocalizacao(false);
      return;
    }
    const coords = await Location.getCurrentPositionAsync({});
    const endereco = await Location.reverseGeocodeAsync(coords.coords);
    if (endereco.length > 0)
      setCidade(`${endereco[0].city}, ${endereco[0].region}`);
    setPegandoLocalizacao(false);
  };

  const handleSalvar = async () => {
    if (!nome.trim() || !cidade.trim()) {
      Alert.alert('Atenção', 'Nome e cidade são obrigatórios.');
      return;
    }
    setSalvando(true);
    const resultado = await editarPerfil({
      nome: nome.trim(),
      cidade: cidade.trim(),
      bio: bio.trim(),
      avatar,
    });
    setSalvando(false);
    if (resultado.sucesso) navigation.goBack();
    else Alert.alert('Erro', resultado.erro);
  };

  const abrirTrocaEmail = () => {
    setNovoEmail('');
    setCodigoDigitado('');
    setCodigoEnviado(false);
    setTrocandoEmail(true);
  };

  const cancelarTrocaEmail = () => {
    cancelarVerificacaoEmail();
    setTrocandoEmail(false);
    setCodigoEnviado(false);
    setNovoEmail('');
    setCodigoDigitado('');
  };

  const handleEnviarCodigo = async () => {
    setEnviandoCodigo(true);
    const resultado = await solicitarCodigoEmail(novoEmail);
    setEnviandoCodigo(false);
    if (resultado.sucesso) {
      setCodigoEnviado(true);
      if (resultado.emailReal) {
        // e-mail mandado de verdade via EmailJS — não mostra o código
        // na tela, senão perde o sentido de verificar por e-mail.
        Alert.alert('Código enviado', `Enviamos um código pro e-mail ${novoEmail}. Confira sua caixa de entrada (e o spam).`);
      } else {
        // plano B: API não respondeu (sem internet, config errada
        // no EmailJS, etc.) — mostra o código aqui mesmo, pra não
        // travar o teste/apresentação, e mostra o motivo real
        // (temporário, só pra debug — depois de descobrir a causa
        // dá pra tirar essa parte do "debug" do Alert).
        Alert.alert(
          'Código gerado (modo offline)',
          `Não consegui confirmar o envio pelo EmailJS, então aqui está o código pra você continuar testando: ${resultado.codigo}\n\nMotivo real do erro: ${resultado.debug}`
        );
      }
    } else {
      Alert.alert('Erro', resultado.erro);
    }
  };

  const handleConfirmarCodigo = async () => {
    if (!codigoDigitado.trim()) {
      Alert.alert('Atenção', 'Digite o código recebido.');
      return;
    }
    setConfirmandoCodigo(true);
    const resultado = await confirmarCodigoEmail(codigoDigitado);
    setConfirmandoCodigo(false);
    if (resultado.sucesso) {
      Alert.alert('Pronto!', 'Seu e-mail foi atualizado.');
      setTrocandoEmail(false);
      setCodigoEnviado(false);
    } else {
      Alert.alert('Erro', resultado.erro);
    }
  };

  return (
    <GlassBackground>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.card}>
          <Text style={styles.titulo}>Editar perfil</Text>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={escolherFoto}>
            <Avatar uri={avatar} nome={nome} size={120} style={styles.avatar} />
            <Text style={styles.trocarFoto}>
              {avatar ? 'Alterar foto' : 'Adicionar foto'}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Nome"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={nome}
            onChangeText={setNome}
          />

          {/* E-mail: só leitura aqui. Só muda pelo fluxo com código. */}
          <View style={styles.blocoEmail}>
            <Text style={styles.labelEmail}>E-mail</Text>
            <Text style={styles.valorEmail}>{usuarioAtual.email}</Text>
            {!trocandoEmail && (
              <TouchableOpacity onPress={abrirTrocaEmail}>
                <Text style={styles.linkAlterarEmail}>Alterar e-mail</Text>
              </TouchableOpacity>
            )}

            {trocandoEmail && !codigoEnviado && (
              <View style={styles.subBloco}>
                <TextInput
                  style={styles.input}
                  placeholder="Novo e-mail"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={novoEmail}
                  onChangeText={setNovoEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <View style={styles.linhaBotoesEmail}>
                  <AnimatedButton
                    style={styles.botaoSecundario}
                    onPress={cancelarTrocaEmail}>
                    <Text style={styles.textoSecundario}>Cancelar</Text>
                  </AnimatedButton>
                  <AnimatedButton
                    style={styles.botaoPrimario}
                    onPress={handleEnviarCodigo}
                    disabled={enviandoCodigo}>
                    <Text style={styles.textoBotao}>
                      {enviandoCodigo ? 'Enviando...' : 'Enviar código'}
                    </Text>
                  </AnimatedButton>
                </View>
              </View>
            )}

            {trocandoEmail && codigoEnviado && (
              <View style={styles.subBloco}>
                <Text style={styles.textoAvisoCodigo}>
                  Enviamos um código de 6 dígitos para {novoEmail}. Digite
                  abaixo para confirmar a troca.
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Código de verificação"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={codigoDigitado}
                  onChangeText={setCodigoDigitado}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <View style={styles.linhaBotoesEmail}>
                  <AnimatedButton
                    style={styles.botaoSecundario}
                    onPress={cancelarTrocaEmail}>
                    <Text style={styles.textoSecundario}>Cancelar</Text>
                  </AnimatedButton>
                  <AnimatedButton
                    style={styles.botaoPrimario}
                    onPress={handleConfirmarCodigo}
                    disabled={confirmandoCodigo}>
                    <Text style={styles.textoBotao}>
                      {confirmandoCodigo
                        ? 'Confirmando...'
                        : 'Confirmar código'}
                    </Text>
                  </AnimatedButton>
                </View>
                <TouchableOpacity onPress={handleEnviarCodigo}>
                  <Text style={styles.linkReenviar}>Reenviar código</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <AnimatedButton
            style={styles.botaoLocalizacao}
            onPress={pegarLocalizacao}
            disabled={pegandoLocalizacao}>
            <Text style={styles.textoLocalizacao}>
              {pegandoLocalizacao
                ? 'Buscando localização...'
                : '📍 Atualizar localização'}
            </Text>
          </AnimatedButton>
          <TextInput
            style={styles.input}
            value={cidade}
            onChangeText={setCidade}
            placeholder="Cidade"
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
          <TextInput
            style={[styles.input, styles.inputBio]}
            placeholder="Fale sobre você, sua área e experiências..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={bio}
            onChangeText={setBio}
            multiline
          />

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
  avatarContainer: { alignItems: 'center', marginBottom: 25 },
  avatar: { borderWidth: 3, borderColor: '#60A5FA' },
  trocarFoto: {
    marginTop: 12,
    color: '#60A5FA',
    fontWeight: 'bold',
    fontSize: 16,
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
  inputBio: { height: 120, textAlignVertical: 'top' },
  blocoEmail: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  labelEmail: {
    color: '#93C5FD',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
  },
  valorEmail: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  linkAlterarEmail: { color: '#93C5FD', fontWeight: 'bold' },
  subBloco: { marginTop: 12 },
  textoAvisoCodigo: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  linhaBotoesEmail: { flexDirection: 'row', gap: 10 },
  botaoPrimario: {
    flex: 1,
    backgroundColor: '#1D4ED8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  botaoSecundario: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  textoSecundario: { color: '#FFF', fontWeight: 'bold' },
  linkReenviar: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 13,
  },
  botaoLocalizacao: {
    borderWidth: 2,
    borderColor: '#60A5FA',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  textoLocalizacao: { color: '#60A5FA', fontWeight: 'bold', fontSize: 15 },
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
});
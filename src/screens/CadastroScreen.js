import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import * as Location from 'expo-location';
import { useApp } from '../context/AppContext';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';

// ---- Validação de senha ----
// Versão usada agora (mais simples, boa pra demonstração rápida):
// só exige 6 dígitos numéricos.
function validarSenha(senha) {
  if (!/^\d{6}$/.test(senha)) {
    return 'A senha deve ter exatamente 6 números.';
  }
  return null;
}

// Versão "de verdade" para produção, mais segura (mín. 8 caracteres,
// letra maiúscula, minúscula, número e símbolo). Deixei pronta e
// comentada — é só trocar a chamada em handleCadastro de
// validarSenha(senha) para validarSenhaForte(senha) quando quiser
// usar essa regra no lugar da de 6 números.
//
// function validarSenhaForte(senha) {
//   if (senha.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
//   if (!/[A-Z]/.test(senha)) return 'A senha deve ter pelo menos uma letra maiúscula.';
//   if (!/[a-z]/.test(senha)) return 'A senha deve ter pelo menos uma letra minúscula.';
//   if (!/[0-9]/.test(senha)) return 'A senha deve ter pelo menos um número.';
//   if (!/[^A-Za-z0-9]/.test(senha)) return 'A senha deve ter pelo menos um caractere especial (ex: !@#$%).';
//   return null;
// }

export default function CadastroScreen({ navigation }) {
  const { cadastrar } = useApp();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cidade, setCidade] = useState('');
  const [carregandoCadastro, setCarregandoCadastro] = useState(false);
  const [pegandoLocalizacao, setPegandoLocalizacao] = useState(false);

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
    if (endereco.length > 0) {
      setCidade(`${endereco[0].city}, ${endereco[0].region}`);
    }
    setPegandoLocalizacao(false);
  };

  const handleCadastro = async () => {
    if (!nome.trim() || !email.trim() || !senha.trim() || !cidade.trim()) {
      Alert.alert(
        'Atenção',
        'Preencha todos os campos e confirme sua localização.'
      );
      return;
    }

    const erroSenha = validarSenha(senha);
    if (erroSenha) {
      Alert.alert('Atenção', erroSenha);
      return;
    }

    setCarregandoCadastro(true);
    const resultado = await cadastrar({
      nome: nome.trim(),
      email: email.trim(),
      senha,
      cidade: cidade.trim(),
    });
    setCarregandoCadastro(false);
    if (!resultado.sucesso) {
      Alert.alert('Erro', resultado.erro);
    }
  };

  return (
    <GlassBackground style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.conteudo}>
          <GlassCard style={styles.card}>
            <Text style={styles.titulo}>Criar conta</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={nome}
              onChangeText={setNome}
            />

            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Senha (6 números)"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
            />

            <AnimatedButton
              style={styles.botaoLocalizacao}
              onPress={pegarLocalizacao}
              disabled={pegandoLocalizacao}>
              <Text style={styles.textoLocalizacao}>
                {pegandoLocalizacao
                  ? 'Buscando...'
                  : '📍 Confirmar minha localização'}
              </Text>
            </AnimatedButton>

            {cidade ? (
              <Text style={styles.cidadeConfirmada}>📍 {cidade}</Text>
            ) : (
              <Text style={styles.cidadePendente}>
                Localização não confirmada ainda
              </Text>
            )}

            <AnimatedButton
              style={styles.botao}
              onPress={handleCadastro}
              disabled={carregandoCadastro}>
              <Text style={styles.textoBotao}>
                {carregandoCadastro ? 'Criando conta...' : 'Criar conta'}
              </Text>
            </AnimatedButton>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Já tem conta? Entrar</Text>
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    padding: 24,
  },
  titulo: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#FFF',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#FFF',
  },
  botaoLocalizacao: {
    borderWidth: 2,
    borderColor: '#60A5FA',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 12,
  },
  textoLocalizacao: {
    color: '#60A5FA',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cidadeConfirmada: {
    color: '#93C5FD',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 15,
  },
  cidadePendente: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  botao: {
    backgroundColor: '#1D4ED8',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 17,
  },
  link: {
    textAlign: 'center',
    color: '#93C5FD',
    marginTop: 20,
    fontWeight: '600',
    fontSize: 15,
  },
});

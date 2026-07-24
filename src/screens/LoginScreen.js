import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useApp } from '../context/AppContext';
import GlassBackground from '../components/GlassBackground';
import GlassCard from '../components/GlassCard';
import AnimatedButton from '../components/AnimatedButton';

export default function LoginScreen({ navigation }) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregandoLogin, setCarregandoLogin] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    setCarregandoLogin(true);
    const resultado = await login(email.trim(), senha);
    setCarregandoLogin(false);
    if (!resultado.sucesso) Alert.alert('Erro', resultado.erro);
  };

  return (
    <GlassBackground style={styles.container}>
      <KeyboardAvoidingView
        style={styles.centro}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <GlassCard style={styles.card}>
          <Text style={styles.titulo}>Entrar</Text>
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
            placeholder="Senha"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
          <AnimatedButton
            style={styles.botao}
            onPress={handleLogin}
            disabled={carregandoLogin}>
            <Text style={styles.textoBotao}>
              {carregandoLogin ? 'Entrando...' : 'Entrar'}
            </Text>
          </AnimatedButton>
          <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
            <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
          </TouchableOpacity>
        </GlassCard>
      </KeyboardAvoidingView>
    </GlassBackground>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center' },
  centro: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 380, padding: 24 },
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
  botao: {
    backgroundColor: '#1D4ED8',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: { color: '#FFF', fontWeight: 'bold', fontSize: 17 },
  link: {
    textAlign: 'center',
    color: '#93C5FD',
    marginTop: 20,
    fontWeight: '600',
  },
});

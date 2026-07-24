import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../context/AppContext';

import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import FeedScreen from '../screens/FeedScreen';
import PublicarScreen from '../screens/PublicarScreen';
import ProjetoDetalheScreen from '../screens/ProjetoDetalheScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import PerfilScreen from '../screens/PerfilScreen';
import EditarPerfilScreen from '../screens/EditarPerfilScreen';
import EditarProjetoScreen from '../screens/EditarProjetoScreen';

const AuthStackNav = createNativeStackNavigator();
const FeedStackNav = createNativeStackNavigator();
const ChatStackNav = createNativeStackNavigator();
const PerfilStackNav = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function AuthStack() {
  return (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="Cadastro" component={CadastroScreen} />
    </AuthStackNav.Navigator>
  );
}

// Sub-stack da aba Feed: lista de projetos + tela de detalhe ao clicar
function FeedStack() {
  return (
    <FeedStackNav.Navigator screenOptions={{ headerShown: false }}>
      <FeedStackNav.Screen name="Feed" component={FeedScreen} />
      <FeedStackNav.Screen
        name="ProjetoDetalhe"
        component={ProjetoDetalheScreen}
      />
      <FeedStackNav.Screen name="Chat" component={ChatScreen} />
    </FeedStackNav.Navigator>
  );
}

// Sub-stack da aba Chats: lista de conversas + conversa aberta
function ChatStack() {
  return (
    <ChatStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ChatStackNav.Screen name="ChatList" component={ChatListScreen} />
      <ChatStackNav.Screen name="Chat" component={ChatScreen} />
    </ChatStackNav.Navigator>
  );
}

// Sub-stack da aba Perfil: perfil + edição + detalhe de projetos salvos/interessados
function PerfilStack() {
  return (
    <PerfilStackNav.Navigator screenOptions={{ headerShown: false }}>
      <PerfilStackNav.Screen name="Perfil" component={PerfilScreen} />
      <PerfilStackNav.Screen
        name="EditarPerfil"
        component={EditarPerfilScreen}
      />
      <PerfilStackNav.Screen
        name="EditarProjeto"
        component={EditarProjetoScreen}
      />
      <PerfilStackNav.Screen
        name="ProjetoDetalhe"
        component={ProjetoDetalheScreen}
      />
      <PerfilStackNav.Screen name="Chat" component={ChatScreen} />
    </PerfilStackNav.Navigator>
  );
}

export default function Navigation() {
  const { usuarioAtual, carregando } = useApp();

  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {usuarioAtual ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const ICONES_TAB = {
  FeedTab: 'home',
  PublicarTab: 'add-circle',
  ChatsTab: 'chatbubbles',
  PerfilTab: 'person',
};

function AppTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#60A5FA',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.15)',
          elevation: 0,
        },
        // Fundo de vidro fosco (blur) por trás da barra de abas.
        tabBarBackground: () => (
          <BlurView
            intensity={50}
            tint="dark"
            style={[StyleSheet.absoluteFill, styles.tabBarBlur]}
          />
        ),
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONES_TAB[route.name]} size={size} color={color} />
        ),
      })}>
      <Tabs.Screen
        name="FeedTab"
        component={FeedStack}
        options={{ title: 'Feed' }}
      />
      <Tabs.Screen
        name="PublicarTab"
        component={PublicarScreen}
        options={{ title: 'Publicar' }}
      />
      <Tabs.Screen
        name="ChatsTab"
        component={ChatStack}
        options={{ title: 'Chats' }}
      />
      <Tabs.Screen
        name="PerfilTab"
        component={PerfilStack}
        options={{ title: 'Perfil' }}
      />
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarBlur: { backgroundColor: 'rgba(10,22,40,0.4)' },
});

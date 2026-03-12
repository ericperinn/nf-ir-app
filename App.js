import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import ListagemScreen from './src/screens/ListagemScreen';
import NovaNotaScreen from './src/screens/NovaNotaScreen';
import DetalhesNotaScreen from './src/screens/DetalhesNotaScreen';
import ResumoScreen from './src/screens/ResumoScreen';

import { COLORS } from './src/utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function NovaNotaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NovaNota" component={NovaNotaScreen} />
    </Stack.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="NovaNotaStack" component={NovaNotaStack} options={{ presentation: 'modal' }} />
      <Stack.Screen name="DetalhesNota" component={DetalhesNotaScreen} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.bgCard,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Listagem: focused ? 'receipt' : 'receipt-outline',
            Resumo: focused ? 'bar-chart' : 'bar-chart-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Início' }} />
      <Tab.Screen name="Listagem" component={ListagemScreen} options={{ tabBarLabel: 'Notas' }} />
      <Tab.Screen name="Resumo" component={ResumoScreen} options={{ tabBarLabel: 'IR' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <RootStack />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

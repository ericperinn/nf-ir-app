import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';

// Stack root
export type RootStackParamList = {
    Tabs: undefined;
    NovaNotaStack: undefined;
    DetalhesNota: { id: string };
};

// Tab navigator
export type TabParamList = {
    Home: undefined;
    Listagem: undefined;
    Resumo: undefined;
};

// Nav prop para as telas das tabs
export type TabScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    NativeStackNavigationProp<RootStackParamList>
>;

// Route props para DetalhesNota
export type DetalhesNotaRouteProp = RouteProp<RootStackParamList, 'DetalhesNota'>;

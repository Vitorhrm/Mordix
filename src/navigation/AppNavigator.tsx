import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStack } from './types';
import { useAuth } from '../features/auth/AuthContext';
import {
  ForgotPasswordScreen,
  LoginScreen,
  RegisterScreen,
  ResetPasswordScreen,
} from '../features/auth/AuthScreens';
import { HomeContent, ProductScreen, StoreScreen } from '../features/catalog/CatalogScreens';
import { CartScreen, CheckoutScreen } from '../features/cart/CartScreens';
import { AddressesScreen, HelpScreen, ProfileContent } from '../features/profile/ProfileScreens';
import { Empty, Page, ui } from '../components/ui';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStack>();
const navigationRef = createNavigationContainerRef<RootStack>();
const tabs = [
  { name: 'Início', icon: 'home-outline' },
  { name: 'Buscar', icon: 'search-outline' },
  { name: 'Pedidos', icon: 'receipt-outline' },
  { name: 'Perfil', icon: 'person-outline' },
] as const;

function MainScreen({ navigation }: NativeStackScreenProps<RootStack, 'Main'>) {
  const [tab, setTab] = useState('Início');
  const { session } = useAuth();
  const footer = (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      {tabs.map((item) => (
        <Pressable
          key={item.name}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === item.name }}
          onPress={() => setTab(item.name)}
          style={{ flex: 1, minHeight: 64, alignItems: 'center', justifyContent: 'center', gap: 5 }}
        >
          <Ionicons
            name={item.icon}
            size={23}
            color={tab === item.name ? colors.primary : colors.muted}
          />
          <Text style={{ fontSize: 11, color: tab === item.name ? colors.primary : colors.muted }}>
            {item.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
  return (
    <Page footer={footer}>
      {(tab === 'Início' || tab === 'Buscar') && (
        <HomeContent navigation={navigation} searchOnly={tab === 'Buscar'} />
      )}
      {tab === 'Perfil' && <ProfileContent navigation={navigation} />}
      {tab === 'Pedidos' && (
        <>
          <Text style={ui.title}>Seus pedidos</Text>
          <Empty
            title={session ? 'Seu primeiro pedido está por vir' : 'Entre para ver seus pedidos'}
            description="A integração de pedidos será feita na próxima etapa. Nesta versão, você já pode criar sua conta e entrar."
          />
        </>
      )}
    </Page>
  );
}

export function AppNavigator() {
  const { ready, recovering } = useAuth();
  useEffect(() => {
    if (recovering && navigationRef.isReady()) navigationRef.navigate('ResetPassword');
  }, [recovering]);
  if (!ready)
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        if (recovering) navigationRef.navigate('ResetPassword');
      }}
    >
      <Stack.Navigator
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
      >
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Store" component={StoreScreen} />
        <Stack.Screen name="Product" component={ProductScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Addresses" component={AddressesScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

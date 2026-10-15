import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/features/auth/AuthContext';
import { ShoppingProvider } from './src/features/cart/ShoppingContext';
import { AppNavigator } from './src/navigation/AppNavigator';

// Reúne autenticação, carrinho e navegação na entrada do aplicativo.
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ShoppingProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </ShoppingProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

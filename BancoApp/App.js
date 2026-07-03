import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AlertProvider } from './src/shared/components/CustomAlert';

export default function App() {
  return (
    <SafeAreaProvider>
      <AlertProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </AlertProvider>
    </SafeAreaProvider>
  );
}
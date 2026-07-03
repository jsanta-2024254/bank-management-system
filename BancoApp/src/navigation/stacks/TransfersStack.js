import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TransferScreen from '../../features/transfers/screens/TransferScreen';
import TransferConfirmScreen from '../../features/transfers/screens/TransferConfirmScreen';
import TransferSuccessScreen from '../../features/transfers/screens/TransferSuccessScreen';
import { COLORS } from '../../shared/constants/colors';

const Stack = createNativeStackNavigator();

const TransfersStack = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: { backgroundColor: COLORS.primary },
    headerTintColor: COLORS.white,
    headerTitleStyle: { fontWeight: '700' },
  }}>
    <Stack.Screen 
      name="Transfer"        
      component={TransferScreen}        
      options={{ 
        title: 'Nueva transferencia',
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.primary,
        headerTitleStyle: { fontWeight: '700', color: COLORS.primary },
      }} 
    />
    <Stack.Screen name="TransferConfirm" component={TransferConfirmScreen} options={{ title: 'Confirmar transferencia' }} />
    <Stack.Screen name="TransferSuccess" component={TransferSuccessScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export default TransfersStack;
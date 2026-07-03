import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DepositsScreen from '../../features/deposits/screens/DepositsScreen';
import RequestDepositScreen from '../../features/deposits/screens/RequestDepositScreen';
import { COLORS } from '../../shared/constants/colors';

const Stack = createNativeStackNavigator();

const DepositsStack = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: { backgroundColor: COLORS.primary },
    headerTintColor: COLORS.white,
    headerTitleStyle: { fontWeight: '700' },
  }}>
    <Stack.Screen name="DepositsList" component={DepositsScreen} options={{ title: 'Mis depósitos' }} />
    <Stack.Screen name="RequestDeposit" component={RequestDepositScreen} options={{ title: 'Solicitar depósito' }} />
  </Stack.Navigator>
);

export default DepositsStack;
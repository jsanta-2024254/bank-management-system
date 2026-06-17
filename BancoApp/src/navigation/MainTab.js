import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../shared/constants/colors';
import AccountsStack from './stacks/AccountsStack';
import TransfersStack from './stacks/TransfersStack';
import FavoritesStack from './stacks/FavoritesStack';
import ProfileStack from './stacks/ProfileStack';
import DepositsStack from './stacks/DepositsStack';
import CurrencyStack from './stacks/CurrencyStack';
import ProductsStack from './stacks/ProductsStack';



const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Inicio',      icon: 'home',             stack: AccountsStack  },
  { name: 'Transferir',  icon: 'swap-horizontal',  stack: TransfersStack },
  { name: 'Favoritos',   icon: 'heart',            stack: FavoritesStack },
  { name: 'Depósitos',   icon: 'arrow-down-circle', stack: DepositsStack },
  { name: 'Divisas',     icon: 'cash',             stack: CurrencyStack  },
  { name: 'Productos',   icon: 'briefcase',             stack: ProductsStack },
  { name: 'Perfil',      icon: 'person',           stack: ProfileStack   },
];

const MainTab = () => (
  <Tab.Navigator
    screenOptions={({ route }) => {
      const tab = TABS.find(t => t.name === route.name);
      return {
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.borderLight,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={focused ? tab.icon : `${tab.icon}-outline`}
            size={size}
            color={color}
          />
        ),
      };
    }}
  >
    {TABS.map(tab => (
      <Tab.Screen key={tab.name} name={tab.name} component={tab.stack} />
    ))}
  </Tab.Navigator>
);

export default MainTab;
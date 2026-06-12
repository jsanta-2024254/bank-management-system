import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { sendTwoFactor, verifyTwoFactor, getProfile } from '../api/auth';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  pendingEmailOrUsername: null,

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const userStr = await SecureStore.getItemAsync('userData');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  // Paso 1 — valida credenciales y solicita código 2FA
  requestTwoFactor: async (emailOrUsername) => {
    await sendTwoFactor(emailOrUsername);
    set({ pendingEmailOrUsername: emailOrUsername });
  },

  // Paso 2 — verifica código y guarda sesión
 verifyAndLogin: async (code, emailOrUsername) => {
  const pending = emailOrUsername || get().pendingEmailOrUsername;
  const data = await verifyTwoFactor({ emailOrUsername: pending, code });
  const token = data.token;
  const user = data.userDetails;
  await SecureStore.setItemAsync('userToken', String(token));
  await SecureStore.setItemAsync('userData', JSON.stringify(user));
  set({ token, user, isAuthenticated: true, pendingEmailOrUsername: null });
},

  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    set({ user: null, token: null, isAuthenticated: false, pendingEmailOrUsername: null });
  },

  updateUser: async (updatedUser) => {
    await SecureStore.setItemAsync('userData', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  refreshProfile: async () => {
    try {
      const data = await getProfile();
      const user = data.data || data;
      await SecureStore.setItemAsync('userData', JSON.stringify(user));
      set({ user });
    } catch {}
  },
}));

export default useAuthStore;
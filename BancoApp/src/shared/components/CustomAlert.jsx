import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { THEME } from '../constants/theme';

const AlertContext = createContext(null);

const TYPE_CONFIG = {
  success: { icon: 'checkmark-circle', color: COLORS.success, bg: '#E6F9F2' },
  error:   { icon: 'close-circle',     color: COLORS.error,   bg: '#FEE2E2' },
  warning: { icon: 'warning',          color: COLORS.warning, bg: '#FEF3C7' },
  info:    { icon: 'information-circle', color: COLORS.info,  bg: '#DBEAFE' },
};

export const AlertProvider = ({ children }) => {
  const [config, setConfig] = useState(null);

  const showAlert = useCallback(({ type = 'info', title, message, buttons }) => {
    setConfig({
      type, title, message,
      buttons: buttons || [{ text: 'OK', onPress: () => setConfig(null) }],
    });
  }, []);

  const hideAlert = () => setConfig(null);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal visible={!!config} transparent animationType="fade" onRequestClose={hideAlert}>
        <View style={styles.overlay}>
          {config && (
            <View style={styles.box}>
              <View style={[styles.iconBox, { backgroundColor: TYPE_CONFIG[config.type].bg }]}>
                <Ionicons name={TYPE_CONFIG[config.type].icon} size={32} color={TYPE_CONFIG[config.type].color} />
              </View>
              {config.title ? <Text style={styles.title}>{config.title}</Text> : null}
              {config.message ? <Text style={styles.message}>{config.message}</Text> : null}

              <View style={styles.btnRow}>
                {config.buttons.map((btn, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.btn,
                      btn.style === 'destructive' && styles.btnDestructive,
                      btn.style === 'cancel' && styles.btnCancel,
                      config.buttons.length > 1 && { flex: 1 },
                    ]}
                    onPress={() => { btn.onPress?.(); hideAlert(); }}
                  >
                    <Text style={[
                      styles.btnText,
                      btn.style === 'destructive' && styles.btnTextDestructive,
                      btn.style === 'cancel' && styles.btnTextCancel,
                    ]}>
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  box: {
    backgroundColor: COLORS.surface, borderRadius: 20, padding: 24, width: '100%', maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
  },
  iconBox: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 6, textAlign: 'center' },
  message: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  btnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  btn: { backgroundColor: COLORS.primaryLight, borderRadius: 12, paddingVertical: 13, alignItems: 'center', width: '100%' },
  btnDestructive: { backgroundColor: COLORS.error },
  btnCancel: { backgroundColor: COLORS.borderLight },
  btnText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  btnTextDestructive: { color: COLORS.white },
  btnTextCancel: { color: COLORS.textSecondary },
});
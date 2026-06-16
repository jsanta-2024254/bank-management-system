import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES, THEME } from '../../../shared/constants/theme';
import { requestDeposit } from '../../../api/deposits';
import { getMyAccounts } from '../../../api/accounts';

const formatCurrency = (amount) =>
  `Q ${parseFloat(amount || 0).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const RequestDepositScreen = ({ navigation }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [tipoDeposito, setTipoDeposito] = useState('efectivo');
  const [monto, setMonto] = useState('');
  const [referencia, setReferencia] = useState('');
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getMyAccounts();
        const list = data.data || data;
        setAccounts(list);
        if (list.length > 0) setSelectedAccount(list[0]);
      } catch {
        Alert.alert('Error', 'No se pudieron cargar las cuentas.');
      } finally {
        setLoadingAccounts(false);
      }
    };
    fetchAccounts();
  }, []);

  const handleSubmit = async () => {
    if (!selectedAccount) {
      Alert.alert('Requerido', 'Selecciona una cuenta destino.'); return;
    }
    const montoNum = parseFloat(monto);
    if (!monto || isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto válido mayor a Q0.00'); return;
    }

    Alert.alert(
      'Confirmar solicitud',
      `¿Solicitar depósito de ${formatCurrency(montoNum)} en tu cuenta ${selectedAccount.tipoCuenta}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setLoading(true);
            try {
              await requestDeposit({
                cuentaId: selectedAccount._id,
                tipoDeposito,
                monto: montoNum,
                referencia: referencia.trim() || undefined,
                comentarioUsuario: comentario.trim() || undefined,
              });
              Alert.alert(
                '✅ Solicitud enviada',
                'Tu solicitud de depósito fue enviada. El banco la revisará pronto.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'No se pudo enviar la solicitud.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loadingAccounts) {
    return (
      <View style={[COMMON_STYLES.container, COMMON_STYLES.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={COMMON_STYLES.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Selector de cuenta */}
        <Text style={COMMON_STYLES.sectionTitle}>Cuenta destino</Text>
        {accounts.map(acc => (
          <TouchableOpacity
            key={String(acc._id)}
            style={[styles.accountOption, selectedAccount?._id === acc._id && styles.accountOptionSelected]}
            onPress={() => setSelectedAccount(acc)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.accountType}>
                {acc.tipoCuenta === 'monetaria' ? 'Cuenta Monetaria' : 'Cuenta de Ahorro'}
              </Text>
              <Text style={styles.accountNumber}>•••• {acc.numeroCuenta?.slice(-4)}</Text>
            </View>
            <Text style={styles.accountBalance}>{formatCurrency(acc.saldo)}</Text>
            {selectedAccount?._id === acc._id && (
              <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>
        ))}

        {/* Tipo de depósito */}
        <Text style={[COMMON_STYLES.sectionTitle, { marginTop: 8 }]}>Tipo de depósito</Text>
        <View style={styles.typeRow}>
          {[
            { key: 'efectivo', label: '💵 Efectivo' },
            { key: 'cheque',   label: '🧾 Cheque'   },
          ].map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeBtn, tipoDeposito === t.key && styles.typeBtnActive]}
              onPress={() => setTipoDeposito(t.key)}
            >
              <Text style={[styles.typeBtnText, tipoDeposito === t.key && styles.typeBtnTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Monto */}
        <Text style={COMMON_STYLES.label}>Monto (Q)</Text>
        <TextInput
          style={COMMON_STYLES.input}
          placeholder="0.00"
          placeholderTextColor={COLORS.textSecondary}
          value={monto}
          onChangeText={setMonto}
          keyboardType="decimal-pad"
        />

        {/* Referencia */}
        <Text style={COMMON_STYLES.label}>Referencia (opcional)</Text>
        <TextInput
          style={COMMON_STYLES.input}
          placeholder="Ej. Número de boleta, cheque, etc."
          placeholderTextColor={COLORS.textSecondary}
          value={referencia}
          onChangeText={setReferencia}
          maxLength={100}
        />

        {/* Comentario */}
        <Text style={COMMON_STYLES.label}>Comentario (opcional)</Text>
        <TextInput
          style={[COMMON_STYLES.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Agrega un comentario para el banco..."
          placeholderTextColor={COLORS.textSecondary}
          value={comentario}
          onChangeText={setComentario}
          maxLength={300}
          multiline
        />

        <TouchableOpacity
          style={[COMMON_STYLES.primaryButton, loading && COMMON_STYLES.primaryButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={COMMON_STYLES.buttonText}>Enviar solicitud</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          style={[COMMON_STYLES.secondaryButton, { marginTop: 12 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={COMMON_STYLES.secondaryButtonText}>Cancelar</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  accountOption: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  accountOptionSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySurface },
  accountType: { fontSize: 12, color: COLORS.textSecondary },
  accountNumber: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginTop: 2 },
  accountBalance: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', backgroundColor: COLORS.surface,
  },
  typeBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primarySurface },
  typeBtnText: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  typeBtnTextActive: { color: COLORS.primary, fontWeight: '700' },
});

export default RequestDepositScreen;
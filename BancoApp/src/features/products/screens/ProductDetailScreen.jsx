import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { COLORS } from '../../../shared/constants/colors';
import { COMMON_STYLES, THEME } from '../../../shared/constants/theme';
import { quoteProduct, requestCreditFromOpportunity } from '../../../api/products';
import { getMyAccounts } from '../../../api/accounts';

const formatCurrency = (amount) =>
  `Q ${parseFloat(amount || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const isCredito = product.tipo === 'credito';

  const [monto, setMonto] = useState('');
  const [plazoMeses, setPlazoMeses] = useState(String(product.plazoMesesMinimo || 6));
  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const handleQuote = async () => {
    const numMonto = parseFloat(monto);
    if (!monto || isNaN(numMonto) || numMonto <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto válido.'); return;
    }
    setLoadingQuote(true);
    try {
      const data = await quoteProduct(product._id, {
        monto: numMonto,
        plazoMeses: parseInt(plazoMeses, 10),
      });
      setQuote(data.data || data);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo cotizar el producto.');
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleRequestCredit = async () => {
    const numMonto = parseFloat(monto);
    if (!monto || isNaN(numMonto) || numMonto <= 0) {
      Alert.alert('Monto inválido', 'Ingresa un monto válido.'); return;
    }
    try {
      const accountsData = await getMyAccounts();
      const accounts = accountsData.data || accountsData;
      if (!accounts.length) {
        Alert.alert('Sin cuentas', 'No tienes cuentas disponibles para recibir el crédito.'); return;
      }
      const cuenta = accounts[0];

      Alert.alert(
        'Confirmar solicitud',
        `¿Solicitar crédito de ${formatCurrency(numMonto)} a ${plazoMeses} meses?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Solicitar',
            onPress: async () => {
              setRequesting(true);
              try {
                await requestCreditFromOpportunity(product._id, {
                  cuentaId: cuenta._id,
                  montoSolicitado: numMonto,
                  plazoMeses: parseInt(plazoMeses, 10),
                });
                Alert.alert('✅ Solicitud enviada', 'Tu solicitud de crédito está pendiente de revisión.', [
                  { text: 'OK', onPress: () => navigation.navigate('MyCredits') },
                ]);
              } catch (error) {
                Alert.alert('Error', error.response?.data?.message || 'No se pudo enviar la solicitud.');
              } finally {
                setRequesting(false);
              }
            },
          },
        ]
      );
    } catch {
      Alert.alert('Error', 'No se pudieron cargar tus cuentas.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={COMMON_STYLES.scrollContent} keyboardShouldPersistTaps="handled">

        <Text style={styles.name}>{product.nombre}</Text>
        <Text style={styles.desc}>{product.descripcion}</Text>

        <View style={styles.infoCard}>
          {isCredito && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tasa de interés</Text>
                <Text style={styles.infoValue}>{product.tasaInteres}% anual</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mora</Text>
                <Text style={styles.infoValue}>{product.moraPorcentaje}%</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Plazo</Text>
                <Text style={styles.infoValue}>{product.plazoMesesMinimo}–{product.plazoMesesMaximo} meses</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Monto disponible</Text>
                <Text style={styles.infoValue}>{formatCurrency(product.montoMinimo)} – {formatCurrency(product.montoMaximo)}</Text>
              </View>
            </>
          )}
          {!isCredito && product.precio ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Precio</Text>
              <Text style={styles.infoValue}>{formatCurrency(product.precio)}</Text>
            </View>
          ) : null}
        </View>

        {/* Cotizador / solicitud */}
        <Text style={COMMON_STYLES.sectionTitle}>
          {isCredito ? 'Solicitar crédito' : 'Cotizar'}
        </Text>

        <Text style={COMMON_STYLES.label}>Monto (Q)</Text>
        <TextInput
          style={COMMON_STYLES.input}
          placeholder="0.00"
          placeholderTextColor={COLORS.textSecondary}
          value={monto}
          onChangeText={setMonto}
          keyboardType="decimal-pad"
        />

        <Text style={COMMON_STYLES.label}>Plazo (meses)</Text>
        <TextInput
          style={COMMON_STYLES.input}
          placeholder="6"
          placeholderTextColor={COLORS.textSecondary}
          value={plazoMeses}
          onChangeText={setPlazoMeses}
          keyboardType="number-pad"
        />

        <TouchableOpacity
          style={[COMMON_STYLES.secondaryButton, loadingQuote && COMMON_STYLES.primaryButtonDisabled]}
          onPress={handleQuote}
          disabled={loadingQuote}
        >
          {loadingQuote
            ? <ActivityIndicator color={COLORS.primaryLight} />
            : <Text style={COMMON_STYLES.secondaryButtonText}>Ver cotización</Text>
          }
        </TouchableOpacity>

        {quote && (
          <View style={styles.quoteCard}>
            <Text style={styles.quoteLabel}>Cuota mensual estimada</Text>
            <Text style={styles.quoteAmount}>{formatCurrency(quote.cuotaMensual || quote.montoCuota)}</Text>
            {quote.totalAPagar ? (
              <Text style={styles.quoteTotal}>Total a pagar: {formatCurrency(quote.totalAPagar)}</Text>
            ) : null}
          </View>
        )}

        {isCredito && (
          <TouchableOpacity
            style={[COMMON_STYLES.primaryButton, { marginTop: 16 }, requesting && COMMON_STYLES.primaryButtonDisabled]}
            onPress={handleRequestCredit}
            disabled={requesting}
          >
            {requesting
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={COMMON_STYLES.buttonText}>Solicitar crédito</Text>
            }
          </TouchableOpacity>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  name: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  desc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginBottom: 20 },
  infoCard: {
    backgroundColor: COLORS.primarySurface, borderRadius: 14, padding: 16, marginBottom: 24,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  infoLabel: { fontSize: 13, color: COLORS.textSecondary },
  infoValue: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  quoteCard: {
    backgroundColor: COLORS.primary, borderRadius: 14, padding: 18, marginTop: 16, alignItems: 'center',
  },
  quoteLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  quoteAmount: { fontSize: 28, fontWeight: '800', color: COLORS.white, marginTop: 4 },
  quoteTotal: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 6 },
});

export default ProductDetailScreen;
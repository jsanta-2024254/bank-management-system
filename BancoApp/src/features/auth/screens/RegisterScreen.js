import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../../shared/constants/colors';
import { THEME, COMMON_STYLES } from '../../../shared/constants/theme';
import { register } from '../../../api/auth';
import { useAlert } from '../../../shared/components/CustomAlert';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const handleRegister = async () => {
    if (
      !name.trim() || !surname.trim() || !username.trim() ||
      !email.trim() || !phone.trim() || !password.trim()
    ) {
      showAlert({
        type: 'warning',
        title: 'Campos requeridos',
        message: 'Completa todos los campos para continuar.',
      });
      return;
    }

    if (password.length < 8) {
      showAlert({
        type: 'warning',
        title: 'Contraseña muy corta',
        message: 'La contraseña debe tener al menos 8 caracteres.',
      });
      return;
    }

    if (password !== confirmPassword) {
      showAlert({
        type: 'warning',
        title: 'Las contraseñas no coinciden',
        message: 'Verifica que ambas contraseñas sean iguales.',
      });
      return;
    }

    if (!/^\d{8}$/.test(phone.trim())) {
      showAlert({
        type: 'warning',
        title: 'Teléfono inválido',
        message: 'El teléfono debe tener exactamente 8 dígitos.',
      });
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        surname: surname.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      });

      showAlert({
        type: 'success',
        title: 'Cuenta creada',
        message: 'Revisa tu correo para verificar tu cuenta antes de iniciar sesión.',
      });

      navigation.navigate('Login');
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Error al registrarte',
        message: error.response?.data?.message || 'Ocurrió un problema. Intenta de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <Text style={styles.bankName}>BancoApp</Text>
          <Text style={styles.subtitle}>Crea tu cuenta</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Registro</Text>

          <Text style={COMMON_STYLES.label}>Nombre</Text>
          <TextInput
            style={COMMON_STYLES.input}
            placeholder="Juan"
            placeholderTextColor={COLORS.textSecondary}
            value={name}
            onChangeText={setName}
          />

          <Text style={COMMON_STYLES.label}>Apellido</Text>
          <TextInput
            style={COMMON_STYLES.input}
            placeholder="Pérez"
            placeholderTextColor={COLORS.textSecondary}
            value={surname}
            onChangeText={setSurname}
          />

          <Text style={COMMON_STYLES.label}>Usuario</Text>
          <TextInput
            style={COMMON_STYLES.input}
            placeholder="juanperez"
            placeholderTextColor={COLORS.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={COMMON_STYLES.label}>Correo electrónico</Text>
          <TextInput
            style={COMMON_STYLES.input}
            placeholder="juan@correo.com"
            placeholderTextColor={COLORS.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />

          <Text style={COMMON_STYLES.label}>Teléfono (8 dígitos)</Text>
          <TextInput
            style={COMMON_STYLES.input}
            placeholder="55555555"
            placeholderTextColor={COLORS.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="number-pad"
            maxLength={8}
          />

          <Text style={COMMON_STYLES.label}>Contraseña</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[COMMON_STYLES.input, styles.passwordInput]}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor={COLORS.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={COMMON_STYLES.label}>Confirmar contraseña</Text>
          <TextInput
            style={COMMON_STYLES.input}
            placeholder="Repite tu contraseña"
            placeholderTextColor={COLORS.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
          />

          <TouchableOpacity
            style={[COMMON_STYLES.primaryButton, loading && COMMON_STYLES.primaryButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={COMMON_STYLES.buttonText}>Crear cuenta</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: COLORS.background, padding: THEME.spacing.lg, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 28 },
  logoBox: {
    width: 76, height: 76, borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  logoText: { fontSize: 38, fontWeight: '800', color: COLORS.white },
  bankName: { fontSize: 27, fontWeight: '800', color: COLORS.primary, letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  form: {
    backgroundColor: COLORS.surface, borderRadius: THEME.borderRadius.xl,
    padding: THEME.spacing.lg, marginBottom: THEME.spacing.lg,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 4,
  },
  formTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  eyeText: { fontSize: 18 },
  backBtn: { marginTop: 16, alignItems: 'center' },
  backText: { color: COLORS.primaryLight, fontSize: 14, fontWeight: '500' },
});

export default RegisterScreen;
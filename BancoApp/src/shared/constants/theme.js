import { StyleSheet } from 'react-native';
import { COLORS } from './colors';

export const THEME = {
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  borderRadius: { sm: 4, md: 8, lg: 12, xl: 20, round: 50 },
};

export const COMMON_STYLES = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 24, paddingBottom: 40 },
  center: { justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  primaryButton: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: { backgroundColor: COLORS.border },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  secondaryButtonText: { color: COLORS.primaryLight, fontSize: 16, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  label: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary, marginBottom: 6, marginLeft: 2 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  shadow: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
});
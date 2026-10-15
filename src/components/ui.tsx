import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors as c } from '../theme/colors';

export function Page({
  children,
  title,
  onBack,
  footer,
}: React.PropsWithChildren<{ title?: string; onBack?: () => void; footer?: React.ReactNode }>) {
  return (
    <SafeAreaView style={ui.page} edges={['top', 'bottom']}>
      {title && (
        <View style={ui.header}>
          {onBack && (
            <Pressable accessibilityLabel="Voltar" onPress={onBack} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color={c.text} />
            </Pressable>
          )}
          <Text style={ui.headerTitle}>{title}</Text>
        </View>
      )}
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={ui.content}>
        {children}
      </ScrollView>
      {footer}
    </SafeAreaView>
  );
}

export function Button({
  title,
  onPress,
  disabled,
  loading,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        ui.button,
        secondary && ui.secondaryButton,
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? c.primary : 'white'} />
      ) : (
        <Text style={[ui.buttonText, secondary && { color: c.primary }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  error,
  password,
  onBlur,
  ...props
}: TextInputProps & { label: string; error?: string; password?: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={ui.field}>
      <Text style={ui.label}>{label}</Text>
      <View style={[ui.inputRow, !!error && { borderColor: c.error }]}>
        <TextInput
          {...props}
          accessibilityLabel={label}
          accessibilityHint={error}
          secureTextEntry={password && !visible}
          onBlur={onBlur}
          placeholderTextColor={c.muted}
          style={ui.input}
        />
        {password && (
          <Pressable
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
            onPress={() => setVisible(!visible)}
            hitSlop={8}
            style={{ padding: 12 }}
          >
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={21}
              color={c.muted}
            />
          </Pressable>
        )}
      </View>
      {!!error && (
        <Text accessibilityRole="alert" style={ui.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

export function Notice({ text, error = false }: { text: string; error?: boolean }) {
  return (
    <View style={[ui.notice, error && { backgroundColor: '#FCE8E6' }]}>
      <Text
        accessibilityRole={error ? 'alert' : undefined}
        style={{ color: error ? c.error : c.success, lineHeight: 21 }}
      >
        {text}
      </Text>
    </View>
  );
}

export function Link({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ paddingVertical: 14 }}>
      <Text style={{ color: c.primary, fontWeight: '600', textAlign: 'center' }}>{title}</Text>
    </Pressable>
  );
}

export function SectionTitle({ children }: React.PropsWithChildren) {
  return <Text style={ui.section}>{children}</Text>;
}
export function Empty({ title, description }: { title: string; description: string }) {
  return (
    <View style={{ paddingVertical: 42, alignItems: 'center', gap: 14 }}>
      <Ionicons name="bag-handle-outline" size={42} color={c.primary} />
      <Text style={ui.section}>{title}</Text>
      <Text style={[ui.muted, { textAlign: 'center' }]}>{description}</Text>
    </View>
  );
}

export const ui = StyleSheet.create({
  page: { flex: 1, backgroundColor: c.background },
  content: { padding: 20, paddingBottom: 28, gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
    backgroundColor: c.surface,
    borderBottomColor: c.border,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: c.text },
  title: { fontSize: 30, fontWeight: '800', color: c.text, letterSpacing: -0.8 },
  section: { fontSize: 21, fontWeight: '700', color: c.text, marginTop: 8 },
  muted: { color: c.muted, lineHeight: 22 },
  button: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: c.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 16 },
  secondaryButton: { backgroundColor: c.primaryLight },
  field: { gap: 7, marginTop: 4 },
  label: { color: c.text, fontWeight: '600', fontSize: 14 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderColor: c.border,
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 54,
  },
  input: { flex: 1, fontSize: 16, padding: 15, color: c.text },
  error: { fontSize: 13, color: c.error, lineHeight: 18 },
  notice: { borderRadius: 14, backgroundColor: '#E8F1EB', padding: 15 },
  card: {
    borderRadius: 18,
    backgroundColor: c.surface,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: c.border,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.surface },
});

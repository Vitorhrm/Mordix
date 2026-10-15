import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Field, Link, Notice, Page, ui } from '../../components/ui';
import { colors } from '../../theme/colors';
import { RootStack } from '../../navigation/types';
import { authError, requestPasswordReset, signIn, signUp } from './authService';
import { FormErrors, Registration, validEmail, validateRegistration } from './validation';
import { maskCpf } from '../../utils/format';
import { supabase } from '../../services/supabase';
import { useAuth } from './AuthContext';

function Brand({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ gap: 12, marginBottom: 12 }}>
      <Text style={{ color: colors.primary, fontWeight: '900', fontSize: 30 }}>
        Mordix<Text style={{ color: colors.text }}>.</Text>
      </Text>
      <Text style={ui.title}>{title}</Text>
      <Text style={ui.muted}>{subtitle}</Text>
    </View>
  );
}

export function LoginScreen({ navigation, route }: NativeStackScreenProps<RootStack, 'Login'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  // Valida o formulário, chama o login real e volta para a compra se houver uma pendente.
  async function handleLogin() {
    if (busy) return;
    const next: FormErrors = {};
    if (!validEmail(email)) next.email = 'Informe um e-mail válido';
    if (!password) next.password = 'Informe sua senha';
    setErrors(next);
    setMessage('');
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const { error } = await signIn(email, password);
      if (error) setMessage(authError(error, true));
      else navigation.replace(route.params?.returnToCheckout ? 'Checkout' : 'Main');
    } catch {
      setMessage('Falha de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setBusy(false);
      setPassword('');
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Page title="Entrar" onBack={() => navigation.goBack()}>
        <Brand
          title="Que bom ter você de volta"
          subtitle="Entre para acompanhar seus pedidos e aproveitar seus sabores favoritos."
        />
        <Field
          label="E-mail"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setErrors({ ...errors, email: undefined });
          }}
          onBlur={() => {
            if (!validEmail(email)) setErrors((e) => ({ ...e, email: 'Informe um e-mail válido' }));
          }}
          error={errors.email}
          placeholder="voce@exemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
        />
        <Field
          label="Senha"
          password
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setErrors({ ...errors, password: undefined });
          }}
          error={errors.password}
          placeholder="Sua senha"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
        />
        <Link title="Esqueci minha senha" onPress={() => navigation.navigate('ForgotPassword')} />
        {!!message && <Notice error text={message} />}
        <Button title="Entrar no Mordix" onPress={handleLogin} loading={busy} />
        <Link
          title="Ainda não tenho conta · Criar cadastro"
          onPress={() => navigation.navigate('Register')}
        />
        <Text style={[ui.muted, { textAlign: 'center', fontSize: 12 }]}>
          Sua conta é protegida pelo Supabase Auth.
        </Text>
      </Page>
    </KeyboardAvoidingView>
  );
}

const emptyRegistration: Registration = {
  firstName: '',
  lastName: '',
  cpf: '',
  email: '',
  password: '',
  confirmation: '',
};

export function RegisterScreen({ navigation }: NativeStackScreenProps<RootStack, 'Register'>) {
  const [form, setForm] = useState<Registration>(emptyRegistration);
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const change = (key: keyof Registration, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };
  const blur = (key: keyof Registration) =>
    setErrors((current) => ({ ...current, [key]: validateRegistration(form)[key] }));

  // Confere os campos e envia o cadastro; a senha fica somente no Supabase Auth.
  async function handleRegister() {
    if (busy) return;
    const nextErrors = validateRegistration(form);
    setErrors(nextErrors);
    setMessage('');
    if (Object.keys(nextErrors).length) return;
    setBusy(true);
    try {
      const { data, error } = await signUp(form);
      if (error) setMessage(authError(error));
      else if (data.session) {
        setForm(emptyRegistration);
        navigation.popToTop();
      } else {
        setSuccess(true);
        setForm(emptyRegistration);
      }
    } catch {
      setMessage('Falha de conexão. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  if (success)
    return (
      <Page title="Confira seu e-mail" onBack={() => navigation.navigate('Login')}>
        <Brand
          title="Falta só confirmar"
          subtitle="Se o cadastro foi aceito, você receberá um link para confirmar seu e-mail. Depois, entre com seu e-mail e senha."
        />
        <Notice text="Não chegou? Confira o spam. O envio depende das configurações de e-mail do projeto Supabase." />
        <Button title="Voltar para entrar" onPress={() => navigation.navigate('Login')} />
      </Page>
    );
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Page title="Criar conta" onBack={() => navigation.goBack()}>
        <Brand
          title="Sua próxima mordida começa aqui"
          subtitle="Preencha seus dados para criar uma conta no Mordix."
        />
        <Field
          label="Nome"
          value={form.firstName}
          onChangeText={(v) => change('firstName', v)}
          onBlur={() => blur('firstName')}
          error={errors.firstName}
          placeholder="Seu nome"
          autoComplete="given-name"
        />
        <Field
          label="Sobrenome"
          value={form.lastName}
          onChangeText={(v) => change('lastName', v)}
          onBlur={() => blur('lastName')}
          error={errors.lastName}
          placeholder="Seu sobrenome"
          autoComplete="family-name"
        />
        <Field
          label="CPF"
          value={form.cpf}
          onChangeText={(v) => change('cpf', maskCpf(v))}
          onBlur={() => blur('cpf')}
          error={errors.cpf}
          keyboardType="number-pad"
          placeholder="000.000.000-00"
          maxLength={14}
        />
        <Field
          label="E-mail"
          value={form.email}
          onChangeText={(v) => change('email', v)}
          onBlur={() => blur('email')}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          placeholder="voce@exemplo.com"
        />
        <Field
          label="Senha"
          password
          value={form.password}
          onChangeText={(v) => change('password', v)}
          onBlur={() => blur('password')}
          error={errors.password}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          placeholder="Pelo menos 8 caracteres"
        />
        <Field
          label="Confirmar senha"
          password
          value={form.confirmation}
          onChangeText={(v) => change('confirmation', v)}
          onBlur={() => blur('confirmation')}
          error={errors.confirmation}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          placeholder="Digite a senha novamente"
        />
        {!!message && <Notice error text={message} />}
        <Button title="Criar minha conta" onPress={handleRegister} loading={busy} />
        <Text style={[ui.muted, { fontSize: 12 }]}>
          O CPF identifica seu cadastro. A validação dos dígitos não comprova identidade. Dados e
          autenticação são enviados ao projeto acadêmico Mordix no Supabase.
        </Text>
        <Link title="Já tenho conta · Entrar" onPress={() => navigation.navigate('Login')} />
      </Page>
    </KeyboardAvoidingView>
  );
}

export function ForgotPasswordScreen({
  navigation,
}: NativeStackScreenProps<RootStack, 'ForgotPassword'>) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  // Solicita a recuperação no Supabase sem informar se o e-mail já está cadastrado.
  async function handleRecovery() {
    if (!validEmail(email)) return setError('Informe um e-mail válido');
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await requestPasswordReset(email);
      if (result.error) setError(authError(result.error));
      else setSent(true);
    } catch {
      setError('Falha de conexão. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page title="Recuperar senha" onBack={() => navigation.goBack()}>
      <Brand
        title={sent ? 'Confira sua caixa de entrada' : 'Vamos recuperar seu acesso'}
        subtitle={
          sent
            ? 'Se houver uma conta para este e-mail, o Supabase enviará as instruções de recuperação.'
            : 'Informe o e-mail usado no seu cadastro.'
        }
      />
      {!sent && (
        <>
          <Field
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={error}
            placeholder="voce@exemplo.com"
          />
          <Button title="Enviar instruções" onPress={handleRecovery} loading={busy} />
        </>
      )}
      <Link title="Voltar para entrar" onPress={() => navigation.navigate('Login')} />
    </Page>
  );
}

export function ResetPasswordScreen({
  navigation,
}: NativeStackScreenProps<RootStack, 'ResetPassword'>) {
  const { finishRecovery, recovering } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // Atualiza a senha somente quando existe uma sessão válida de recuperação.
  async function handleSave() {
    if (!recovering) return setError('Abra o link enviado ao seu e-mail para redefinir a senha.');
    if (password.length < 8) return setError('A senha deve ter pelo menos 8 caracteres');
    if (password !== confirmation) return setError('As senhas não coincidem');
    setBusy(true);
    try {
      const result = await supabase.auth.updateUser({ password });
      if (result.error) setError(authError(result.error));
      else {
        setPassword('');
        setConfirmation('');
        finishRecovery();
        navigation.popToTop();
      }
    } catch {
      setError('Falha de conexão. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page title="Nova senha">
      <Brand title="Escolha uma nova senha" subtitle="Use pelo menos 8 caracteres." />
      <Field
        label="Nova senha"
        password
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoComplete="new-password"
      />
      <Field
        label="Confirmar nova senha"
        password
        value={confirmation}
        onChangeText={setConfirmation}
        autoCapitalize="none"
        autoComplete="new-password"
      />
      {!!error && <Notice error text={error} />}
      <Button title="Salvar nova senha" loading={busy} onPress={handleSave} />
    </Page>
  );
}

import { supabase } from '../../services/supabase';
import { Registration } from './validation';

export const AUTH_REDIRECT = 'mordix://auth/callback';

// Pega o e-mail e a senha da interface e envia ao Supabase Auth.
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
}

// Cria a conta no Auth e salva nome, sobrenome e CPF nos dados privados do usuário.
export async function signUp(form: Registration) {
  return supabase.auth.signUp({
    email: form.email.trim().toLowerCase(),
    password: form.password,
    options: {
      emailRedirectTo: AUTH_REDIRECT,
      data: {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        cpf: form.cpf.replace(/\D/g, ''),
      },
    },
  });
}

// Solicita o e-mail de recuperação sem armazenar a senha no aplicativo.
export async function requestPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: AUTH_REDIRECT,
  });
}

// Traduz erros do serviço para mensagens que o cliente entende.
export function authError(
  error: { message: string; status?: number; code?: string },
  login = false,
) {
  if (error.code === 'email_not_confirmed') return 'Confirme seu e-mail antes de entrar.';
  if (error.status === 429 || error.code?.includes('rate_limit'))
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  if (error.code === 'over_email_send_rate_limit')
    return 'O limite de envio de e-mails foi atingido. Tente novamente mais tarde.';
  if (/network|fetch|timeout/i.test(error.message))
    return 'Não foi possível conectar. Verifique sua internet.';
  if (login) return 'E-mail ou senha incorretos. Confira os dados e tente novamente.';
  if (error.code === 'email_address_not_authorized' || /email.*not authorized/i.test(error.message))
    return 'O envio de e-mails deste projeto ainda está restrito no Supabase. Configure um serviço SMTP para novos cadastros.';
  if (error.code === 'weak_password')
    return 'Escolha uma senha mais forte, com pelo menos 8 caracteres.';
  return 'Não foi possível concluir. Confira os dados e tente novamente.';
}

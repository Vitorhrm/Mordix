import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Linking } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../services/supabase';

type AuthState = {
  session: Session | null;
  ready: boolean;
  recovering: boolean;
  finishRecovery: () => void;
};
const AuthContext = createContext<AuthState>({
  session: null,
  ready: false,
  recovering: false,
  finishRecovery: () => {},
});

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    let mounted = true;
    // Recupera a sessão protegida e verifica o usuário no servidor ao abrir o app.
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (data.session) {
          const result = await supabase.auth.getUser();
          if (mounted && !result.error) setSession(data.session);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setReady(true);
      });
    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      if (event !== 'INITIAL_SESSION') setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      if (event === 'SIGNED_OUT') setRecovering(false);
    });
    // Mantém a sessão renovada somente enquanto o aplicativo está em primeiro plano.
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    supabase.auth.startAutoRefresh();
    // Recebe o link de confirmação ou recuperação enviado pelo Supabase.
    const handleLink = async (url: string | null | undefined) => {
      if (!url?.startsWith('mordix://auth/callback')) return;
      const code = new URL(url).searchParams.get('code');
      if (code) await supabase.auth.exchangeCodeForSession(code);
    };
    Linking.getInitialURL()
      .then(handleLink)
      .catch(() => {});
    const links = Linking.addEventListener('url', ({ url }) => {
      handleLink(url).catch(() => {});
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      appState.remove();
      links.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, ready, recovering, finishRecovery: () => setRecovering(false) }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);

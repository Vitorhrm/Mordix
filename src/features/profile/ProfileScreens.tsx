import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Empty, Field, Notice, Page, SectionTitle, ui } from '../../components/ui';
import { RootStack } from '../../navigation/types';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../../services/supabase';
import { useShopping } from '../cart/ShoppingContext';
import { colors } from '../../theme/colors';

export function ProfileContent({
  navigation,
}: {
  navigation: NativeStackNavigationProp<RootStack, 'Main'>;
}) {
  const { session } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // Encerra a sessão e remove os dados de acesso do aparelho.
  async function logout() {
    setBusy(true);
    setError('');
    try {
      const result = await supabase.auth.signOut({ scope: 'local' });
      if (result.error) setError('Não foi possível sair. Tente novamente.');
    } catch {
      setError('Falha de conexão. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }
  if (!session)
    return (
      <>
        <Empty
          title="Seu espaço no Mordix"
          description="Entre ou crie uma conta para acompanhar seus pedidos."
        />
        <Button title="Entrar com e-mail e senha" onPress={() => navigation.navigate('Login')} />
        <Button
          title="Criar minha conta"
          secondary
          onPress={() => navigation.navigate('Register')}
        />
      </>
    );
  const metadata = session.user.user_metadata;
  return (
    <>
      <Text style={{ color: colors.primary, fontSize: 12, letterSpacing: 1.5 }}>OLÁ,</Text>
      <Text style={ui.title}>
        {metadata.first_name || 'Cliente'} {metadata.last_name || ''}
      </Text>
      <Text style={ui.muted}>{session.user.email}</Text>
      <Notice text="Você está conectado ao Supabase com uma conta do projeto Mordix." />
      <View style={ui.card}>
        <Text style={ui.label}>CPF</Text>
        <Text style={ui.muted}>
          {metadata.cpf ? `***.***.***-${String(metadata.cpf).slice(-2)}` : 'Não informado'}
        </Text>
      </View>
      <Button secondary title="Meus endereços" onPress={() => navigation.navigate('Addresses')} />
      <Button
        secondary
        title="Ajuda e sobre o aplicativo"
        onPress={() => navigation.navigate('Help')}
      />
      {!!error && <Notice error text={error} />}
      <Button title="Sair da conta" onPress={logout} loading={busy} />
    </>
  );
}

export function AddressesScreen({ navigation }: NativeStackScreenProps<RootStack, 'Addresses'>) {
  const shop = useShopping();
  const [address, setAddress] = useState(shop.address);
  const [error, setError] = useState('');
  // Valida o endereço local e devolve o cliente para a tela anterior.
  function save() {
    if (!address.label.trim() || !address.street.trim() || !address.number.trim())
      return setError('Preencha identificação, rua e número.');
    shop.setAddress(address);
    shop.setCoupon('');
    navigation.goBack();
  }
  return (
    <Page title="Endereço de entrega" onBack={() => navigation.goBack()}>
      <Notice text="Endereço usado somente na demonstração local do catálogo." />
      <Field
        label="Identificação"
        value={address.label}
        onChangeText={(label) => setAddress({ ...address, label })}
      />
      <Field
        label="Rua"
        value={address.street}
        onChangeText={(street) => setAddress({ ...address, street })}
      />
      <Field
        label="Número"
        value={address.number}
        onChangeText={(number) => setAddress({ ...address, number })}
      />
      <SectionTitle>Ouro Branco/MG · escolha o bairro</SectionTitle>
      {['Siderurgia', 'Pioneiros', 'Cristais'].map((district) => (
        <Pressable
          key={district}
          style={ui.card}
          onPress={() => setAddress({ ...address, district })}
        >
          <Text>
            {district === address.district ? '●' : '○'} {district}
          </Text>
        </Pressable>
      ))}
      {address.district === 'Cristais' && (
        <Notice error text="Bairro fora da área de entrega. A retirada continua disponível." />
      )}
      {!!error && <Notice error text={error} />}
      <Button title="Salvar endereço" onPress={save} />
    </Page>
  );
}

export function HelpScreen({ navigation }: NativeStackScreenProps<RootStack, 'Help'>) {
  return (
    <Page title="Sobre o Mordix" onBack={() => navigation.goBack()}>
      <Text style={ui.title}>Uma mordida de cada vez.</Text>
      <Text style={ui.muted}>Projeto acadêmico de delivery em React Native e TypeScript.</Text>
      <SectionTitle>O que já está conectado?</SectionTitle>
      <Text style={ui.muted}>
        Cadastro com nome, sobrenome, CPF, e-mail e senha; login; sessão protegida; saída da conta.
        A autenticação é feita pelo Supabase Auth.
      </Text>
      <SectionTitle>O que ainda é demonstração?</SectionTitle>
      <Text style={ui.muted}>
        Lojas, cardápio, endereços, cupons e carrinho usam dados locais. Nenhum pedido é enviado a
        uma loja e nenhum pagamento é processado.
      </Text>
      <SectionTitle>Seus dados</SectionTitle>
      <Text style={ui.muted}>
        Seu cadastro é enviado ao projeto Mordix no Supabase. Senhas são gerenciadas pelo Supabase
        Auth. O aplicativo não salva a senha nem usa a senha do banco de dados. Para dúvidas ou
        exclusão da conta acadêmica, contate o responsável pelo projeto.
      </Text>
    </Page>
  );
}

import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Empty, Field, Notice, Page, SectionTitle, ui } from '../../components/ui';
import { RootStack } from '../../navigation/types';
import { useShopping } from './ShoppingContext';
import { deliveryFee, subtotalOf, validateCoupon } from './cartRules';
import { stores } from '../catalog/catalogData';
import { money } from '../../utils/format';
import { useAuth } from '../auth/AuthContext';

export function CartScreen({ navigation }: NativeStackScreenProps<RootStack, 'Cart'>) {
  const shop = useShopping();
  const [code, setCode] = useState(shop.coupon);
  const [error, setError] = useState('');
  const store = stores.find((item) => item.id === shop.storeId);
  const subtotal = subtotalOf(shop.items);
  const fee = deliveryFee(shop.storeId, shop.address, shop.pickup);
  const coupon = validateCoupon(shop.storeId, shop.coupon, subtotal, fee || 0, shop.pickup);
  const total = subtotal + (fee || 0) - coupon.discount;
  // Confere o cupom na loja atual antes de mostrar o desconto.
  function applyCoupon() {
    const result = validateCoupon(shop.storeId, code, subtotal, fee || 0, shop.pickup);
    setError(result.error || '');
    shop.setCoupon(result.error ? '' : code.trim().toUpperCase());
  }
  if (!shop.items.length)
    return (
      <Page title="Seu carrinho" onBack={() => navigation.goBack()}>
        <Empty
          title="Seu carrinho está vazio"
          description="Escolha uma loja e adicione seus favoritos."
        />
        <Button title="Explorar lojas" onPress={() => navigation.popToTop()} />
      </Page>
    );
  return (
    <Page
      title="Seu carrinho"
      onBack={() => navigation.goBack()}
      footer={
        <View style={ui.footer}>
          <Button
            title={`Continuar · ${money(total)}`}
            disabled={!store || subtotal < store.minimum || fee === null}
            onPress={() => navigation.navigate('Checkout')}
          />
        </View>
      }
    >
      <SectionTitle>{store?.name}</SectionTitle>
      {shop.items.map((item) => (
        <View key={item.id} style={ui.card}>
          <View style={ui.row}>
            <Text style={{ fontWeight: '700', flex: 1 }}>
              {item.quantity}× {item.name}
            </Text>
            <Text>{money(item.price * item.quantity)}</Text>
          </View>
          {!!item.selections.length && <Text style={ui.muted}>{item.selections.join(', ')}</Text>}
          {!!item.note && <Text style={ui.muted}>{item.note}</Text>}
          <View style={ui.row}>
            <Pressable
              accessibilityLabel={`Diminuir ${item.name}`}
              onPress={() =>
                shop.setItems((current) =>
                  current.flatMap((line) =>
                    line.id !== item.id
                      ? [line]
                      : line.quantity > 1
                        ? [{ ...line, quantity: line.quantity - 1 }]
                        : [],
                  ),
                )
              }
              style={{ padding: 12 }}
            >
              <Text>− Remover</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={`Aumentar ${item.name}`}
              onPress={() =>
                shop.setItems((current) =>
                  current.map((line) =>
                    line.id === item.id
                      ? { ...line, quantity: Math.min(20, line.quantity + 1) }
                      : line,
                  ),
                )
              }
              style={{ padding: 12 }}
            >
              <Text>+ Adicionar</Text>
            </Pressable>
          </View>
        </View>
      ))}
      <Button
        title="Adicionar mais itens"
        secondary
        onPress={() => navigation.navigate('Store', { storeId: shop.storeId })}
      />
      <Field
        label="Cupom desta loja"
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        placeholder="Ex.: BEMVINDO10"
        error={error}
      />
      <Button title="Aplicar cupom" secondary onPress={applyCoupon} />
      {!!shop.coupon && !coupon.error && (
        <Notice text={`${shop.coupon}: desconto de ${money(coupon.discount)}`} />
      )}
      {!!coupon.error && <Notice error text={coupon.error} />}
      <SectionTitle>Resumo de valores</SectionTitle>
      <Summary subtotal={subtotal} fee={fee || 0} discount={coupon.discount} total={total} />
      {fee === null && (
        <Notice error text="Endereço fora da área de entrega. Escolha retirada ou outro bairro." />
      )}
      {!!store && subtotal < store.minimum && (
        <Notice
          error
          text={`Faltam ${money(store.minimum - subtotal)} para atingir o pedido mínimo.`}
        />
      )}
      <Notice text="Catálogo e carrinho são uma demonstração local. Nesta etapa, somente contas e login estão conectados ao Supabase." />
    </Page>
  );
}

export function Summary({
  subtotal,
  fee,
  discount,
  total,
}: {
  subtotal: number;
  fee: number;
  discount: number;
  total: number;
}) {
  const rows: [string, number][] = [
    ['Subtotal', subtotal],
    ['Entrega', fee],
    ['Desconto', -discount],
    ['Total', total],
  ];
  return (
    <View style={ui.card}>
      {rows.map(([label, value]) => (
        <View key={label} style={ui.row}>
          <Text style={{ fontWeight: label === 'Total' ? '700' : '400' }}>{label}</Text>
          <Text style={{ fontWeight: label === 'Total' ? '800' : '500' }}>{money(value)}</Text>
        </View>
      ))}
    </View>
  );
}

export function CheckoutScreen({ navigation }: NativeStackScreenProps<RootStack, 'Checkout'>) {
  const shop = useShopping();
  const { session } = useAuth();
  const [payment, setPayment] = useState('');
  const [cash, setCash] = useState('');
  const subtotal = subtotalOf(shop.items);
  const fee = deliveryFee(shop.storeId, shop.address, shop.pickup);
  const discount = validateCoupon(
    shop.storeId,
    shop.coupon,
    subtotal,
    fee || 0,
    shop.pickup,
  ).discount;
  const total = subtotal + (fee || 0) - discount;
  const store = stores.find((item) => item.id === shop.storeId);
  const cashAmount = Math.round(Number(cash.replace(',', '.')) * 100);
  const cashInvalid =
    payment === 'Dinheiro com troco' && (!Number.isFinite(cashAmount) || cashAmount < total);
  // Exige login real, mantendo o envio de pedidos para a próxima etapa.
  function finish() {
    if (!session) return navigation.navigate('Login', { returnToCheckout: true });
    Alert.alert(
      'Demonstração do pedido',
      'Seu login está integrado ao Supabase. O envio de pedidos às lojas será implementado na próxima etapa.',
    );
  }
  return (
    <Page
      title="Finalizar pedido"
      onBack={() => navigation.goBack()}
      footer={
        <View style={ui.footer}>
          <Button
            title={session ? 'Finalização demonstrativa' : 'Entrar para continuar'}
            disabled={
              !!session &&
              (!payment || cashInvalid || fee === null || !store || subtotal < store.minimum)
            }
            onPress={finish}
          />
        </View>
      }
    >
      <SectionTitle>Como você quer receber?</SectionTitle>
      <View style={ui.row}>
        {['Entrega', 'Retirada'].map((label, index) => (
          <View key={label} style={{ flex: 1 }}>
            <Button
              secondary={shop.pickup !== (index === 1)}
              title={label}
              onPress={() => {
                shop.setPickup(index === 1);
                shop.setCoupon('');
              }}
            />
          </View>
        ))}
      </View>
      <View style={ui.card}>
        <Text style={{ fontWeight: '700' }}>
          {shop.pickup
            ? `Retirar em ${store?.name}`
            : `${shop.address.label} · ${shop.address.district}`}
        </Text>
        <Text style={ui.muted}>
          {shop.pickup ? store?.address : `${shop.address.street}, ${shop.address.number}`}
        </Text>
        <Text style={ui.muted}>{shop.pickup ? '15–25 min' : store?.time}</Text>
      </View>
      {!shop.pickup && (
        <Button
          title="Alterar endereço"
          secondary
          onPress={() => navigation.navigate('Addresses')}
        />
      )}
      <SectionTitle>Pagamento presencial</SectionTitle>
      <Text style={ui.muted}>Você paga diretamente à loja ao receber ou retirar.</Text>
      {[
        'Dinheiro sem troco',
        'Dinheiro com troco',
        'Crédito · Visa / Mastercard',
        'Débito · Visa',
        'Pix presencial',
      ].map((method) => (
        <Pressable
          key={method}
          accessibilityRole="radio"
          accessibilityState={{ checked: payment === method }}
          style={ui.card}
          onPress={() => setPayment(method)}
        >
          <Text>
            {payment === method ? '●' : '○'} {method}
          </Text>
        </Pressable>
      ))}
      {payment === 'Dinheiro com troco' && (
        <>
          <Field
            label="Troco para quanto?"
            value={cash}
            onChangeText={setCash}
            keyboardType="decimal-pad"
            placeholder="50,00"
            error={cashInvalid && cash ? `Informe pelo menos ${money(total)}` : undefined}
          />
          {!cashInvalid && <Notice text={`Troco esperado: ${money(cashAmount - total)}`} />}
        </>
      )}
      <Summary subtotal={subtotal} fee={fee || 0} discount={discount} total={total} />
    </Page>
  );
}

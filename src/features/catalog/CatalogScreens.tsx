import { useState } from 'react';
import { Alert, Image, ImageBackground, Pressable, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Button, Field, Notice, Page, SectionTitle, ui } from '../../components/ui';
import { RootStack } from '../../navigation/types';
import { colors as c } from '../../theme/colors';
import { money } from '../../utils/format';
import { products, stores, Store } from './catalogData';
import { useShopping } from '../cart/ShoppingContext';

export function StoreCard({ store, onPress }: { store: Store; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${store.name}`}
      onPress={onPress}
      style={[ui.card, { padding: 0, overflow: 'hidden', marginBottom: 6 }]}
    >
      <Image
        source={{ uri: store.image }}
        accessibilityLabel={store.name}
        style={{ width: '100%', height: 160 }}
      />
      <View style={{ padding: 16, gap: 6 }}>
        <Text style={{ fontSize: 19, fontWeight: '700', color: c.text }}>{store.name}</Text>
        <Text style={ui.muted}>{store.category}</Text>
        <Text style={{ color: store.open ? c.success : c.error }}>
          {store.open ? `${store.time}  ·  ${money(store.fee)} de entrega` : 'Fechada agora'}
        </Text>
        <Text style={[ui.muted, { fontSize: 12 }]}>Pedido mínimo {money(store.minimum)}</Text>
      </View>
    </Pressable>
  );
}

export function HomeContent({
  navigation,
  searchOnly = false,
}: {
  navigation: NativeStackNavigationProp<RootStack, 'Main'>;
  searchOnly?: boolean;
}) {
  const shopping = useShopping();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const filtered = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === 'Todos' || store.category.toLowerCase().includes(category.toLowerCase())),
  );
  return (
    <>
      <View style={ui.row}>
        <Text style={{ fontSize: 30, fontWeight: '900', color: c.primary }}>
          Mordix<Text style={{ color: c.text }}>.</Text>
        </Text>
        <Ionicons name="restaurant-outline" size={26} color={c.success} />
      </View>
      <Pressable onPress={() => navigation.navigate('Addresses')} style={ui.row}>
        <View>
          <Text style={[ui.muted, { fontSize: 12 }]}>Entregar em</Text>
          <Text style={{ fontWeight: '700', color: c.text }}>
            {shopping.address.label} · {shopping.address.district}
          </Text>
        </View>
        <Ionicons name="chevron-forward" color={c.primary} size={20} />
      </Pressable>
      <Field
        label="O que você quer comer hoje?"
        value={search}
        onChangeText={setSearch}
        placeholder="Busque uma loja"
      />
      <View style={[ui.row, { backgroundColor: '#EFEBE6', padding: 5, borderRadius: 14 }]}>
        {['Entrega', 'Retirada'].map((mode, index) => (
          <Pressable
            key={mode}
            onPress={() => {
              shopping.setPickup(index === 1);
              shopping.setCoupon('');
            }}
            style={{
              flex: 1,
              padding: 13,
              borderRadius: 10,
              backgroundColor: shopping.pickup === (index === 1) ? 'white' : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: c.text, fontWeight: '600' }}>{mode}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {['Todos', 'Hambúrguer', 'Pizza', 'Saudável'].map((item) => (
          <Pressable
            key={item}
            onPress={() => setCategory(item)}
            style={{
              backgroundColor: category === item ? c.dark : c.surface,
              borderRadius: 24,
              padding: 12,
            }}
          >
            <Text style={{ color: category === item ? 'white' : c.text }}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {!searchOnly && !search && (
        <Pressable onPress={() => navigation.navigate('Store', { storeId: 'brasa' })}>
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1673166516558-3f1b88a22db8?auto=format&fit=crop&w=900&q=80',
            }}
            imageStyle={{ borderRadius: 20 }}
            style={{ height: 210, justifyContent: 'flex-end' }}
          >
            <View style={{ backgroundColor: '#00000065', borderRadius: 20, padding: 22 }}>
              <Text style={{ color: 'white', fontSize: 10, letterSpacing: 1.5 }}>
                PARA MATAR A FOME
              </Text>
              <Text style={{ color: 'white', fontSize: 28, fontWeight: '800', marginVertical: 8 }}>
                Clássicos feitos{'\n'}na brasa
              </Text>
              <Text style={{ color: 'white' }}>Conhecer a Brasa Burger →</Text>
            </View>
          </ImageBackground>
        </Pressable>
      )}
      <Text style={{ color: c.primary, fontSize: 11, letterSpacing: 1.5, marginTop: 12 }}>
        PERTO DE VOCÊ
      </Text>
      <SectionTitle>
        {searchOnly ? 'Encontre seu próximo pedido' : 'Boas escolhas para hoje'}
      </SectionTitle>
      {filtered.map((store) => (
        <StoreCard
          key={store.id}
          store={store}
          onPress={() => navigation.navigate('Store', { storeId: store.id })}
        />
      ))}
      {!filtered.length && <Notice text="Nenhuma loja encontrada. Tente buscar outro nome." />}
      <Text style={[ui.muted, { textAlign: 'center', fontSize: 12 }]}>
        Catálogo de demonstração · Ouro Branco/MG
      </Text>
    </>
  );
}

export function StoreScreen({ navigation, route }: NativeStackScreenProps<RootStack, 'Store'>) {
  const store = stores.find((item) => item.id === route.params.storeId)!;
  const shopping = useShopping();
  return (
    <Page
      title={store.name}
      onBack={() => navigation.goBack()}
      footer={
        shopping.items.length > 0 ? (
          <View style={ui.footer}>
            <Button
              title={`Ver carrinho · ${shopping.items.reduce((sum, item) => sum + item.quantity, 0)} itens`}
              onPress={() => navigation.navigate('Cart')}
            />
          </View>
        ) : undefined
      }
    >
      <Image
        source={{ uri: store.image }}
        style={{ height: 210, width: '100%', borderRadius: 20 }}
      />
      <Text style={ui.title}>{store.name}</Text>
      <Text style={ui.muted}>{store.category}</Text>
      <Text style={{ color: store.open ? c.success : c.error }}>
        {store.open ? 'Aberta agora' : 'Fechada agora'} ·{' '}
        {shopping.pickup ? 'Retirada em 15–25 min' : store.time}
      </Text>
      <Text style={ui.muted}>
        Mínimo {money(store.minimum)} ·{' '}
        {shopping.pickup ? 'Retirada grátis' : `Entrega a partir de ${money(store.fee)}`}
      </Text>
      {!store.open && (
        <Notice
          error
          text="Esta loja está fechada. Você pode consultar o cardápio e voltar mais tarde."
        />
      )}
      <SectionTitle>Cardápio</SectionTitle>
      {products
        .filter((product) => product.storeId === store.id)
        .map((product) => (
          <Pressable
            key={product.id}
            style={[ui.card, ui.row]}
            onPress={() => navigation.navigate('Product', { productId: product.id })}
          >
            <View style={{ flex: 1, gap: 7 }}>
              <Text style={{ fontSize: 17, fontWeight: '700' }}>{product.name}</Text>
              <Text style={ui.muted}>{product.description}</Text>
              <Text style={{ color: c.primary, fontWeight: '700' }}>{money(product.price)}</Text>
            </View>
            <Image
              source={{ uri: product.image }}
              style={{ width: 85, height: 90, borderRadius: 13 }}
            />
          </Pressable>
        ))}
    </Page>
  );
}

export function ProductScreen({ navigation, route }: NativeStackScreenProps<RootStack, 'Product'>) {
  const product = products.find((item) => item.id === route.params.productId)!;
  const store = stores.find((item) => item.id === product.storeId)!;
  const shopping = useShopping();
  const [selected, setSelected] = useState<string[]>([]);
  const [choice, setChoice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const price =
    product.price +
    (product.options || [])
      .filter((option) => selected.includes(option.name))
      .reduce((sum, option) => sum + option.price, 0);

  // Monta o item escolhido e confirma antes de substituir o carrinho de outra loja.
  function addToCart() {
    const add = () => {
      if (shopping.storeId !== product.storeId) {
        shopping.setItems([]);
        shopping.setCoupon('');
      }
      shopping.setStoreId(product.storeId);
      shopping.setItems((current) => [
        ...(shopping.storeId === product.storeId ? current : []),
        {
          id: String(Date.now()),
          productId: product.id,
          name: product.name,
          price,
          quantity,
          selections: [...selected, ...(choice ? [choice] : [])],
          note,
        },
      ]);
      navigation.goBack();
    };
    if (shopping.items.length && shopping.storeId !== product.storeId)
      Alert.alert('Trocar de loja?', 'Seu carrinho atual será substituído.', [
        { text: 'Manter carrinho', style: 'cancel' },
        { text: 'Trocar', onPress: add },
      ]);
    else add();
  }
  return (
    <Page
      title={product.name}
      onBack={() => navigation.goBack()}
      footer={
        <View style={ui.footer}>
          <Button
            title={store.open ? `Adicionar · ${money(price * quantity)}` : 'Loja fechada'}
            disabled={!store.open || (!!product.required && !choice)}
            onPress={addToCart}
          />
        </View>
      }
    >
      <Image
        source={{ uri: product.image }}
        style={{ width: '100%', height: 235, borderRadius: 20 }}
      />
      <Text style={ui.title}>{product.name}</Text>
      <Text style={ui.muted}>{product.description}</Text>
      <Text style={{ color: c.primary, fontSize: 24, fontWeight: '700' }}>{money(price)}</Text>
      {product.required && (
        <>
          <SectionTitle>Escolha uma opção</SectionTitle>
          <Text style={ui.muted}>Obrigatório · escolha 1</Text>
          {product.required.map((item) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: choice === item }}
              key={item}
              style={ui.card}
              onPress={() => setChoice(item)}
            >
              <Text>
                {choice === item ? '●' : '○'} {item}
              </Text>
            </Pressable>
          ))}
        </>
      )}
      {!!product.options?.length && <SectionTitle>Quer incrementar?</SectionTitle>}
      {product.options?.map((option) => (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: selected.includes(option.name) }}
          key={option.name}
          style={[ui.card, ui.row]}
          onPress={() =>
            setSelected((current) =>
              current.includes(option.name)
                ? current.filter((name) => name !== option.name)
                : [...current, option.name],
            )
          }
        >
          <Text>
            {selected.includes(option.name) ? '☑' : '□'} {option.name}
          </Text>
          <Text>+ {money(option.price)}</Text>
        </Pressable>
      ))}
      <Field
        label="Observação (opcional)"
        value={note}
        onChangeText={setNote}
        maxLength={120}
        placeholder="Como você prefere receber?"
        multiline
      />
      <Text style={ui.muted}>Observações não substituem adicionais pagos.</Text>
      <View style={ui.row}>
        <Text style={ui.label}>Quantidade</Text>
        <View style={ui.row}>
          <Pressable
            accessibilityLabel="Diminuir quantidade"
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={{ padding: 15 }}
          >
            <Text>−</Text>
          </Pressable>
          <Text>{quantity}</Text>
          <Pressable
            accessibilityLabel="Aumentar quantidade"
            onPress={() => setQuantity(Math.min(20, quantity + 1))}
            style={{ padding: 15 }}
          >
            <Text>+</Text>
          </Pressable>
        </View>
      </View>
    </Page>
  );
}

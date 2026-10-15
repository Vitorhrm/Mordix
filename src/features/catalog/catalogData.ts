export type Store = {
  id: string;
  name: string;
  category: string;
  image: string;
  time: string;
  minimum: number;
  fee: number;
  open: boolean;
  address: string;
};
export type Product = {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  options?: { name: string; price: number }[];
  required?: string[];
};
export const photos = {
  hero: 'https://images.unsplash.com/photo-1673166516558-3f1b88a22db8?auto=format&fit=crop&w=900&q=80',
  burger:
    'https://images.unsplash.com/photo-1607730127050-e32a8c756fb9?auto=format&fit=crop&w=700&q=80',
  pizza:
    'https://images.unsplash.com/photo-1586511926434-91876a99354f?auto=format&fit=crop&w=700&q=80',
  salad:
    'https://images.unsplash.com/photo-1667499823726-f2c6fc321b66?auto=format&fit=crop&w=700&q=80',
};
export const stores: Store[] = [
  {
    id: 'brasa',
    name: 'Brasa Burger',
    category: 'Hambúrguer artesanal',
    image: photos.burger,
    time: '35–50 min',
    minimum: 2000,
    fee: 300,
    open: true,
    address: 'Rua Barão de Jaguara, 820 · Centro',
  },
  {
    id: 'forno',
    name: 'Forno da Vila',
    category: 'Pizza napolitana',
    image: photos.pizza,
    time: '40–55 min',
    minimum: 3000,
    fee: 500,
    open: true,
    address: 'Rua Conceição, 410 · Centro',
  },
  {
    id: 'verde',
    name: 'Verde & Grão',
    category: 'Bowls e comida saudável',
    image: photos.salad,
    time: '30–45 min',
    minimum: 2500,
    fee: 400,
    open: false,
    address: 'Rua Ferreira Penteado, 250 · Centro',
  },
];
export const products: Product[] = [
  {
    id: 'classic',
    storeId: 'brasa',
    name: 'Brasa Clássico',
    description: 'Pão brioche, carne de 150 g, queijo, alface, tomate e molho da casa.',
    price: 2500,
    image: photos.burger,
    category: 'Hambúrgueres',
    options: [
      { name: 'Queijo extra', price: 300 },
      { name: 'Bacon crocante', price: 500 },
    ],
  },
  {
    id: 'double',
    storeId: 'brasa',
    name: 'Duplo Smash',
    description: 'Dois smash burgers, cheddar, cebola tostada e picles.',
    price: 3200,
    image: photos.hero,
    category: 'Hambúrgueres',
    options: [{ name: 'Queijo extra', price: 300 }],
  },
  {
    id: 'fries',
    storeId: 'brasa',
    name: 'Batata crocante',
    description: 'Batatas sequinhas com sal de ervas. Serve uma pessoa.',
    price: 1200,
    image: photos.hero,
    category: 'Acompanhamentos',
    options: [
      { name: 'Cheddar', price: 400 },
      { name: 'Bacon', price: 500 },
    ],
  },
  {
    id: 'drink',
    storeId: 'brasa',
    name: 'Refrigerante lata',
    description: 'Lata de 350 ml. Escolha seu sabor favorito.',
    price: 800,
    image: photos.hero,
    category: 'Bebidas',
    required: ['Cola', 'Guaraná', 'Cola sem açúcar'],
  },
  {
    id: 'margherita',
    storeId: 'forno',
    name: 'Margherita',
    description: 'Molho de tomate, fior di latte, manjericão e azeite.',
    price: 6200,
    image: photos.pizza,
    category: 'Pizzas',
    required: ['Grande · 8 fatias'],
  },
  {
    id: 'calabresa',
    storeId: 'forno',
    name: 'Calabresa da Vila',
    description: 'Calabresa artesanal, cebola roxa e azeitonas.',
    price: 6600,
    image: photos.pizza,
    category: 'Pizzas',
  },
  {
    id: 'bowl',
    storeId: 'verde',
    name: 'Bowl da estação',
    description: 'Grãos, folhas e legumes frescos da estação.',
    price: 2800,
    image: photos.salad,
    category: 'Bowls',
  },
];

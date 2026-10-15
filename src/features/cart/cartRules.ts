export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selections: string[];
  note: string;
};
export type Address = {
  label: string;
  street: string;
  number: string;
  district: string;
  city: string;
};
export const subtotalOf = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.price * item.quantity, 0);

// Calcula o frete pela loja e pelo bairro, ou retorna indisponível fora da cobertura.
export function deliveryFee(storeId: string, address: Address, pickup: boolean): number | null {
  if (pickup) return 0;
  if (address.city !== 'Ouro Branco' || !['Siderurgia', 'Pioneiros'].includes(address.district))
    return null;
  const base: Record<string, number> = { brasa: 300, forno: 500, verde: 400 };
  return base[storeId] === undefined
    ? null
    : base[storeId] + (address.district === 'Pioneiros' ? 200 : 0);
}

// Confere o cupom dentro da loja do carrinho e calcula somente o benefício permitido.
export function validateCoupon(
  storeId: string,
  code: string,
  subtotal: number,
  fee: number,
  pickup: boolean,
): { discount: number; error?: string } {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { discount: 0 };
  if (normalized === 'VENCIDO') return { discount: 0, error: 'Este cupom está vencido.' };
  if (normalized === 'ESGOTADO')
    return { discount: 0, error: 'Este cupom atingiu o limite de usos.' };
  if (normalized === 'ENTREGAZERO' && storeId === 'brasa')
    return pickup
      ? { discount: 0, error: 'Este cupom vale somente para entrega.' }
      : { discount: fee };
  if (normalized === 'BEMVINDO10' && ['brasa', 'forno'].includes(storeId)) {
    const minimum = storeId === 'brasa' ? 4000 : 5000;
    if (subtotal < minimum)
      return { discount: 0, error: `O cupom exige subtotal de R$ ${minimum / 100}.` };
    return {
      discount:
        storeId === 'brasa' ? Math.min(1000, subtotal) : Math.min(800, Math.round(subtotal * 0.1)),
    };
  }
  return { discount: 0, error: 'Cupom inválido para esta loja.' };
}

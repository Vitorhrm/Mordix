import React, { createContext, useContext, useState } from 'react';
import { Address, CartItem } from './cartRules';
type ShoppingState = {
  items: CartItem[];
  setItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  storeId: string;
  setStoreId: (id: string) => void;
  coupon: string;
  setCoupon: (code: string) => void;
  pickup: boolean;
  setPickup: (value: boolean) => void;
  address: Address;
  setAddress: (address: Address) => void;
};
const ShoppingContext = createContext<ShoppingState | null>(null);
export function ShoppingProvider({ children }: React.PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [storeId, setStoreId] = useState('');
  const [coupon, setCoupon] = useState('');
  const [pickup, setPickup] = useState(false);
  const [address, setAddress] = useState<Address>({
    label: 'Casa',
    street: 'Rua Ferreira Penteado',
    number: '640',
    district: 'Siderurgia',
    city: 'Ouro Branco',
  });
  return (
    <ShoppingContext.Provider
      value={{
        items,
        setItems,
        storeId,
        setStoreId,
        coupon,
        setCoupon,
        pickup,
        setPickup,
        address,
        setAddress,
      }}
    >
      {children}
    </ShoppingContext.Provider>
  );
}
export function useShopping() {
  const context = useContext(ShoppingContext);
  if (!context) throw new Error('ShoppingProvider ausente');
  return context;
}

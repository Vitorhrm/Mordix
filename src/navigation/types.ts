export type RootStack = {
  Main: undefined;
  Login: { returnToCheckout?: boolean } | undefined;
  Register: { returnToCheckout?: boolean } | undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  Store: { storeId: string };
  Product: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  Addresses: undefined;
  Help: undefined;
};

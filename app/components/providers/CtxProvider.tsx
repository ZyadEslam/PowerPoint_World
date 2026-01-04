"use client";
import CartProvider from "./CartProvider";
import ProductsProvider from "./ProductsProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

const CtxProviders = ({ children }: AppProvidersProps) => {
  return (
    <ProductsProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </ProductsProvider>
  );
};

export default CtxProviders;

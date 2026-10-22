import { products } from './mega-store';

export const postSaleCollections = [
  { title: 'Jaquetas', products: products.filter(product => product.kind === 'jaqueta') },
  { title: 'Acessórios', products: products.filter(product => product.kind === 'acessorio') },
];

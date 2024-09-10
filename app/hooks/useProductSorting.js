import { useState, useCallback, useMemo } from 'react';

export function useProductSorting(filteredProducts) {
  const [sortSelected, setSortSelected] = useState(['product asc']);

  const handleSortChange = useCallback((value) => setSortSelected(value), []);

  const sortedProducts = useMemo(() => {
    const [sortKey, sortDirection] = sortSelected[0].split(' ');
    return [...filteredProducts].sort((a, b) => {
      let aValue, bValue;
      switch (sortKey) {
        case 'product':
          aValue = a.node.title.toLowerCase();
          bValue = b.node.title.toLowerCase();
          break;
        case 'price':
          aValue = parseFloat(a.node.priceRangeV2.minVariantPrice.amount);
          bValue = parseFloat(b.node.priceRangeV2.minVariantPrice.amount);
          break;
        case 'inventory':
          aValue = a.node.totalInventory;
          bValue = b.node.totalInventory;
          break;
        default:
          return 0;
      }
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProducts, sortSelected]);

  return {
    sortSelected,
    handleSortChange,
    sortedProducts
  };
}
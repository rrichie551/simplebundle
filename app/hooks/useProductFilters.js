import { useState, useCallback, useMemo } from 'react';

export function useProductFilters(initialProducts) {
  const [status, setStatus] = useState([]);
  const [priceRange, setPriceRange] = useState(undefined);
  const [inventoryRange, setInventoryRange] = useState(undefined);
  const [vendor, setVendor] = useState('');
  const [queryValue, setQueryValue] = useState('');

  const handleStatusChange = useCallback((value) => setStatus(value), []);
  const handlePriceRangeChange = useCallback((value) => setPriceRange(value), []);
  const handleInventoryRangeChange = useCallback((value) => setInventoryRange(value), []);
  const handleVendorChange = useCallback((value) => setVendor(value), []);
  const handleFiltersQueryChange = useCallback((value) => setQueryValue(value), []);

  const handleStatusRemove = useCallback(() => setStatus([]), []);
  const handlePriceRangeRemove = useCallback(() => setPriceRange(undefined), []);
  const handleInventoryRangeRemove = useCallback(() => setInventoryRange(undefined), []);
  const handleVendorRemove = useCallback(() => setVendor(''), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);

  const handleFiltersClearAll = useCallback(() => {
    handleStatusRemove();
    handlePriceRangeRemove();
    handleInventoryRangeRemove();
    handleVendorRemove();
    handleQueryValueRemove();
  }, [handleStatusRemove, handlePriceRangeRemove, handleInventoryRangeRemove, handleVendorRemove, handleQueryValueRemove]);

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(({ node: product }) => {
      const matchesStatus = status.length === 0 || status.includes(product.status);
      const matchesPriceRange = !priceRange || (parseFloat(product.priceRangeV2.minVariantPrice.amount) >= priceRange[0] && parseFloat(product.priceRangeV2.minVariantPrice.amount) <= priceRange[1]);
      const matchesInventoryRange = !inventoryRange || (product.totalInventory >= inventoryRange[0] && product.totalInventory <= inventoryRange[1]);
      const matchesVendor = !vendor || product.vendor.toLowerCase().includes(vendor.toLowerCase());
      const matchesQuery = !queryValue || product.title.toLowerCase().includes(queryValue.toLowerCase());
      
      return matchesStatus && matchesPriceRange && matchesInventoryRange && matchesVendor && matchesQuery;
    });
  }, [initialProducts, status, priceRange, inventoryRange, vendor, queryValue]);

  return {
    status,
    priceRange,
    inventoryRange,
    vendor,
    queryValue,
    handleStatusChange,
    handlePriceRangeChange,
    handleInventoryRangeChange,
    handleVendorChange,
    handleFiltersQueryChange,
    handleStatusRemove,
    handlePriceRangeRemove,
    handleInventoryRangeRemove,
    handleVendorRemove,
    handleQueryValueRemove,
    handleFiltersClearAll,
    filteredProducts
  };
}
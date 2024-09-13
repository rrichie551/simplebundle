import React, { useCallback, useState, useEffect } from "react";
import { 
  Card, 
  BlockStack, 
  Text, 
  Button, 
  ResourceList, 
  Avatar, 
  ResourceItem, 
  TextField, 
  InlineStack, 
  EmptyState, 
  Tag,
  Banner,
  Popover,
  ActionList,
  Modal
} from "@shopify/polaris";
import { DeleteIcon, MenuVerticalIcon } from '@shopify/polaris-icons';

const BUNDLE_LIMITS = {
  products: 30,
  options: 3,
  variants: 100
};

export default function ProductSelectionStep({ formData, setFormData, errors, setErrors, app, setBundleLimits }) {
  const [localErrors, setLocalErrors] = useState({});
  const [activePopoverId, setActivePopoverId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [currentOptionId, setCurrentOptionId] = useState(null);
  const [currentProductName, setCurrentProductName] = useState('');
  const [currentOptionName, setCurrentOptionName] = useState('');

  const validateProducts = useCallback((products) => {
    const productErrors = {};
    products.forEach(product => {
      product.options.forEach(option => {
        if (option.name.toLowerCase() !== 'title' && !option.values.some(v => v.selected)) {
          if (!productErrors[product.id]) {
            productErrors[product.id] = {};
          }
          productErrors[product.id][option.id] = `At least one ${option.name} must be selected`;
        }
      });
    });
    return productErrors;
  }, []);

  const calculateBundleLimits = useCallback((products) => {
    const limits = {
      products: products.length,
      options: 0,
      variants: 1
    };

    products.forEach(product => {
      const customOptions = product.options.filter(option => 
        option.name.toLowerCase() !== 'title' && 
        option.values.filter(v => v.selected).length > 1
      );
      limits.options += customOptions.length;
      
      let productVariants = 1;
      customOptions.forEach(option => {
        const selectedValues = option.values.filter(v => v.selected).length;
        productVariants *= selectedValues > 0 ? selectedValues : 1;
      });
      limits.variants *= productVariants;
    });

    return limits;
  }, []);

  const validateQuantities = useCallback((products) => {
    return products.some(product => product.quantity <= 0);
  }, []);

  useEffect(() => {
    const newErrors = validateProducts(formData.products);
    const newLimits = calculateBundleLimits(formData.products);
    const hasQuantityErrors = validateQuantities(formData.products);

    setLocalErrors(newErrors);
    setBundleLimits(newLimits);

    const hasLimitErrors = Object.entries(newLimits).some(([key, value]) => value > BUNDLE_LIMITS[key]);

    setErrors(prevErrors => ({
      ...prevErrors,
      products: formData.products.length === 0 
        ? "At least one product must be selected" 
        : Object.keys(newErrors).length > 0 
          ? "Please ensure all products have at least one option selected" 
          : hasQuantityErrors
            ? "Please ensure all product quantities are greater than 0"
            : null,
      limits: hasLimitErrors
    }));
  }, [formData.products, setErrors, validateProducts, calculateBundleLimits, setBundleLimits, validateQuantities]);

  const handleProductSelection = useCallback(async () => {
    try {
      const selection = await app.resourcePicker({
        type: "product",
        action: "select",
        filter: { variants: false, draft: false, archived: false },
        multiple: true,
        selectionIds: formData.products.map(product => ({ id: product.id }))
      });

      if (selection && selection.length > 0) {
        const newProducts = selection.map(product => {
          const existingProduct = formData.products.find(p => p.id === product.id);
          if (existingProduct) {
            return existingProduct;
          } else {
            return {
              id: product.id,
              title: product.title,
              vendor: product.vendor,
              images: product.images,
              handle: product.handle,
              quantity: 1,
              variants: product.variants,
              options: product.options.map(option => ({
                id: option.id,
                name: option.name,
                values: option.values.map(value => ({
                  value,
                  selected: true
                }))
              }))
            };
          }
        });

        setFormData(prev => ({
          ...prev,
          products: newProducts
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        products: "Error selecting products. Please try again."
      }));
    }
  }, [app, formData.products, setFormData, setErrors]);

  const handleQuantityChange = useCallback((id, quantity) => {
    const newQuantity = quantity === '' ? '' : parseInt(quantity, 10);
    
    setFormData((prev) => ({
      ...prev,
      products: prev.products.map(product =>
        product.id === id ? { ...product, quantity: newQuantity || '' } : product
      ),
    }));
  }, [setFormData]);

  const handleOptionValueToggle = useCallback((productId, optionId, value) => {
    setFormData((prev) => {
      const updatedProducts = prev.products.map(product =>
        product.id === productId
          ? {
              ...product,
              options: product.options.map(option =>
                option.id === optionId
                  ? {
                      ...option,
                      values: option.values.map(v =>
                        v.value === value ? { ...v, selected: !v.selected } : v
                      )
                    }
                  : option
              )
            }
          : product
      );

      return { ...prev, products: updatedProducts };
    });
  }, [setFormData]);

  const handleDeleteProduct = useCallback((productId) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter(product => product.id !== productId)
    }));
  }, [setFormData]);

  const handleOptionMenu = useCallback((productId) => {
    setActivePopoverId(activePopoverId === productId ? null : productId);
  }, [activePopoverId]);

  const handleSetDefaultValue = useCallback((productId, optionId) => {
    const product = formData.products.find(p => p.id === productId);
    const option = product.options.find(o => o.id === optionId);
    setCurrentProductId(productId);
    setCurrentOptionId(optionId);
    setCurrentProductName(product.title);
    setCurrentOptionName(option.name);
    setIsModalOpen(true);
    setActivePopoverId(null);
  }, [formData.products]);

  const handleSelectDefaultValue = useCallback((value) => {
    setFormData((prev) => {
      const updatedProducts = prev.products.map(product =>
        product.id === currentProductId
          ? {
              ...product,
              options: product.options.map(option =>
                option.id === currentOptionId
                  ? {
                      ...option,
                      values: option.values.map(v => ({
                        ...v,
                        selected: v.value === value
                      }))
                    }
                  : option
              )
            }
          : product
      );

      return { ...prev, products: updatedProducts };
    });

    setIsModalOpen(false);
  }, [currentProductId, currentOptionId, setFormData]);

  const renderProductItem = (item) => {
    const { id, title, vendor, images, quantity, options } = item;
    const media = (
      <Avatar
        customer
        size="md"
        name={title}
        source={images[0]?.originalSrc || images[0]?.url}
      />
    );

    const customOptions = options.filter(option => option.name.toLowerCase() !== 'title');
    const quantityError = quantity <= 0 ? "Quantity must be greater than 0" : null;

    return (
      <ResourceItem
        id={id}
        media={media}
        accessibilityLabel={`View details for ${title}`}
      >
        <BlockStack gap="300">
          <InlineStack gap="500" align="space-between" wrap={false}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <Text variant="bodyMd" fontWeight="bold" as="h3" truncate>
                {title}
              </Text>
              <Text variant="bodySm" color="subdued">
                {vendor}
              </Text>
            </div>
            <InlineStack gap="300" align="center">
              <TextField
                label="Quantity"
                type="number"
                value={quantity.toString()}
                onChange={(value) => handleQuantityChange(id, value)}
                error={quantityError}
                autoComplete="off"
                min="1"
                labelHidden
              />
              {customOptions.length > 0 && (
                <Popover
                  active={activePopoverId === id}
                  activator={
                    <Button
                      icon={MenuVerticalIcon}
                      onClick={() => handleOptionMenu(id)}
                      accessibilityLabel="More options"
                    />
                  }
                  onClose={() => setActivePopoverId(null)}
                >
                  <ActionList
                    items={customOptions.map(option => ({
                      content: `Set default ${option.name}`,
                      onAction: () => handleSetDefaultValue(id, option.id)
                    }))}
                  />
                </Popover>
              )}
              <Button 
                onClick={() => handleDeleteProduct(id)} 
                icon={DeleteIcon}
                tone="critical"
                accessibilityLabel={`Delete ${title}`}
              />
            </InlineStack>
          </InlineStack>

          {customOptions.length > 0 ? (
            customOptions.map((option) => (
              <BlockStack key={option.id} gap="200">
                <Text variant="bodyMd" fontWeight="semibold">
                  {`${title} - ${option.name}`}
                </Text>
                <InlineStack gap="200" wrap>
                  {option.values.map((valueObj) => (
                    <div
                      key={valueObj.value}
                      style={{ opacity: valueObj.selected ? 1 : 0.5 }}
                    >
                      <Tag
                        onClick={() => handleOptionValueToggle(id, option.id, valueObj.value)}
                      >
                        {valueObj.value}
                      </Tag>
                    </div>
                  ))}
                </InlineStack>
                {localErrors[id] && localErrors[id][option.id] && (
                  <Text tone="critical">{localErrors[id][option.id]}</Text>
                )}
              </BlockStack>
            ))
          ) : (
            <Text>No customizable options available for this product.</Text>
          )}
        </BlockStack>
      </ResourceItem>
    );
  };

  return (
    <Card>
      <BlockStack gap="500">
        <InlineStack align="space-between">
          <Text variant="headingLg" as="h2">
            Select Products
          </Text>
          {formData.products.length > 0 && (
            <Button onClick={handleProductSelection} plain>
              Add product
            </Button>
          )}
        </InlineStack>
        {errors.products && <Banner status="critical">{errors.products}</Banner>}
        {errors.limits && (
          <Banner status="warning">
            Bundle exceeds Shopify's limits. Please reduce the number of products, options, or variants.
          </Banner>
        )}
        {formData.products.length > 0 ? (
          <ResourceList
            resourceName={{ singular: "product", plural: "products" }}
            items={formData.products}
            renderItem={renderProductItem}
          />
        ) : (
          <EmptyState
            heading="No products selected"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            action={{
              content: "Select products",
              onAction: handleProductSelection,
            }}
          >
            <p>Select products to include in your bundle.</p>
          </EmptyState>
        )}
      </BlockStack>
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Select Default Value for ${currentOptionName}`}
      >
        <Modal.Section>
          <BlockStack gap="400">
            {currentProductId && currentOptionId && (
              <ActionList
                items={formData.products
                  .find(p => p.id === currentProductId)?.options
                  .find(o => o.id === currentOptionId)?.values
                  .map(v => ({
                    content: v.value,
                    onAction: () => handleSelectDefaultValue(v.value)
                  }))
                }
              />
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Card>
  );
}

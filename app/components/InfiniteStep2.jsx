import {
    BlockStack,
    ButtonGroup,
    Text,
    Button,
    ResourceList,
    ResourceItem,
    InlineStack,
    Thumbnail,
    TextField,
    InlineError,
    Card,
} from "@shopify/polaris";
import { useCallback } from "react";

export default function InfiniteStep2({ app, formData, onProductOptionsChange, errors }) {

    const handleMultiProductSelection = useCallback(async () => {
        try {
            const selection = await app.resourcePicker({
                type: "product",
                action: "select",
                filter: { variants: true, draft: false, archived: false },
                multiple: true,
            });
            if (selection && selection.length > 0) {
                const newOption = {
                    id: Date.now(),
                    name: "",
                    products: selection.flatMap(product => 
                        product.variants.map(variant => ({
                            id: variant.id,
                            productId: product.id,
                            title: `${product.title} - ${variant.title}`,
                            image: product.images[0]?.originalSrc || '',
                            price: variant.price,
                            stock: variant.inventoryQuantity
                        }))
                    ),
                };

                onProductOptionsChange([...formData.productOptions, newOption]);
            }
        } catch (error) {
           
        }
    }, [app,formData.productOptions, onProductOptionsChange]);

    const handleSingleProductSelection = useCallback(async () => {
        try {
            const selection = await app.resourcePicker({
                type: "product",
                action: "select",
                filter: { variants: true, draft: false, archived: false },
                multiple: false,
            });
            if (selection && selection.length > 0) {
                const product = selection[0];
                console.log("This is the product", product);
                const newOption = {
                    id: Date.now(),
                    product: {
                      id: product.id,
                      handle:product.handle,
                      title: product.title,
                      image: product.images[0]?.originalSrc || '',
                      options: product.options.map(option => ({
                        id: option.id,
                        name: `${product.title} - ${option.name}`,
                        values: option.values,
                        selectedValue: option.values[0],
                      })),
                      variants: product.variants.map(variant => ({
                        id: variant.id,
                        productId: product.id,
                        title: `${product.title} - ${variant.title}`,
                        image: product.images[0]?.originalSrc || '',
                        price: variant.price,
                        stock: variant.inventoryQuantity
                      }))
                    },
                  };

                  onProductOptionsChange([...formData.productOptions, newOption]);
            }
        } catch (error) {
        
        }
    }, [ app,formData.productOptions, onProductOptionsChange]);

    const handleOptionNameChange = useCallback((optionId, value) => {
        onProductOptionsChange(
            formData.productOptions.map(option => 
              option.id === optionId ? { ...option, name: value } : option
            )
        );
    }, [formData.productOptions, onProductOptionsChange]);

    const handleOptionNameChangeSingle = useCallback((optionId, value) => {
        onProductOptionsChange(
            formData.productOptions.map(option => {
              if (option.product && option.product.options) {
                return {
                  ...option,
                  product: {
                    ...option.product,
                    options: option.product.options.map(productOption => 
                      productOption.id === optionId 
                        ? { ...productOption, name: value } 
                        : productOption
                    )
                  }
                };
              }
              return option;
            })
        );
    }, [formData.productOptions, onProductOptionsChange]);

    const handleRemoveProduct = useCallback((productId) => {
        onProductOptionsChange(formData.productOptions.filter(option => option.id !== productId));
    }, [formData.productOptions, onProductOptionsChange]);

    const handleRemoveVariant = useCallback((productId, variantId) => {
        onProductOptionsChange(
            formData.productOptions.map(option => {
                if (option.id === productId) {
                    if (option.products) {
                        return {
                            ...option,
                            products: option.products.filter(product => product.id !== variantId)
                        };
                    } else if (option.product) {
                        return {
                            ...option,
                            product: {
                                ...option.product,
                                variants: option.product.variants.filter(variant => variant.id !== variantId)
                            }
                        };
                    }
                }
                return option;
            }).filter(option => 
                (option.products && option.products.length > 0) || 
                (option.product && option.product.variants.length > 0)
            )
        );
    }, [formData.productOptions, onProductOptionsChange]);

    const handleEditProduct = useCallback(async (productId) => {
        const productToEdit = formData.productOptions.find(option => option.id === productId);
        try {
            let selection;
            if (productToEdit.products) {
                // For multi-product selection
                selection = await app.resourcePicker({
                    type: "product",
                    action: "select",
                    selectionIds: productToEdit.products.map(p => ({ id: p.productId })),
                    filter: { variants: true, draft: false, archived: false },
                    multiple: true,
                });
            } else if (productToEdit.product) {
                // For single product selection
                console.log("This is the product to edit", productToEdit);
                selection = await app.resourcePicker({
                    type: "product",
                    action: "select",
                    selectionIds: [{
                        id: productToEdit.product.id,
                        variants: productToEdit.product.variants.map(variant => ({id: variant.id}))
                    }],
                    filter: { variants: true, draft: false, archived: false },
                    multiple: false,
                });
                console.log("This is the selection", selection);
            }

            if (selection && selection.length > 0) {
                let updatedOption;
                if (productToEdit.products) {
                    // Update multi-product selection
                    updatedOption = {
                        ...productToEdit,
                        products: selection.flatMap(product => 
                            product.variants.map(variant => ({
                                id: variant.id,
                                productId: product.id,
                                title: `${product.title} - ${variant.title}`,
                                image: product.images[0]?.originalSrc || '',
                                price: variant.price,
                                stock: variant.inventoryQuantity
                            }))
                        ),
                    };
                } else if (productToEdit.product) {
                    // Update single product selection
                    const product = selection[0];
                    updatedOption = {
                        ...productToEdit,
                        product: {
                            id: product.id,
                            handle: product.handle,
                            title: product.title,
                            image: product.images[0]?.originalSrc || '',
                            options: product.options.map(option => ({
                                id: option.id,
                                name: `${product.title} - ${option.name}`,
                                values: option.values,
                                selectedValue: option.values[0],
                            })),
                            variants: product.variants.map(variant => ({
                                id: variant.id,
                                productId: product.id,
                                title: `${product.title} - ${variant.title}`,
                                image: product.images[0]?.originalSrc || '',
                                price: variant.price,
                                stock: variant.inventoryQuantity
                            }))
                        },
                    };
                }

                onProductOptionsChange(
                    formData.productOptions.map(option => 
                        option.id === productId ? updatedOption : option
                    )
                );
            }
        } catch (error) {
            console.error("Error editing product:", error);
        }
    }, [app, formData.productOptions, onProductOptionsChange]);

    return (
        <BlockStack gap="500">
            <Card>
            <InlineStack gap="400" align="space-between">
                <Text variant="heading2xl" as="h2">Add Products and Options</Text>

                <ButtonGroup>
                    <Button variant="primary" onClick={handleMultiProductSelection}>Add Products</Button>
                    <Button variant="primary" onClick={handleSingleProductSelection}>Add Product Options</Button>
                    </ButtonGroup>
                </InlineStack>
            </Card>

            {errors.products && <InlineError message={errors.products} fieldID="myFieldID" />}
            {errors.productNames && <InlineError message={errors.productNames} fieldID="myFieldID" />}

            {formData.productOptions.map((option, index) => (
                <Card key={option.id} sectioned>
                    <BlockStack gap="500">
                        <InlineStack align="space-between">
                            <Text variant="headingXl" as="h4">Product {index + 1}</Text>
                            <InlineStack gap="200">
                                <Button onClick={() => handleEditProduct(option.id)}>Edit Product</Button>
                                <Button destructive tone="critical" onClick={() => handleRemoveProduct(option.id)}>Remove Product</Button>
                            </InlineStack>
                        </InlineStack>
                        <BlockStack gap="400">
                            {option.products ? (
                                <>
                                    <TextField
                                        label={`Option Name`}
                                        value={option.name}
                                        onChange={(value) => handleOptionNameChange(option.id, value)}
                                        autoComplete="off"
                                    />
                                    <ResourceList
                                        items={option.products}
                                        renderItem={(item) => (
                                            <ResourceItem
                                                id={item.id}
                                                media={<Thumbnail source={item.image} alt={item.title} />}
                                                name={item.title}
                                                verticalAlignment="center"
                                            >
                                                <InlineStack align="space-between">
                                                    <BlockStack>
                                                        <Text variant="bodyMd" fontWeight="bold">{item.title}</Text>
                                                        <Text variant="bodyMd">Price: ${item.price}</Text>
                                                        <Text variant="bodyMd">Stock: {item.stock}</Text>
                                                    </BlockStack>
                                                    <Button destructive tone="critical" onClick={() => handleRemoveVariant(option.id, item.id)}>Remove</Button>
                                                </InlineStack>
                                            </ResourceItem>
                                        )}
                                    />
                                </>
                            ) : (
                                <BlockStack gap="200">
                                    {option.product.options.map((productOption, optionIndex) => (
                                        <TextField
                                            key={productOption.id}
                                            label={`Dropdown Title ${optionIndex + 1}`}
                                            value={productOption.name}
                                            onChange={(value) => handleOptionNameChangeSingle(productOption.id, value)}
                                            autoComplete="off"
                                        />
                                    ))}
                                    <ResourceList
                                        items={option.product.variants}
                                        renderItem={(item) => (
                                            <ResourceItem
                                                id={item.id}
                                                media={<Thumbnail source={item.image} alt={item.title} />}
                                                name={item.title}
                                                verticalAlignment="center"
                                            >
                                                <InlineStack align="space-between">
                                                    <BlockStack>
                                                        <Text variant="bodyMd" fontWeight="bold">{item.title}</Text>
                                                        <Text variant="bodyMd">Price: ${item.price}</Text>
                                                        <Text variant="bodyMd">Stock: {item.stock}</Text>
                                                    </BlockStack>
                                                    <Button destructive tone="critical" onClick={() => handleRemoveVariant(option.id, item.id)}>Remove</Button>
                                                </InlineStack>
                                            </ResourceItem>
                                        )}
                                    />
                                </BlockStack>
                            )}
                        </BlockStack>
                    </BlockStack>
                </Card>
            ))}
        </BlockStack>
    );
}

import {
    BlockStack,
    Text,
    Button,
    ResourceList,
    ResourceItem,
    Thumbnail,
    TextField,
    Card,
} from "@shopify/polaris";
import { useState, useCallback } from "react";

export default function InfiniteStep2({ app, formData, finalSubmit, isSubmitting }) {
    const [productOptions, setProductOptions] = useState([]);
    const [errors, setErrors] = useState({});

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

                setProductOptions(prev => [...prev, newOption]);
            }
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                products: "Error selecting products. Please try again."
            }));
        }
    }, [app]);

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

                setProductOptions(prev => [...prev, newOption]);
            }
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                options: "Error selecting product options. Please try again."
            }));
        }
    }, [app]);

    const handleOptionNameChange = useCallback((optionId, value) => {
        setProductOptions(prev => 
          prev.map(option => 
            option.id === optionId ? { ...option, name: value } : option
          )
        );
      }, []);
      const handleOptionNameChangeSingle = useCallback((optionId, value) => {
        setProductOptions(prev => 
            prev.map(option => {
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
      }, []);

      const handleSaveBundle = useCallback(() => {
        const finalFormData = {
          ...formData,
          productOptions,
        };
        finalSubmit(finalFormData);
      }, [formData, productOptions]);
    

    return (
        <BlockStack gap="500">
            <Text variant="heading2xl" as="h2">Add Products and Options</Text>

            <BlockStack gap="300">
                <Button onClick={handleMultiProductSelection}>Add Products</Button>
                <Button onClick={handleSingleProductSelection}>Add Product Options</Button>
            </BlockStack>

            {errors.products && <Text color="critical">{errors.products}</Text>}
            {errors.options && <Text color="critical">{errors.options}</Text>}

            {productOptions.map((option, index) => (
                <Card key={option.id} sectioned>
                     <BlockStack gap="500">
                        <Text variant="headingXl" as="h4">Product {index + 1}</Text>
                        <BlockStack gap="400">
                            {option.products ? (<>
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
                                            <Text variant="bodyMd" fontWeight="bold">{item.title}</Text>
                                            <Text variant="bodyMd">Price: ${item.price}</Text>
                                            <Text variant="bodyMd">Stock: {item.stock}</Text>
                                        </ResourceItem>
                                    )}
                                />
                                </>
                            ) : (
                                <BlockStack gap="200">
                                    {option.product.options.map((productOption, optionIndex) => (
                                        <TextField
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
                                            <Text variant="bodyMd" fontWeight="bold">{item.title}</Text>
                                            <Text variant="bodyMd">Price: ${item.price}</Text>
                                            <Text variant="bodyMd">Stock: {item.stock}</Text>
                                        </ResourceItem>
                                    )}
                                />
                                </BlockStack>
                            )}
                        </BlockStack>
                    </BlockStack>
                </Card>
            ))}
             <Button onClick={handleSaveBundle} primary loading={isSubmitting}>
                Save Bundle
            </Button>
        </BlockStack>
    );
}

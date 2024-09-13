import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useActionData, useNavigate } from "@remix-run/react";
import { useState, useCallback, useEffect } from "react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { 
  Page, 
  Card, 
  FormLayout, 
  TextField, 
  Button,
  BlockStack,
  ResourceList,
  ResourceItem,
  InlineStack,
  Thumbnail,
  ButtonGroup,
  Spinner,
  Text,
  Banner
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";

// GraphQL mutation for updating product title
const UPDATE_PRODUCT_TITLE = `
  mutation updateProduct($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function loader({ params, request }) {
  const { admin } = await authenticate.admin(request);
  const bundleId = params.bundleId;

  const bundle = await prisma.bundle.findUnique({
    where: { id: parseInt(bundleId) },
  });

  if (!bundle) {
    throw new Response("Bundle not found", { status: 404 });
  }

  return json({ bundle });
}

export async function action({ request, params }) {
  const { admin } = await authenticate.admin(request);
  const bundleId = params.bundleId;
  const formData = await request.formData();
  const updates = JSON.parse(formData.get('formData'));

  // Update product title in Shopify
  const titleResponse = await admin.graphql(UPDATE_PRODUCT_TITLE, {
    variables: {
      input: {
        id: updates.ProductBundleId,
        title: updates.bundleName,
      },
    },
  });

  const titleData = await titleResponse.json();

  if (titleData.data.productUpdate.userErrors.length > 0) {
    return json({ errors: titleData.data.productUpdate.userErrors });
  }

  // Update bundle in database
  const updatedBundle = await prisma.bundle.update({
    where: { id: parseInt(bundleId) },
    data: {
      bundleName: updates.bundleName,
      products: updates.productOptions,
    },
  });

  return json({ success: true, bundle: updatedBundle });
}

export default function EditBundle() {
  const { bundle } = useLoaderData();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const actionData = useActionData();
  const submit = useSubmit();
  const app = useAppBridge();
  useEffect(() => {
    if (actionData?.success) {
      app.toast.show('Bundle Updated successfully');
    }
  }, [actionData,app]);
  const [formData, setFormData] = useState({
    bundleName: bundle.bundleName,
    ProductBundleId: bundle.ProductBundleId,
    productOptions: bundle.products || [],
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = useCallback((field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleProductOptionsChange = useCallback((newProductOptions) => {
    setFormData(prev => ({ ...prev, productOptions: newProductOptions }));
  }, []);

  const handleSubmit = useCallback(() => {
    // Validate form data
    const newErrors = {};
    if (!formData.bundleName.trim()) {
      newErrors.bundleName = "Bundle name is required";
    }
    if (formData.productOptions.length === 0) {
      newErrors.products = "At least one product must be added to the bundle";
    } else {
      const emptyNames = formData.productOptions.some(option => 
        (option.products && !option.name.trim()) || 
        (option.product && option.product.options.some(o => !o.name.trim()))
      );
      if (emptyNames) {
        newErrors.productNames = "All product options must have a name";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Clear errors if there are no new errors
    setErrors({});

    const formDataToSend = new FormData();
    formDataToSend.append('formData', JSON.stringify(formData));
    submit(formDataToSend, { method: "post" });
  }, [formData, submit]);

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

        handleProductOptionsChange([...formData.productOptions, newOption]);
      }
    } catch (error) {
      console.error("Error selecting products:", error);
      setErrors(prev => ({ ...prev, products: "Error selecting products. Please try again." }));
    }
  }, [app, formData.productOptions, handleProductOptionsChange]);

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
        const newOption = {
          id: Date.now(),
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

        handleProductOptionsChange([...formData.productOptions, newOption]);
      }
    } catch (error) {
      console.error("Error selecting product:", error);
      setErrors(prev => ({ ...prev, products: "Error selecting product. Please try again." }));
    }
  }, [app, formData.productOptions, handleProductOptionsChange]);

  const handleRemoveProduct = useCallback((productId) => {
    handleProductOptionsChange(formData.productOptions.filter(option => option.id !== productId));
  }, [formData.productOptions, handleProductOptionsChange]);

  const handleRemoveVariant = useCallback((productId, variantId) => {
    handleProductOptionsChange(
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
  }, [formData.productOptions, handleProductOptionsChange]);

  const handleEditProduct = useCallback(async (productId) => {
    const productToEdit = formData.productOptions.find(option => option.id === productId);
    try {
      let selection;
      if (productToEdit.products) {
        selection = await app.resourcePicker({
          type: "product",
          action: "select",
          initialSelectionIds: productToEdit.products.map(p => ({ id: p.productId })),
          filter: { variants: true, draft: false, archived: false },
          multiple: true,
        });
      } else if (productToEdit.product) {
        selection = await app.resourcePicker({
          type: "product",
          action: "select",
          initialSelectionIds: [{ id: productToEdit.product.id }],
          selectionIds: [{
            id: productToEdit.product.id,
            variants: productToEdit.product.variants.map(variant => ({id: variant.id}))
          }],
          filter: { variants: true, draft: false, archived: false },
          multiple: false,
        });
      }

      if (selection && selection.length > 0) {
        let updatedOption;
        if (productToEdit.products) {
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

        handleProductOptionsChange(
          formData.productOptions.map(option => 
            option.id === productId ? updatedOption : option
          )
        );
      }
    } catch (error) {
      console.error("Error editing product:", error);
      setErrors(prev => ({ ...prev, products: "Error editing product. Please try again." }));
    }
  }, [app, formData.productOptions, handleProductOptionsChange]);

  const handleOptionNameChange = useCallback((optionId, value) => {
    handleProductOptionsChange(
      formData.productOptions.map(option => 
        option.id === optionId ? { ...option, name: value } : option
      )
    );
  }, [formData.productOptions, handleProductOptionsChange]);

  const handleOptionNameChangeSingle = useCallback((optionId, value) => {
    handleProductOptionsChange(
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
  }, [formData.productOptions, handleProductOptionsChange]);

  const handleBack = useCallback(() => {
    navigate('/app');
  }, [navigate]);

  useEffect(() => {
    setErrors({});
  }, [formData]);

  return (
    <Page title={`Edit Bundle: ${formData.bundleName}`}>
        {navigation.state === "loading" ? (
            <>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spinner accessibilityLabel="Loading" size="large" />
      </div>
      </> 
      ):(
   
  
      <BlockStack gap="500">
        {successMessage && (
          <Banner status="success" onDismiss={() => setSuccessMessage("")}>
            {successMessage}
          </Banner>
        )}
        {Object.keys(errors).length > 0 && (
          <Banner status="critical">
            <p>Please correct the following errors:</p>
            <ul>
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>{value}</li>
              ))}
            </ul>
          </Banner>
        )}
        <Card sectioned>
          <FormLayout>
            <TextField
              label="Bundle Name"
              value={formData.bundleName}
              onChange={handleChange('bundleName')}
              error={errors.bundleName}
              autoComplete="off"
            />
          </FormLayout>
        </Card>

        <Card>
          <BlockStack gap="400">
          <InlineStack gap="400" align="space-between">
            <Text variant="heading2xl" as="h2">Edit Products and Options</Text>
            <ButtonGroup>
              <Button variant="primary" onClick={handleMultiProductSelection}>Add Products</Button>
              <Button variant="primary" onClick={handleSingleProductSelection}>Add Product Options</Button>
              </ButtonGroup>
            </InlineStack>
          </BlockStack>
        </Card>

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

        <Card sectioned>
        <InlineStack gap="400" align="space-between">
           <Button onClick={handleBack}>Back to Dashboard</Button> 
          <Button onClick={handleSubmit} loading={navigation.state === "submitting"} variant="primary">Save Changes</Button>
        </InlineStack>
        </Card>
      </BlockStack>

)}
    </Page>
  );
}

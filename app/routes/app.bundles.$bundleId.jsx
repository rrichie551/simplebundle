import React, { useState, useEffect, useCallback } from "react";
import { json, useActionData, useLoaderData, useSubmit, useNavigation, useNavigate } from '@remix-run/react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { 
  Page,
  Card,
  BlockStack,
  Text,
  Button,
  Spinner,
  Modal,
} from "@shopify/polaris";
import { updateBundle } from '../update-bundle.server';
import { getBundle } from '../get-bundle.server';

import ProductSelectionStep from '../components/ProductSelectionStep';
import DiscountStep from '../components/DiscountStep';
import TwoColumnLayout from '../components/TwoColumn';

export const action = async ({ request }) => {
  const formData = await request.formData();
  try {
    const result = await updateBundle(request, formData);
    return json({ success: result.success }, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("Error updating bundle:", error);
    return json({ success: false, error: error.message }, { status: 400 });
  }
};

export async function loader({ params, request }) {
  try {
    const result = await getBundle(request, params.bundleId);
    return json({ success: true, bundleData: result }, { status: 200 });
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return json({ success: false, error: error.message }, { status: 400 });
  }
}

const BundleUpdate = () => {
  const bundleData = useLoaderData();
  
  const app = useAppBridge();
  const submit = useSubmit();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    products: [],
    discountType: 'percentage',
    discountValue: '',
    noDiscount: false,
    idInDb: bundleData.bundleData.data.idInDb
  });
  const [errors, setErrors] = useState({});
  const [bundleLimits, setBundleLimits] = useState({
    products: 0,
    options: 0,
    variants: 0
  });

  const actionData = useActionData();

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        app.toast.show('Bundle Updated Successfully');
      } else {
        app.toast.show('Failed to update bundle', { isError: true });
      }
    }
  }, [actionData, app]);

  useEffect(() => {
    
    if (bundleData.bundleData.data.product.bundleComponents) {
      const products = bundleData.bundleData.data.product.bundleComponents.edges.map(edge => ({
        id: edge.node.componentProduct.id,
        title: edge.node.componentProduct.title,
        vendor: edge.node.componentProduct.vendor || '',
        images: edge.node.componentProduct.featuredImage ? [edge.node.componentProduct.featuredImage] : [],
        quantity: edge.node.quantity,
        options: edge.node.optionSelections.map(selection => ({
          id: selection.componentOption.id,
          name: selection.componentOption.name,
          values: selection.values.map(v => ({
            value: v.value,
            selected: v.selectionStatus === 'SELECTED'
          }))
        }))
      }));

      setFormData(prev => ({ 
        ...prev, 
        products,
        discountType: bundleData.bundleData.data.discountType,
        discountValue: bundleData.bundleData.data.discountValue,
        noDiscount: !bundleData.bundleData.data.discountType && !bundleData.bundleData.data.discountValue
      }));
    }
  }, [bundleData]);

  const handleChange = useCallback((field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.noDiscount) {
      if (!formData.discountValue) {
        newErrors.discountValue = 'Discount value is required';
      } else if (formData.discountType === 'percentage' && (formData.discountValue < 0 || formData.discountValue > 100)) {
        newErrors.discountValue = 'Percentage must be between 0 and 100';
      } else if (formData.discountType === 'fixed' && formData.discountValue < 0) {
        newErrors.discountValue = 'Fixed amount must be 0 or greater';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);


  const handleGoBack = useCallback(() => {
    navigate(-1); 
  }, [navigate]);

  const handleUpdate = useCallback(() => {
    if (validateForm()) {
      const cleanedFormData = {
        ...bundleData.bundleData.data.product,
        ...formData,
        products: formData.products.map((product) => ({
          ...product,
          options: product.options.map((option) => ({
            ...option,
            values: option.values.filter((v) => v.selected).map((v) => v.value),
          })),
          variants: product.variants,
        })),
        discountType: formData.noDiscount ? null : formData.discountType,
        discountValue: formData.noDiscount ? null : formData.discountValue,
      };
      
      submit({ formData: JSON.stringify(cleanedFormData) }, { method: 'post' });
    }
  }, [formData, validateForm, submit, bundleData]);

  const isUpdating = navigation.state === "submitting";

  return (

    <>
      <style>
        {`
          .Polaris-Modal-Dialog__Modal .Polaris-Modal-CloseButton,
          .Polaris-Modal-Dialog__Modal .Polaris-Button--iconOnly {
            display: none !important;
          }
        `}
      </style>
    <Page fullWidth>
      <TwoColumnLayout step={2} bundleLimits={bundleLimits} formData={formData}>
        <BlockStack gap="500">
          <ProductSelectionStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            app={app}
            setBundleLimits={setBundleLimits}
          />
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Update Discount</Text>
              <DiscountStep
                formData={formData}
                handleChange={handleChange}
                setFormData={setFormData}
                errors={errors}
              />
            </BlockStack>
          </Card>
          <div style={{ display: 'flex', justifyContent: 'flex-start', gap:'14px' }}>
            <Button 
              variant="primary" 
              onClick={handleUpdate} 
            >
              Update Bundle
              </Button>
              
              <Button 
              onClick={handleGoBack} 
            >
              Go back to Bundle
            </Button>
          </div>
        </BlockStack>
      </TwoColumnLayout>
      <Modal
        open={isUpdating}
        loading
        title="Updating Bundle"
        onClose={() => {}}
      >
        <Modal.Section>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <Spinner size="large" />
            <Text variant="bodyMd" as="p" alignment="center" style={{ marginTop: '16px' }}>
              Please wait while we update your bundle...
            </Text>
          </div>
        </Modal.Section>
      </Modal>
      </Page>
      <div style={{ height: '60px' }} aria-hidden="true" /> {/* Spacer */}
    </>
      
  );
};

export default BundleUpdate;

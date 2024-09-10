import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Page,
  Card,
  ProgressBar,
  InlineStack,
  Button,
  Text,
  Icon,
  Form,
  BlockStack,
  Spinner,
  Banner,
} from "@shopify/polaris";
import { ChevronLeftIcon, ChevronRightIcon } from "@shopify/polaris-icons";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { createBundle } from "../create-bundle.server";
import { fetchShopInfo } from "../fetchShopInfo.server";

import WelcomeStep from "../components/WelcomeStep";
import ProductSelectionStep from "../components/ProductSelectionStep";
import DiscountStep from "../components/DiscountStep";
import DescriptionStep from "../components/DescriptionStep";
import MediaSelection from "../components/MediaSelection";
import MultiStepLoader from "../components/MultiStepLoader";
import { BundleWarning } from "../components/BundleWarning";
import TwoColumnLayout from "../components/TwoColumn";

export const action = async ({ request }) => {
  const formData = await request.formData();

  try {
    const result = await createBundle(request, formData);
    const productId = result.productId;
    const miniProductId = productId.split("/").pop();

    return json(
      { success: true, productId: miniProductId, result: result },
      { status: 200 },
    );
  } catch (error) {
    return json({ success: false, error: error.message }, { status: 400 });
  }
};

export const loader = async ({ request }) => {
  const shopInfo = await fetchShopInfo(request);
  return json({ shopInfo });
};

export default function CreateBundle() {
  const { shopInfo } = useLoaderData();
  const [showBundleWarning, setShowBundleWarning] = useState(true);
  const productTags = useMemo(
    () => shopInfo.data.shop.productTags.edges.map((edge) => edge.node),
    [shopInfo],
  );

  const productTypes = useMemo(
    () => shopInfo.data.shop.productTypes.edges.map((edge) => edge.node),
    [shopInfo],
  );

  const initialFormData = useMemo(
    () => ({
      bundleName: "",
      products: [],
      isDiscountOptional: false,
      discountType: "percentage",
      discountValue: "",
      noDiscount: false,
      description: "",
      collectionsToJoin: [],
      media: [],
      productType: "",
      productTags: [],
    }),
    [],
  );

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [productImages, setProductImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bundleCreated, setBundleCreated] = useState(false);
  const [bundleLimits, setBundleLimits] = useState({
    products: 0,
    options: 0,
    variants: 0,
  });

  const app = useAppBridge();
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData();
  const redirectAnchorRef = useRef(null);

  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        setBundleCreated(true);
        setIsLoading(true);
        if (redirectAnchorRef.current) {
          redirectAnchorRef.current.href = `shopify://admin/products/${actionData.productId}`;
          redirectAnchorRef.current.click();
        }
      } else {
        setErrors({ submit: actionData.error });
        setIsLoading(false);
      }
    }
  }, [actionData]);

  useEffect(() => {
    const selectedProductImages = formData.products.map((p) => p.images);
    setProductImages(selectedProductImages);
  }, [formData.products]);

  const validateStep = useCallback(() => {
    const newErrors = {};
    switch (step) {
      case 1:
        if (!formData.bundleName.trim())
          newErrors.bundleName = "Bundle name is required";
        break;
      case 2:
        if (errors.products || errors.limits) {
          return false;
        }
        break;
      case 3:
        if (!formData.noDiscount) {
          if (!formData.discountValue.trim())
            newErrors.discountValue = "Discount value is required";
          else if (
            isNaN(formData.discountValue) ||
            Number(formData.discountValue) <= 0
          )
            newErrors.discountValue =
              "Discount value must be a positive number";
        }
        break;
      case 4:
        if (!formData.description.trim())
          newErrors.description = "Description is required";
        break;
    }
    setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  }, [formData, step,errors.products, errors.limits]);

  const handleNextStep = useCallback(() => {
    if (validateStep()) {
      setStep((prevStep) => prevStep + 1);
    }
  }, [validateStep]);

  const handlePreviousStep = useCallback(() => {
    setStep((prevStep) => prevStep - 1);
  }, []);

  const handleSubmit = useCallback(
    (status) => {
      if (validateStep()) {
        const formDataToSend = new FormData();

        const cleanedFormData = {
          ...formData,
          status: status,
          products: formData.products.map((product) => ({
            ...product,
            options: product.options.map((option) => ({
              ...option,
              values: option.values
                .filter((v) => v.selected)
                .map((v) => v.value),
            })),
          })),
          media: formData.media.map(({ file, ...rest }) => rest),
        };

        formDataToSend.append("formData", JSON.stringify(cleanedFormData));

        formData.media.forEach((media, index) => {
          if (media.file) {
            formDataToSend.append(`media_${index}`, media.file, media.name);
          }
        });

        setIsLoading(true);
        setErrors({});

        submit(formDataToSend, {
          method: "post",
          encType: "multipart/form-data",
        });
      }
    },
    [formData, validateStep, submit],
  );

  const handleChange = useCallback(
    (field) => (value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (field === "noDiscount" && value) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.discountValue;
          delete newErrors.discountType;
          return newErrors;
        });
      }
    },
    [],
  );

  const renderStep = useCallback(() => {
    switch (step) {
      case 1:
        return (
          <WelcomeStep
            heading="Create Bundle"
            description="Increase Average Order Value by bundling products together."
            formData={formData}
            handleChange={(field) => (value) =>
              setFormData((prev) => ({ ...prev, [field]: value }))
            }
            errors={errors}
          />
        );
      case 2:
        return (
          <ProductSelectionStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            app={app}
            setBundleLimits={setBundleLimits}
          />
        );
      case 3:
        return (
          <>
            <MediaSelection
              onChange={(media) => {
                setFormData((prev) => ({ ...prev, media }));
              }}
              initialFiles={formData.media}
              productImages={productImages}
            />
            <DiscountStep
              formData={formData}
              handleChange={handleChange}
              errors={errors}
              setErrors={setErrors}
            />
          </>
        );
      case 4:
        return (
          <DescriptionStep
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            app={app}
            productTags={productTags}
            productTypes={productTypes}
          />
        );
      default:
        return null;
    }
  }, [
    step,
    formData,
    errors,
    setFormData,
    app,
    productTags,
    productTypes,
    productImages,
    setBundleLimits,
    handleChange,
  ]);

  return (
    <Page fullWidth>
      <BlockStack gap="800">
        <ProgressBar progress={(step / 4) * 100} size="small" tone="primary" />
        {errors.submit && (
          <Banner
            title="There was an error creating the bundle"
            tone="critical"
          >
            <p>{errors.submit}</p>
          </Banner>
        )}

        <BundleWarning
          showBanner={showBundleWarning}
          setShowBanner={setShowBundleWarning}
        />

        <Form method="post">
          <TwoColumnLayout
            step={step}
            bundleLimits={bundleLimits}
            formData={formData}
          >
            <BlockStack gap="600">
              {renderStep()}
              <Card>
                <InlineStack align="space-between">
                  <div>
                    {step > 1 && (
                      <Button onClick={handlePreviousStep}>
                        <InlineStack gap="200">
                          <Icon source={ChevronLeftIcon} />
                          <Text>Previous</Text>
                        </InlineStack>
                      </Button>
                    )}
                  </div>
                  <div>
                    {step < 4 ? (
                      <Button onClick={handleNextStep} primary
                        disabled={step === 2 && (errors.products || errors.limits)}
                      >
                        <InlineStack gap="200">
                          <Text>Next</Text>
                          <Icon source={ChevronRightIcon} />
                          
                        </InlineStack>
                      </Button>
                    ) : (
                      <InlineStack gap="200">
                        <Button
                          onClick={() => handleSubmit("draft")}
                          variant="primary"
                          loading={navigation.state === "submitting"}
                        >
                          Save as Draft
                        </Button>
                        <Button
                          onClick={() => handleSubmit("active")}
                          variant="primary"
                          loading={navigation.state === "submitting"}
                        >
                          Publish Bundle
                        </Button>
                      </InlineStack>
                    )}
                  </div>
                </InlineStack>
              </Card>
            </BlockStack>
          </TwoColumnLayout>
        </Form>
      </BlockStack>
      <a ref={redirectAnchorRef} style={{ display: "none" }} target="_top">
        Redirect
      </a>
      <MultiStepLoader isLoading={isLoading} bundleCreated={bundleCreated} />
    </Page>
  );
}

import React, { useEffect, useState } from "react";
import { 
  Card, 
  BlockStack,
  Text, 
  Select, 
  TextField,
  Checkbox
} from "@shopify/polaris";
export default function DiscountStep({ formData, handleChange, setFormData, errors: propErrors, showFormData }) {
  const [errors, setErrors] = useState({});
  const displayData = showFormData ? formData : { ...formData };
  const noDiscount = displayData.noDiscount || false;
  useEffect(() => {
    setErrors(noDiscount ? {} : propErrors);
  }, [noDiscount, propErrors]);
  const handleNoDiscountChange = (checked) => {
    if (!showFormData) {
      handleChange("noDiscount")(checked);
      if (checked) {
        handleChange("discountType")("");
        handleChange("discountValue")("");
      }
      setErrors({});
    }
  };
  const validateField = (field, value) => {
    if (noDiscount) return;
    let newErrors = { ...errors };
    switch (field) {
      case "discountType":
        if (!value) {
          newErrors.discountType = "Discount type is required";
        } else {
          delete newErrors.discountType;
        }
        break;
      case "discountValue":
        if (!value) {
          newErrors.discountValue = "Discount value is required";
        } else if (isNaN(value) || Number(value) <= 0) {
          newErrors.discountValue = "Discount value must be a positive number";
        } else {
          delete newErrors.discountValue;
        }
        break;
    }
    setErrors(newErrors);
  };
  const handleFieldChange = (field) => (value) => {
    if (!showFormData) {
      handleChange(field)(value);
      validateField(field, value);
    }
  };
  const isDisabled = showFormData || noDiscount;
  // Function to prepare data for sending
  const prepareDataForSubmission = () => {
    const dataToSend = { ...formData };
    if (noDiscount || (!dataToSend.discountType && !dataToSend.discountValue)) {
      delete dataToSend.discountType;
      delete dataToSend.discountValue;
      dataToSend.noDiscount = true;
    } else {
      dataToSend.noDiscount = false;
    }
    return dataToSend;
  };
  return (
    <Card>
      <BlockStack gap="500">
        <Text variant="headingMd" as="h2">
          Set Discount
        </Text>
        
        
        {!noDiscount && (
          <>
            <Select
              label="Discount Type"
              options={[
                { label: "Select discount type", value: "" },
                { label: "Percentage", value: "percentage" },
                { label: "Fixed Amount", value: "fixed" },
              ]}
              value={displayData.discountType || ""}
              onChange={handleFieldChange("discountType")}
              disabled={isDisabled}
              error={errors.discountType}
            />
            <TextField
              label="Discount Value"
              value={displayData.discountValue || ""}
              onChange={handleFieldChange("discountValue")}
              error={errors.discountValue}
              type="number"
              suffix={displayData.discountType === "percentage" ? "%" : "Fixed Amount"}
              disabled={isDisabled || !displayData.discountType}
            />
          </>
        )}
        <Checkbox
          label="Don't offer a discount"
          checked={noDiscount}
          onChange={handleNoDiscountChange}
          disabled={showFormData}
        />
      </BlockStack>
    </Card>
  );
}
import React from 'react';
import { Banner, List } from "@shopify/polaris";
export function BundleWarningTwo({ showBanner, setShowBanner }) {
  if (!showBanner) return null;
  return (
    <Banner
      title="Important Information About Bundles"
      status="info"
      onDismiss={() => setShowBanner(false)}
    >
      <p>Please note the following details about creating and managing bundles:</p>
      <List type="bullet">
        <List.Item>Creating a bundle will generate a new product page in your Shopify store.</List.Item>
        <List.Item>All product details, will automatically sync with your Shopify store.</List.Item>
      </List>
    </Banner>
  );
}
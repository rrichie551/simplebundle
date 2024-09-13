import React from 'react';
import { Banner, List } from "@shopify/polaris";
export function BundleWarning({ showBanner, setShowBanner }) {
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
        <List.Item>All product details, except for price, will automatically sync with your Shopify store.</List.Item>
        <List.Item>Changes to individual product prices after adding them to a bundle will not affect the bundle's price.</List.Item>
        <List.Item>Bundle prices must be manually updated if you wish to reflect changes in individual product prices.</List.Item>
      </List>
    </Banner>
  );
}
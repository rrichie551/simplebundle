import React from 'react';
import { Layout, Card, Text, BlockStack, InlineStack } from '@shopify/polaris';

const BUNDLE_LIMITS = {
  products: 30,
  options: 3,
  variants: 100
};

const stepInfo = {
  1: {
    title: "Brand Your Bundle",
    description: "Name it to fame it. Your bundle's name is its first impression. Make it snappy, make it relevant, make it stick. A forgettable name means forgettable sales.",
  },
  2: {
    title: "Stock Your Bundle",
    description: "Choose wisely. Each product should earn its spot. Aim for synergy - items that work better together than alone. Your bundle should solve a problem or fulfill a desire.",
  },
  3: {
    title: "Price and Showcase",
    description: "Crunch the numbers, then make it pretty. Set a price that's a no-brainer for customers but still profitable for you. Use high-quality images that show off your bundle's value at a glance.",
  },
  4: {
    title: "Pitch Your Bundle",
    description: "Here's where you close the deal. Highlight benefits, not just features. Tell them why they need it, how it'll make life better. Make your description work as hard as you do.",
  },
};

export default function TwoColumnLayoutTwo({ children, step, bundleLimits }) {
  const renderBundleLimitItem = (key, value, limit) => {
    const isExceeded = value > limit;
    const color = isExceeded ? 'critical' : 'subdued';
    
    return (
      <InlineStack gap="200" align="start">
        {isExceeded}
        <Text tone={color}>
          {value}/{limit} {key}
        </Text>
      </InlineStack>
    );
  };

  return (
    <Layout>
      <Layout.Section>
        {children}
      </Layout.Section>
      <Layout.Section variant="oneThird">
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingLg" as="h2">Brand Your Bundle</Text>
              <Text>Name it to fame it. Your bundle's name is its first impression. Make it snappy, make it relevant, make it stick. A forgettable name means forgettable sales.</Text>
            </BlockStack>
          </Card>
          {step === 2 && bundleLimits && (
            <>
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h3">Bundle Limits</Text>
                  <BlockStack gap="200">
                    {renderBundleLimitItem('products', bundleLimits?.products, BUNDLE_LIMITS.products)}
                    {renderBundleLimitItem('options', bundleLimits?.options, BUNDLE_LIMITS.options)}
                    {renderBundleLimitItem('variants', bundleLimits?.variants, BUNDLE_LIMITS.variants)}
                  </BlockStack>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd" as="h3">Customizable Options</Text>
                  <Text>Buyers will be able to choose from these options:</Text>
                </BlockStack>
              </Card>
            </>
          )} 
        </BlockStack>
      </Layout.Section>
    </Layout>
  );
}
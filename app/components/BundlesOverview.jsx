import React from "react";
import {
  Card,
  Text,
  InlineStack,
  BlockStack,
  Box,
  Tooltip,
  Icon,
} from "@shopify/polaris";
import { InfoIcon } from "@shopify/polaris-icons";

function InfoTooltip({ content }) {
  return (
    <Tooltip content={content}>
        <Icon source={InfoIcon} color="subdued" />
    </Tooltip>
  );
}

export function BundlesOverview({ totalBundles, activeBundles, draftBundles, revenue, orders, currency }) {
  return (
    <BlockStack gap="400">
      <Text variant="headingLg" as="h2">
        Bundles Overview
      </Text>
      <InlineStack wrap={false} align="start" gap="500">
        <Card>
          <Box padding="150">
            <BlockStack gap="200">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h3">
                  Total Bundles Created
                </Text>
                <InfoTooltip content="This represents the total number of bundles created in your store." />
              </InlineStack>
              <Text variant="heading2xl" as="p">
                {totalBundles}
              </Text>
              <Text variant="bodySm" as="p" color="subdued">
                Total Active Bundles: {activeBundles}
              </Text>
              <Text variant="bodySm" as="p" color="subdued">
                Total Draft Bundles: {draftBundles}
              </Text>
            </BlockStack>
          </Box>
        </Card>
        <Card>
          <Box padding="150">
            <BlockStack gap="200">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h3">
                  Total Revenue Generated
                </Text>
                <InfoTooltip content="This represents the total number of bundles created in your store." />
              </InlineStack>
              <Text variant="heading2xl" as="p">
              {revenue}  <span style={{fontSize:'0.6em'}}>{currency}</span>
              </Text>
            </BlockStack>
          </Box>
        </Card>
        <Card>
          <Box padding="150">
            <BlockStack gap="200">
              <InlineStack align="space-between">
                <Text variant="headingMd" as="h3">
                  Total Orders Created
                </Text>
                <InfoTooltip content="This is the number of orders created of bundles" />
              </InlineStack>
              <Text variant="heading2xl" as="p">
                {orders}
              </Text>
            </BlockStack>
          </Box>
        </Card>
      </InlineStack>
    </BlockStack>
  );
}

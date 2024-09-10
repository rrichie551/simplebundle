import React, { useState, useMemo } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  SkeletonBodyText,
  EmptyState,
  BlockStack
} from "@shopify/polaris";
import { PlusIcon } from "@shopify/polaris-icons";
import { RequestFeature } from "./RequestFeature";
import { SyncWarning } from "./SyncWarning";
import { ProductTable } from "./ProductTable";
import { BundlesOverview } from "./BundlesOverview";

export const DashboardUI = ({ products, onStatusChange, onDeleteProduct, fetcher}) => {
  const [showRequestFeature, setShowRequestFeature] = useState(true);
  const [showSyncWarning, setShowSyncWarning] = useState(true);

  const activeBundles = useMemo(() => products?.filter(({ node }) => node.status === 'ACTIVE').length ?? 0, [products]);
  const draftBundles = useMemo(() => products?.filter(({ node }) => node.status === 'DRAFT').length ?? 0, [products]);

  if (!products || products.length === 0) {
    return (
      <Page narrowWidth >
        <BlockStack gap="400">
        <Text variant="heading2xl" as="h1">Bundles</Text>
        <Card>
          {!products ? (
            <SkeletonBodyText lines={3} />
          ) : (
            <EmptyState
              heading="No Bundles found"
              action={{content: 'Add Bundle', icon: PlusIcon,  url: '/app/create-bundle',}}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>Create Bundle to see them here.</p>
            </EmptyState>
          )}
        </Card>
        </BlockStack>
      </Page>
    );
  }

  return (
    <Page fullWidth>
      <BlockStack gap="800">
        <Layout>
          <Layout.Section>
            <RequestFeature 
              showBanner={showRequestFeature} 
              setShowBanner={setShowRequestFeature} 
              fetcher={fetcher}

            />
          </Layout.Section>
          <Layout.Section>
            <SyncWarning 
              showBanner={showSyncWarning} 
              setShowBanner={setShowSyncWarning} 
            />
          </Layout.Section>
          <Layout.Section>
            <BundlesOverview 
              totalBundles={products.length}
              activeBundles={activeBundles}
              draftBundles={draftBundles}
            />
          </Layout.Section>
          <Layout.Section>
            <ProductTable 
              products={products} 
              onStatusChange={onStatusChange} 
              onDeleteProduct={onDeleteProduct}
              fetcher={fetcher}
            />
          </Layout.Section>
        </Layout>
        <div style={{ height: '60px' }} aria-hidden="true" /> {/* Spacer */}
      </BlockStack>
    </Page>
  );
};

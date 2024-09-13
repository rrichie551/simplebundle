import React from 'react';
import { Banner } from "@shopify/polaris";

export function SyncWarning({ showBanner, setShowBanner }) {
  if (!showBanner) return null;

  return (
    <Banner
      title="Regarding product price syncing"
      // action={{content: 'Request a feature', url: '#'}}
      onDismiss={() => setShowBanner(false)}
    >
      <p>Once product is added to bundle chaning original prouct price will not have any effect in bundle price.</p>
    </Banner>
  );
}
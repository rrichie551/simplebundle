import React, { useState, useCallback, useEffect } from 'react';
import { Banner } from "@shopify/polaris";
import { SupportModal } from "./SupportModal";
import { useFetcher } from "@remix-run/react";

export function RequestFeature({ showBanner, setShowBanner }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [shouldResetForm, setShouldResetForm] = useState(false);
  const fetcher = useFetcher();

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setShouldResetForm(true);
  }, []);

  const handleSubmit = useCallback((formData) => {
    setIsSubmitting(true);
    formData.append('action', 'submitSupportRequest');
    fetcher.submit(formData, { method: 'post' });
  }, [fetcher]);

  useEffect(() => {
    if (fetcher.data) {
      setIsSubmitting(false);
      if (fetcher.data.success) {
        handleCloseModal();
      } else {
        setFormErrors({ submit: fetcher.data.error || 'Failed to submit. Please try again.' });
      }
    }
  }, [fetcher.data, handleCloseModal]);

  if (!showBanner) return null;

  return (
    <>
      <Banner
        title="We prioritize new features based on user feedback. Your input shapes our roadmap!"
        action={{content: 'Request Feature', onAction: handleOpenModal}}
        onDismiss={() => setShowBanner(false)}
      >
        <p>Have a feature request or need support? We're here to listen and help!</p>
      </Banner>
      <SupportModal 
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        formErrors={formErrors}
        shouldResetForm={shouldResetForm}
      />
    </>
  );
}

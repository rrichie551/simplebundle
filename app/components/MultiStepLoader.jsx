import React, { useState, useEffect } from 'react';
import { Modal, Text, BlockStack, ProgressBar, Spinner, Icon, Box } from '@shopify/polaris';
import { CheckCircleIcon } from '@shopify/polaris-icons';
const steps = [
  'Creating bundle',
  'Adding media',
  'Setting up prices',
  'Adding some magic',
  'Finalizing bundle'
];
const MultiStepLoader = ({ isLoading, bundleCreated }) => {
  const [currentStep, setCurrentStep] = useState(0);
  useEffect(() => {
    if (isLoading && !bundleCreated) {
      const interval = setInterval(() => {
        setCurrentStep((prevStep) => {
          if (prevStep === steps.length - 1) {
            clearInterval(interval);
            return prevStep;
          }
          return prevStep + 1;
        });
      }, 1500);
      return () => clearInterval(interval);
    } else {
      setCurrentStep(0);
    }
  }, [isLoading, bundleCreated]);
  const progress = bundleCreated ? 100 : ((currentStep + 1) / steps.length) * 100;
  return (
    <>
      <style>
        {`
          .Polaris-Modal-Dialog__Modal .Polaris-Modal-CloseButton,
          .Polaris-Modal-Dialog__Modal .Polaris-Button--iconOnly {
            display: none !important;
          }
          .icon-container .Polaris-Icon {
            width: 80px !important;
            height: 80px !important;
          }
          .icon-container .Polaris-Icon svg {
            width: 100%;
            height: 100%;
          }
        `}
      </style>
      <Modal
        open={isLoading || bundleCreated}
        title=""
        onClose={() => {}}
        noScroll
      >
        <Modal.Section>
          <BlockStack gap="400" align="center">
            <Box width="100%" paddingBlockEnd="400">
              <ProgressBar progress={progress} size="small" tone="primary" />
            </Box>
            <BlockStack vertical alignment="center" distribution="center">
              <div className="icon-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80px' }}>
                {bundleCreated ? (
                  <Icon source={CheckCircleIcon} color="success" />
                ) : (
                  <Spinner accessibilityLabel="Loading" size="large" />
                )}
              </div>
              <Text variant="headingMd" as="h3" alignment="center">
                {bundleCreated ? 'Bundle created, redirecting...' : steps[currentStep]}
              </Text>
              {!bundleCreated && (
                <Text variant="bodySm" as="p" alignment="center">
                  {`Step ${currentStep + 1} of ${steps.length}`}
                </Text>
              )}
            </BlockStack>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
};
export default MultiStepLoader;
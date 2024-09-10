import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  TextField,
  Form,
  BlockStack,
  Spinner,
  ChoiceList
} from '@shopify/polaris';

export function SupportModal({ open, onClose, onSubmit, isSubmitting, formErrors, shouldResetForm }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [requestType, setRequestType] = useState(['feature_request']);

  useEffect(() => {
    if (shouldResetForm) {
      setEmail('');
      setMessage('');
      setEmailError('');
      setRequestType(['feature_request']);
    }
  }, [shouldResetForm]);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = useCallback((value) => {
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  }, []);

  const handleSubmit = () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    const formData = new FormData();
    formData.append('email', email);
    formData.append('message', message);
    formData.append('requestType', requestType[0]);
    onSubmit(formData);
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setEmailError('');
    setRequestType(['feature_request']);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Contact Support"
      primaryAction={{
        content: isSubmitting ? <Spinner size="small" /> : 'Submit',
        onAction: handleSubmit,
        disabled: isSubmitting || !!emailError,
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: handleClose,
          disabled: isSubmitting,
        },
      ]}
    >
      <Modal.Section>
        <Form onSubmit={handleSubmit}>
          <BlockStack gap="400">
            <ChoiceList
              title="Request type"
              choices={[
                {label: 'Feature Request', value: 'feature_request'},
                {label: 'Support', value: 'support'},
              ]}
              selected={requestType}
              onChange={setRequestType}
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              autoComplete="email"
              error={emailError || formErrors?.email}
              placeholder="your.email@example.com"
              disabled={isSubmitting}
              required
            />
            <TextField
              label="Message"
              value={message}
              onChange={setMessage}
              multiline={4}
              autoComplete="off"
              error={formErrors?.message}
              placeholder={requestType[0] === 'feature_request' ? "Describe the feature you'd like to see..." : "How can we help you today?"}
              disabled={isSubmitting}
              required
            />
          </BlockStack>
        </Form>
      </Modal.Section>
    </Modal>
  );
}

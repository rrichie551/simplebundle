import React from 'react';
import {
  Page,
  Layout,
  Card,
  Text,
  Button, 
  BlockStack,
  InlineStack,
  Icon,
  Box,
  Link,
} from '@shopify/polaris';
import { CheckIcon, ExternalIcon } from '@shopify/polaris-icons';
import { Form } from '@remix-run/react';
export default function Onboarding() {
  const features = [
    'Increase Average Order Value',
    'Boost conversion rates',
    'Easy customization',
    'Performance optimized',
    'Smart bundle recommendations',
    'Detailed analytics'
  ];
  const quickStartSteps = [
    { text: 'Create Your First Bundle', url: 'https://www.youtube.com/watch?v=ot0m0MN8eI8' },
    { text: 'Set Pricing Strategy', url: 'https://www.youtube.com/watch?v=WilM3zxng2A' },
    { text: 'Design Bundle Display', url: 'https://www.youtube.com/watch?v=l9XjGqqlp8k&t=2s' },
    { text: 'Edit Your Bundle', url: 'https://www.youtube.com/watch?v=UpzjZwsvCNc' },
  ];
  const helpfulLinks = [
    { text: 'Bundle Creation Guide', url: 'https://www.youtube.com/watch?v=ot0m0MN8eI8' },
    { text: 'Best Practices', url: 'https://www.simpleplanmedia.com/faq/' },
    { text: 'FAQs', url: 'https://www.simpleplanmedia.com/faq/' },
    { text: 'Video Tutorials', url: 'https://www.youtube.com/@SimpleBundle' }
  ];
  return (
    <Page title="Welcome to SimpleBundle">
      <BlockStack gap="800">
        <Layout>
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingXl" as="h2">Get Started with SimpleBundle</Text>
                <Text variant="bodyMd">Supercharge your sales with our intelligent product bundling solution. Here's how to get started:</Text>
                
                <Box paddingBlockStart="400">
                  <BlockStack gap="300">
                  <Text variant="headingSm" as="h3">Quick Start Guide:</Text>
                  <BlockStack gap="300">
                    {quickStartSteps.map((step, index) => (
                      <InlineStack gap="300" align="start" blockAlign="start" key={step.text}>
                        <div style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--p-color-bg-success-strong)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <Text variant="bodyMd" as="span" fontWeight="semibold" tone="success">
                            {index + 1}
                          </Text>
                        </div>
                        <Link target='blank' url={step.url}>
                          {step.text}
                        </Link>
                      </InlineStack>
                    ))}
                  </BlockStack>
                  </BlockStack>
                </Box>
                <Box paddingBlockStart="400">
                  <Form method="post">
                    <input type="hidden" name="action" value="updateOnboarding" />
                    <Button variant='primary' submit>
                      Create your first bundle
                    </Button>
                  </Form>
                </Box>
                
                <Box paddingBlockStart="400" >
                  <BlockStack gap="300">
                  <Text variant="headingSm" as="h3">Key Features:</Text>
                  <BlockStack gap="300">
                    {features.map((feature) => (
                      <InlineStack gap="300" align="start" blockAlign="start" key={feature}>
                        <div style={{ flexShrink: 0 }}>
                          <Icon source={CheckIcon} tone="success" />
                        </div>
                        <Text variant="bodyMd" as="span">
                          {feature}
                        </Text>
                      </InlineStack>
                    ))}
                  </BlockStack>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingLg" as="h3">Helpful Resources</Text>
                <BlockStack gap="300">
                  {helpfulLinks.map((link) => (
                    <InlineStack key={link.url} gap="300" align="start" blockAlign="start">
                      <div style={{ flexShrink: 0 }}>
                        <Icon source={ExternalIcon} />
                      </div>
                      <Link target='blank' url={link.url} external>
                        {link.text}
                      </Link>
                    </InlineStack>
                  ))}
                </BlockStack>
                <Box paddingBlockStart="400">
                  <Text variant="headingSm">Need Help?</Text>
                  <Text variant="bodyMd">Our support team is here for you. Reach out via email at simplebundleapp@gmail.com or use the in-app chat for quick assistance.</Text>
                </Box>
              </BlockStack>
            </Card>
{/*             <Box paddingBlockStart="400">
              <Card>
                <img
                  src="/api/placeholder/600/400"
                  alt="SimpleBundle app showcase"
                  style={{ width: '100%', height: 'auto' }}
                />
              </Card>
            </Box> */}
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

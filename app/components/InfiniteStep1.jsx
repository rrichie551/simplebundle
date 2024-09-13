import {
    BlockStack,
    TextField,
    Form,
    Card,
    Text,
    Select
  } from "@shopify/polaris";

export default function InfiniteStep1({ formData, handleChange, errors}) {
  return (
    <Card>
       <BlockStack gap="500">
      <Text variant="heading2xl" as="h2">
              Create Bundle
        </Text>
      <Text>
              Increase Average Order Value by bundling products together.
       </Text>
    <Form method="post">
      <BlockStack gap="500">
        <TextField
          label="Bundle Name"
          value={formData.bundleName}
          onChange={handleChange("bundleName")}
          autoComplete="off"
          error={errors.bundleName}
          placeholder="e.g., 'Summer Essentials Kit'"
        />
        <Select
          label="Bundle Status"
          options={[
            { label: "Active", value: "active" },
            { label: "Draft", value: "draft" }
          ]}
          value={formData.status || ""}
          onChange={handleChange("status")}
        />
      </BlockStack>
    </Form>
  </BlockStack>
  </Card>
  )
}

export const UPDATE_PRODUCT_BUNDLE_MUTATION = `
mutation productBundleUpdate($input: ProductBundleUpdateInput!) {
  productBundleUpdate(input: $input) {
    productBundleOperation {
      id
      product {
        id
      }
      __typename
    }
    userErrors {
      message
      __typename
    }
    __typename
  }
}
`;
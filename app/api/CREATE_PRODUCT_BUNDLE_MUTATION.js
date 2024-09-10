export const CREATE_PRODUCT_BUNDLE_MUTATION = `
  mutation ProductBundleCreate($input: ProductBundleCreateInput!) {
    productBundleCreate(input: $input) {
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
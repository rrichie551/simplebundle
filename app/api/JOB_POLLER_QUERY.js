export const JOB_POLLER_QUERY = `
  query JobPoller($jobId: ID!, $componentLimit: Int = 50) {
    productOperation(id: $jobId) {
      ... on ProductBundleOperation {
        id
        status
        product {
          ...ProductFragment
          bundleComponents(first: $componentLimit) {
            edges {
              node {
                ...ProductComponentFragment
                __typename
              }
              __typename
            }
            __typename
          }
          __typename
        }
        userErrors {
          field
          message
          code
          __typename
        }
        __typename
      }
      __typename
    }
  }
  
  fragment ProductFragment on Product {
    id
    title
    handle
    featuredImage {
      id
      url: url(transform: {maxWidth: 80, maxHeight: 80})
      altText
      __typename
    }
    options(first: 3) {
      id
      name
      values
      __typename
    }
    hasOnlyDefaultVariant
    variants(first: 250) {
      edges {
        node {
          id
          price
          compareAtPrice
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
  
  fragment ProductComponentFragment on ProductBundleComponent {
    componentProduct {
      ...ProductFragment
      __typename
    }
    optionSelections {
      componentOption {
        id
        name
        __typename
      }
      parentOption {
        id
        name
        __typename
      }
      values {
        selectionStatus
        value
        __typename
      }
      __typename
    }
    quantity
    quantityOption {
      name
      parentOption {
        id
        __typename
      }
      values {
        name
        quantity
        __typename
      }
      __typename
    }
    __typename
  }
  `;
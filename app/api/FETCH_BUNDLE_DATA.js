export const FETCH_BUNDLE_DATA = `
    query BundleProductsOwnedByAppQuery($query: String, $first: Int, $last: Int, $before: String, $after: String) {
        products(
          first: $first
          last: $last
          before: $before
          after: $after
          sortKey: CREATED_AT
          query: $query
        ) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            endCursor
            startCursor
            __typename
          }
          edges {
            node {
              id
              title
              handle
              priceRangeV2 {
                maxVariantPrice {
                  amount
                  currencyCode
                  __typename
                }
                minVariantPrice {
                  amount
                  currencyCode
                  __typename
                }
                __typename
              }
              featuredImage {
                id
                url
                altText
                __typename
              }
              vendor
              totalInventory
              status
              onlineStorePreviewUrl
              hasOnlyDefaultVariant
              category{
                id
                fullName
                __typename
              }
              __typename
            }
            __typename
          }
          __typename
        }
      }
    `;
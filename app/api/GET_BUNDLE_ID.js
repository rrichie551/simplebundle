export const GET_BUNDLE_PRODUCT_ID = ` 
    query AppPublicationId($handleOrKey: String!) {
        appByHandle: appByHandle(handle: $handleOrKey) {
          ...Publication
          __typename
        }
        appByKey: appByKey(apiKey: $handleOrKey) {
          ...Publication
          __typename
        }
      }
      
      fragment Publication on App {
        id
        installation {
          id
          publication {
            id
            __typename
          }
          __typename
        }
        __typename
      }
      `;
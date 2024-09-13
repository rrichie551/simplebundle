export const CREATE_PRODUCT_STATUS = `#graphql
mutation CreateProductWithStatus ($input: ProductInput!){
          productCreate(input: $input) {
             userErrors {
                field
                message
             }
             product {
              id
              status
             }
          }
        }`
export const FETCH_SHOP_INFO = `
query {
  shop {
    name
    allProductCategoriesList{
      id
      fullName
    }
    myshopifyDomain
    url
    features{
      bundles{
        eligibleForBundles
      }
    }
    productTags(first:250){
    edges {
        node 
        }
     }
     productTypes(first:250){
      edges {
          node 
          }
       }
    resourceLimits {
      maxProductVariants
    }
    currencyCode
  }
}
`;
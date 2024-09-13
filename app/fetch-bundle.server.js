import { authenticate } from "./shopify.server";
import { GET_BUNDLE_PRODUCT_ID } from "./api/GET_BUNDLE_ID";
import { FETCH_BUNDLE_DATA } from "./api/FETCH_BUNDLE_DATA";
import { handleGraphQLResponse } from "./utils/sharedUtils";
export async function fetchBundle(request) {
  const { admin } = await authenticate.admin(request);
  try {
    const bundleProductIdResponse = await admin.graphql(GET_BUNDLE_PRODUCT_ID, {
      variables: {
        "handleOrKey": "bundleapp-v5"
      }
    });
    const bundleProductIdData = await handleGraphQLResponse(bundleProductIdResponse, "Error fetching bundle product ID");
    const id = bundleProductIdData.appByHandle.id.split('/').pop();
    const bundleDataResponse = await admin.graphql(FETCH_BUNDLE_DATA, {
      variables: {
        "first": 100,
        "last": null,
        "before": null,
        "after": null,
        "query": `product_configuration_owner:${id}`
      }
    });
    const bundleData = await handleGraphQLResponse(bundleDataResponse, "Error fetching bundle data");
    
    return {
      success: true,
      message: "Bundle data fetched successfully",
      data: bundleData
    };
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return {
      success: false,
      message: error.message || "An error occurred while fetching the bundle",
      error: error
    };
  }
}
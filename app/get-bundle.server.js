import { authenticate } from "./shopify.server";
import { FETCH_BUNDLE_QUERY } from './api/FETCH_BUNDLE';
import { handleGraphQLResponse } from "./utils/sharedUtils";
import prisma from "./db.server";

export async function getBundle(request, bundleId) {
  const { admin } = await authenticate.admin(request);

  try {
    const fetchBundleResponse = await admin.graphql(FETCH_BUNDLE_QUERY, {
      variables: {
        id: `gid://shopify/Product/${bundleId}`,
        componentLimit: 50
      }
    });


    const bundleData = await handleGraphQLResponse(fetchBundleResponse, "Error fetching bundle");

    // Fetch only the specific bundle for the current session
    const bundle = await prisma.bundle.findFirst({
      where: {
        ProductBundleId: `gid://shopify/Product/${bundleId}`,
      }
    });

    if (bundle) {
      bundleData.idInDb = bundle.id;
      bundleData.discountType = bundle.discountType;
      bundleData.discountValue = bundle.discountValue;
    }

    return {
      success: true,
      message: "Bundle fetched successfully",
      data: bundleData
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "An error occurred while fetching the bundle",
      error: error
    };
  }
}
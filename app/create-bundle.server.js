import { authenticate } from "./shopify.server";
import prisma from "./db.server";
import { CREATE_PRODUCT_BUNDLE_MUTATION } from "./api/CREATE_PRODUCT_BUNDLE_MUTATION";
import { JOB_POLLER_QUERY } from "./api/JOB_POLLER_QUERY";
import { UPDATE_PRODUCT_MUTATION } from "./api/UPDATE_PRODUCT_MUTATION";
import { PRODUCT_VARIANTS_BULK_UPDATE_MUTATION } from "./api/PRODUCT_VARIANTS_BULK_UPDATE_MUTATION";
import { PRODUCT_CREATE_MEDIA } from "./api/PRODUCT_CREATE_MEDIA";
import { STAGED_UPLOADS_CREATE_MUTATION } from "./api/STAGED_UPLOADS_CREATE_MUTATION";
import { calculateDiscountedPrice, getMediaContentType, pollJobStatus, handleGraphQLResponse } from "./utils/sharedUtils";

// Main function
export async function createBundle(request, formData) {
  const { admin, session } = await authenticate.admin(request);
  const bundleData = JSON.parse(formData.get('formData'));

  try {
    // Create the product bundle in Shopify first
    const productBundleData = await createProductBundle(admin, bundleData);
    const pollData = await pollJobStatus(admin, productBundleData.jobId, {
      jobPollerQuery: JOB_POLLER_QUERY,
      onComplete: (operation) => operation,
    });

    if (!pollData.product || !pollData.product.id) {
      throw new Error("Failed to create product bundle in Shopify");
    }

    const productId = pollData.product.id;
    const productHandle = pollData.product.handle;

    // Now create the bundle in the database
    const createdBundle = await createBundleInDatabase(bundleData, session.id, productId, productHandle);

    const { uploadedFiles, productImages } = separateMediaFiles(bundleData.media, formData);

    if (uploadedFiles.length > 0 || productImages.length > 0) {
      const stagedTargets = await createStagedUploads(admin, uploadedFiles);
      await uploadFilesToStagedTargets(stagedTargets, uploadedFiles);
      await createProductMedia(admin, productId, stagedTargets, uploadedFiles, productImages);
    }

    await updateProductDetails(admin, productId, bundleData);
    await updateVariantPrices(admin, productId, bundleData, pollData, createdBundle.id);

    return {
      success: true,
      message: `Bundle ${bundleData.status === 'draft' ? 'saved as draft' : 'published'} successfully`,
      productId: productId,
    };
  } catch (error) {
    console.error("Error creating bundle:", error);
    throw error;
  }
}

async function createBundleInDatabase(bundleData, userId, productId, productHandle) {
  const offerData = {
    ProductBundleId: productId,
    ProductHandle: productHandle,
    bundleName: bundleData.bundleName,
    description: bundleData.description,
    discountType: bundleData.noDiscount ? null : bundleData.discountType,
    discountValue: bundleData.noDiscount ? null : bundleData.discountValue,
    products: bundleData.products,
    bundleType:"fixed",
    userId: userId,
  };
  
  return await prisma.bundle.create({ data: offerData });
}

async function createProductBundle(admin, bundleData) {
  const response = await admin.graphql(CREATE_PRODUCT_BUNDLE_MUTATION, {
    variables: {
      input: {
        title: bundleData.bundleName,
        components: bundleData.products.map((product) => ({
          quantity: product.quantity,
          productId: product.id,
          optionSelections: product.options.map((option) => ({
            componentOptionId: option.id,
            name: `${product.title} ${option.name}`,
            values: option.values
          }))
        }))
      }
    }
  });

  const data = await handleGraphQLResponse(response, "Error creating product bundle");
  
  if (!data.productBundleCreate || !data.productBundleCreate.productBundleOperation) {
    throw new Error("Unexpected response structure from productBundleCreate mutation");
  }

  return {
    jobId: data.productBundleCreate.productBundleOperation.id
  };
}

function separateMediaFiles(mediaData, formData) {
  const uploadedFiles = [];
  const productImages = [];

  mediaData.forEach((media, index) => {
    if (media.isProductImage) {
      productImages.push(media);
    } else {
      const file = formData.get(`media_${index}`);
      if (file) {
        uploadedFiles.push({ media, file });
      } else {
        console.warn(`File not found for media: ${media.name}`);
      }
    }
  });

  return { uploadedFiles, productImages };
}

async function createStagedUploads(admin, uploadedFiles) {
  const stagedUploadsInput = uploadedFiles.map(({ media }) => ({
    filename: media.name,
    mimeType: media.type,
    httpMethod: "POST",
    fileSize: `${media.size}`,
    resource: getMediaContentType(media.type)
  }));
  
  const response = await admin.graphql(STAGED_UPLOADS_CREATE_MUTATION, {
    variables: { input: stagedUploadsInput }
  });

  const data = await handleGraphQLResponse(response, "Error creating staged uploads");
  return data.stagedUploadsCreate.stagedTargets;
}

async function uploadFilesToStagedTargets(stagedTargets, uploadedFiles) {
  for (let i = 0; i < uploadedFiles.length; i++) {
    const { file } = uploadedFiles[i];
    const target = stagedTargets[i];
    
    const uploadFormData = new FormData();
    target.parameters.forEach(param => {
      uploadFormData.append(param.name, param.value);
    });
    uploadFormData.append('file', file);
    
    const response = await fetch(target.url, {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
}

async function createProductMedia(admin, productId, stagedTargets, uploadedFiles, productImages) {
  const mediaCreateInput = [
    ...stagedTargets.map((target, index) => ({
      mediaContentType: getMediaContentType(uploadedFiles[index].media.type),
      originalSource: target.resourceUrl,
      alt: uploadedFiles[index].media.altText || '',
    })),
    ...productImages.map(media => ({
      mediaContentType: 'IMAGE',
      originalSource: media.src,
      alt: media.altText || '',
    }))
  ];

  const response = await admin.graphql(PRODUCT_CREATE_MEDIA, {
    variables: {
      productId: productId,
      media: mediaCreateInput
    }
  });

  await handleGraphQLResponse(response, "Error creating product media");
}

async function updateProductDetails(admin, productId, bundleData) {
  const response = await admin.graphql(UPDATE_PRODUCT_MUTATION, {
    variables: {
      input: {
        id: productId,
        descriptionHtml: bundleData.description,
        collectionsToJoin: bundleData.collectionsToJoin.map(collection => collection.id),
        status: bundleData.status.toUpperCase(),
        tags: bundleData.productTags,
        productType: bundleData.productType
      }
    }
  });

  await handleGraphQLResponse(response, "Error updating product details");
}

async function updateVariantPrices(admin, productId, bundleData, pollData, bundleId) {
  const variants = pollData.product.variants.edges.map(edge => edge.node);
  const updatedVariants = variants.map(variant => {
    const basePrice = parseFloat(variant.price);
    const noDiscount = bundleData.noDiscount || (!bundleData.discountType && !bundleData.discountValue);
    return {
      id: variant.id,
      compareAtPrice: basePrice.toFixed(2),
      price: noDiscount
        ? basePrice.toFixed(2)
        : calculateDiscountedPrice(
            basePrice,
            bundleData.discountType,
            parseFloat(bundleData.discountValue)
          ).toFixed(2)
    };
  });

  const response = await admin.graphql(PRODUCT_VARIANTS_BULK_UPDATE_MUTATION, {
    variables: {
      productId: productId,
      variants: updatedVariants
    }
  });

  const result = await response.json();

  if (result.data.productVariantsBulkUpdate.userErrors.length > 0) {
    console.error('Error updating variant prices:', JSON.stringify(result.data.productVariantsBulkUpdate.userErrors));
    throw new Error("Error updating variant prices: " + JSON.stringify(result.data.productVariantsBulkUpdate.userErrors));
  }

  updateVariantsInDatabase(bundleId, updatedVariants);

  return result.data.productVariantsBulkUpdate;
}

async function updateVariantsInDatabase(bundleId, variants) {
  await prisma.bundle.update({
    where: { id: bundleId },
    data: {
      variants: variants
    }
  });
}

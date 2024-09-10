export function calculateDiscountedPrice(originalPrice, discountType, discountValue) {
  if (discountType === 'percentage') {
    return originalPrice * (1 - discountValue / 100);
  } else if (discountType === 'fixed') {
    return Math.max(0, originalPrice - discountValue);
  }
  return originalPrice;
}

export function getMediaContentType(mimeType) {
  const mimeTypeMap = {
    'image/jpeg': 'IMAGE',
    'image/png': 'IMAGE',
    'image/gif': 'IMAGE',
    'image/webp': 'IMAGE',
    'image/svg+xml': 'IMAGE',
    'video/mp4': 'VIDEO',
    'video/webm': 'VIDEO',
    'video/ogg': 'VIDEO',
    'model/gltf-binary': 'MODEL_3D',
    'model/gltf+json': 'MODEL_3D'
  };

  return mimeTypeMap[mimeType] || 'IMAGE';
}

export async function pollJobStatus(admin, jobId, options = {}) {
  const {
    timeout = 20000,
    pollInterval = 1000,
    componentLimit = 50,
    onComplete,
    onFailed
  } = options;

  const startTime = Date.now();

  while (true) {
    try {
      const response = await admin.graphql(options.jobPollerQuery, {
        variables: {
          componentLimit,
          jobId
        }
      });

      const data = await response.json();
      const status = data.data.productOperation.status;

      if (status === 'COMPLETE') {
        return onComplete ? onComplete(data.data.productOperation) : data.data.productOperation;
      } else if (status === 'FAILED') {
        const error = new Error('Job failed: ' + JSON.stringify(data.data.productOperation.userErrors));
        if (onFailed) {
          onFailed(error);
        } else {
          throw error;
        }
      }

      if (Date.now() - startTime > timeout) {
        throw new Error(`Job timed out after ${timeout / 1000} seconds`);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error("Error polling job status:", error);
      throw error;
    }
  }
}

export async function handleGraphQLResponse(response, errorMessage) {
  const result = await response.json();
  const data = result.data;
  const operation = Object.keys(data)[0];
  const errors = data[operation].userErrors;

  if (errors && errors.length > 0) {
    throw new Error(`${errorMessage}: ${JSON.stringify(errors)}`);
  }

  return data;
}
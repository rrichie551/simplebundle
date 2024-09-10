export const PRODUCT_CREATE_MEDIA = `
mutation ProductCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
  productCreateMedia(productId: $productId, media: $media) {
    media {
      ... on Media {
        mediaContentType
        __typename
      }
      ...MediaFragment
      __typename
    }
    mediaUserErrors {
      field
      message
      __typename
    }
    __typename
  }
}

fragment MediaFragment on File {
  id
  alt
  status: fileStatus
  mediaErrors: fileErrors {
    message
    code
    __typename
  }
  preview {
    status
    image {
      id
      transformedSrc: url(transform: {maxWidth: 200, maxHeight: 200})
      originalSrc: url
      width
      height
      __typename
    }
    __typename
  }
  ... on MediaImage {
    mimeType
    image {
      id
      originalSrc: url
      width
      height
      __typename
    }
    __typename
  }
  ... on ExternalVideo {
    embeddedUrl
    __typename
  }
  ... on Video {
    filename
    sources {
      height
      mimeType
      url
      width
      __typename
    }
    __typename
  }
  ... on Model3d {
    filename
    originalSource {
      url
      format
      mimeType
      filesize
      __typename
    }
    sources {
      format
      url
      filesize
      __typename
    }
    boundingBox {
      size {
        x
        y
        z
        __typename
      }
      __typename
    }
    __typename
  }
  __typename
}
`;
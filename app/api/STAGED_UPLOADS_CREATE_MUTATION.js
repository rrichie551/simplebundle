export const STAGED_UPLOADS_CREATE_MUTATION = `
mutation UploadStagedMedia($input: [StagedUploadInput!]!) {
  stagedUploadsCreate(input: $input) {
    stagedTargets {
      url
      resourceUrl
      parameters {
        name
        value
        __typename
      }
      __typename
    }
    userErrors {
      field
      message
      __typename
    }
    __typename
  }
}
`;
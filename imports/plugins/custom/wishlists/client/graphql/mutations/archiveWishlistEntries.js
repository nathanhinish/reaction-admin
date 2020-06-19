import gql from "graphql-tag";

export default gql`
  mutation archiveWishlistVariants($input: ArchiveWishlistVariantsInput!) {
    archiveWishlistVariants(input: $input) {
      variants {
        _id
      }
    }
  }
`;

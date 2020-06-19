import gql from "graphql-tag";

export default gql`
  mutation archiveWishlists($input: ArchiveWishlistsInput!) {
    archiveWishlists(input: $input) {
      wishlists {
        _id
      }
    }
  }
`;

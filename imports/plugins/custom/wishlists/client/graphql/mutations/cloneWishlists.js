import gql from "graphql-tag";

export default gql`
  mutation cloneWishlists($input: CloneWishlistsInput!) {
    cloneWishlists(input: $input) {
      wishlists {
        _id
      }
    }
  }
`;

import gql from "graphql-tag";

export default gql`
  mutation createWishlist($input: CreateWishlistInput!) {
    createWishlist(input: $input) {
      wishlist {
        _id
      }
    }
  }
`;

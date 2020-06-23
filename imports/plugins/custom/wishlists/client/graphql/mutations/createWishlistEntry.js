import gql from "graphql-tag";
import WishlistEntry from '../fragments/wishlistEntry';

export default gql`
  mutation createWishlist($input: CreateWishlistEntryInput!) {
    createWishlistEntry(input: $input) {
      wishlist {
        _id
      }
      ...WishlistEntry
    }
  }
`;

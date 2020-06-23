import gql from "graphql-tag";
import Wishlist from "../fragments/wishlistWithEntries";

export default gql`
  query wishlist($wishlistId: ID!) {
    wishlist(wishlistId: $wishlistId) {
      ...Wishlist
    }
  }
  ${Wishlist}
`;

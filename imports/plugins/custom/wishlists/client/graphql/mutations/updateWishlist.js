import gql from "graphql-tag";
import Wishlist from "../fragments/wishlistWithEntries";

export default gql`
  mutation updateWishlist($input: UpdateWishlistInput!){
    updateWishlist(input: $input){
      wishlist {
        ...Wishlist
      }
    }
  }
  ${Wishlist}
`;

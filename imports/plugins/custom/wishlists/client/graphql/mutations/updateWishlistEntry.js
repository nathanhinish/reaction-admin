import gql from "graphql-tag";
import Wishlist from "../fragments/wishlistWithEntries";

export default gql`
  mutation updateWishlistEntry($input: UpdateWishlistEntryInput!){
    updateWishlistEntry(input: $input){
      wishlist {
        ...Wishlist
      }
    }
  }
  ${Wishlist}
`;

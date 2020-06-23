import gql from "graphql-tag";
import WishlistEntry from "./wishlistEntry";

export default gql`
  fragment Wishlist on Wishlist {
    _id
    isArchived
    name
    permalink
    description
    isVisible
    createdAt
    updatedAt
    isArchived
    entries {
      ...WishlistEntry
    }
  }
  ${WishlistEntry}
`;

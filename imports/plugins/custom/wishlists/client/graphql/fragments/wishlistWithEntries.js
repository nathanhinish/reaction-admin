import gql from "graphql-tag";
import WishlistEntry from "./wishlistEntry";

export default gql`
  fragment Product on Product {
    _id
    name
    isDeleted
    entries {
      ...WishlistEntry
    }
  }
  ${WishlistEntry}
`;

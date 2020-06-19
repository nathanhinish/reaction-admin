import gql from "graphql-tag";

export default gql`
  fragment WishlistEntry on WishlistEntry {
    _id
    product {
      _id
    }
  }
`;


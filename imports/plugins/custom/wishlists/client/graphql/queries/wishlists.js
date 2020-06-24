import gql from "graphql-tag";

export default gql`
  query wishlists($wishlistIds: [ID], $query: String, $first: ConnectionLimitInt, $offset: Int) {
    wishlists(wishlistIds: $wishlistIds, query: $query, first: $first, offset: $offset) {
      nodes {
        _id
        name
        createdAt
      }
      pageInfo {
        hasNextPage
      }
      totalCount
    }
}
`;

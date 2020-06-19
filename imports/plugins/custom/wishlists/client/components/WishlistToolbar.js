import React from "react";
import { useHistory } from "react-router-dom";
import i18next from "i18next";
import { Typography, Box } from "@material-ui/core";
import { Button } from "@reactioncommerce/catalyst";
import PrimaryAppBar from "/imports/client/ui/components/PrimaryAppBar";
// import useWishlist from "../hooks/useWishlist";

/**
 * WishlistHeader layout component
 * @returns {Node} React node
 */
function WishlistToolbar() {
  // const { wishlist, onPublishWishlist } = useWishlist();
  const wishlist = {};
  const onPublishWishlist = () => {};
  const history = useHistory();

  if (!wishlist) {
    return null;
  }

  const currentWishlistHash = wishlist.currentWishlistHash || null;
  const publishedWishlistHash = wishlist.publishedWishlistHash || null;
  const isPublished = currentWishlistHash === publishedWishlistHash;

  return (
    <PrimaryAppBar
      title={"Wishlists"}
      onBackButtonClick={() => {
        history.push("/wishlists");
      }}
    >
      <Box display="flex" alignItems="center">
        {currentWishlistHash !== publishedWishlistHash &&
          <Box paddingRight={2}>
            <Typography>{"Wishlist has unpublished changes"}</Typography>
          </Box>
        }
        <Button
          color="primary"
          variant="contained"
          disabled={isPublished}
          onClick={onPublishWishlist}
        >
          {i18next.t(isPublished ? "wishlistDetailEdit.published" : "wishlistDetailEdit.publish")}
        </Button>
      </Box>
    </PrimaryAppBar>
  );
}

export default WishlistToolbar;

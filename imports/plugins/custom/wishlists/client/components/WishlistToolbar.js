import React from "react";
import { useHistory } from "react-router-dom";
import PrimaryAppBar from "/imports/client/ui/components/PrimaryAppBar";

/**
 * WishlistHeader layout component
 * @returns {Node} React node
 */
function WishlistToolbar() {
  const history = useHistory();

  return <PrimaryAppBar title={"Wishlists"} onBackButtonClick={() => history.push("/wishlists")} />;
}

export default WishlistToolbar;

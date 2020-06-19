import React from "react";
import ViewListIcon from "mdi-material-ui/ViewList";
import { registerOperatorRoute } from "/imports/client/ui";

import WishlistsTable from "./components/WishlistsTable";
import WisthlistDetailLayout from "./layouts/WishlistDetail";
import ContentViewExtraWideLayout from "/imports/client/ui/layouts/ContentViewExtraWideLayout";

registerOperatorRoute({
  LayoutComponent: null,

  // eslint-disable-next-line react/display-name, react/no-multi-comp
  MainComponent: () => <div>Wishlist Details</div>,
  // MainComponent: WisthlistDetailLayout,
  path: "/wishlists/:handle"
});

registerOperatorRoute({
  group: "navigation",
  priority: 20,
  LayoutComponent: ContentViewExtraWideLayout,
  path: "/wishlists",
  MainComponent: WishlistsTable,
  // eslint-disable-next-line react/display-name, react/no-multi-comp
  SidebarIconComponent: (props) => <ViewListIcon {...props} />,
  sidebarI18nLabel: "admin.dashboard.wishlistsLabel"
});

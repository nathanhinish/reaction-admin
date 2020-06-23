import ViewListIcon from "mdi-material-ui/ViewList";
import React from "react";
import WishlistsTable from "./components/WishlistsTable/index.js";
import WishlistDetailsLayout from "./layouts/WishlistDetails";
import { registerOperatorRoute } from "/imports/client/ui";
import ContentViewExtraWideLayout from "/imports/client/ui/layouts/ContentViewExtraWideLayout";

import "./blocks";

registerOperatorRoute({
  LayoutComponent: null,

  // eslint-disable-next-line react/display-name, react/no-multi-comp
  MainComponent: WishlistDetailsLayout,
  path: "/wishlists/:handle",
});

registerOperatorRoute({
  group: "navigation",
  priority: 20,
  LayoutComponent: ContentViewExtraWideLayout,
  path: "/wishlists",
  MainComponent: WishlistsTable,
  // eslint-disable-next-line react/display-name, react/no-multi-comp
  SidebarIconComponent: (props) => <ViewListIcon {...props} />,
  sidebarI18nLabel: "admin.dashboard.wishlistsLabel",
});

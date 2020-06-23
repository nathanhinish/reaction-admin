import React from "react";
import ViewListIcon from "mdi-material-ui/ViewList";
import { registerOperatorRoute } from "/imports/client/ui";

import WishlistsTable from "./components/WishlistsTable/index.js";
import WishlistDetailsLayout from "./layouts/WishlistDetails";
import ContentViewExtraWideLayout from "/imports/client/ui/layouts/ContentViewExtraWideLayout";
import { registerBlock } from "../../../core/components/lib/index.js";

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

registerBlock({
  name: "WishlistSettingsMain",
  region: "WishlistDetailMain",
  component: () => <div>yo</div>,
  priority: 1,
});

registerBlock({
  name: "GeneralForm",
  region: "WishlistDetailMain",
  component: () => (
    <Grid container spacing={3}>
      <Grid item sm={12}>
        <Card className={classes.card}>
          <CardHeader classes={{ root: classes.cardHeader }} title={cardTitle} />
          <CardContent>test</CardContent>
        </Card>
      </Grid>
    </Grid>
  ),
});

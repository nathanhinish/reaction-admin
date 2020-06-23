import { Card, CardContent, CardHeader, Container, Grid } from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import { Blocks } from "@reactioncommerce/reaction-components";
import PropTypes from "prop-types";
import React from "react";
import { Route, Switch } from "react-router-dom";
import WishlistToolbar from "../components/WishlistToolbar";
import ContentViewExtraWideLayout from "/imports/client/ui/layouts/ContentViewExtraWideLayout";

const styles = (theme) => ({
  block: {
    marginBottom: theme.spacing(3),
  },
  sidebar: {
    flex: "1 1 auto",
    maxWidth: 330,
    height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
    overflowY: "auto",
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  content: {
    flex: "1 1 auto",
    height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px)`,
    overflowY: "auto",
    paddingTop: theme.spacing(5),
  },
  card: {
    overflow: "visible",
  },
  cardHeader: {
    paddingBottom: 0,
  },
});

/**
 * WishlistDetail layout component
 * @param {Object} props Component props
 * @returns {Node} React node
 */
function WishlistDetail(props) {
  const { classes, ...blockProps } = props;

  return (
    <ContentViewExtraWideLayout>
      <WishlistToolbar />
      <Container>
        <Switch>
          <Route
            path="/wishlists/:handle/:variantId/:optionId?"
            render={() => (
              <Blocks region="VariantDetailMain" blockProps={blockProps}>
                {(blocks) =>
                  blocks.map((block, index) => (
                    <div className={classes.block} key={index}>
                      {block}
                    </div>
                  ))
                }
              </Blocks>
            )}
          />
          <Route
            path="/wishlists/:handle/"
            render={() => (
              <Container>
                <Blocks region="WishlistDetailMain" blockProps={blockProps}>
                  {(blocks) =>
                    blocks.map((block, index) => (
                      <div className={classes.block} key={index}>
                        {block}
                      </div>
                    ))
                  }
                </Blocks>
              </Container>
            )}
          />
        </Switch>
      </Container>
    </ContentViewExtraWideLayout>
  );
}

WishlistDetail.propTypes = {
  classes: PropTypes.object,
};

export default withStyles(styles, { name: "RuiWishlistDetail" })(WishlistDetail);

import React, { useState } from "react";
import PropTypes from "prop-types";
import Helmet from "react-helmet";
import { Link } from "react-router-dom";
import { i18next, Reaction } from "/client/api";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import DotsHorizontalIcon from "mdi-material-ui/DotsHorizontal";
import ConfirmDialog from "@reactioncommerce/catalyst/ConfirmDialog";
import { makeStyles, Box, Divider } from "@material-ui/core";
import useWishlist from "../hooks/useWishlist";

const useStyles = makeStyles((theme) => ({
  breadcrumbs: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2)
  },
  breadcrumbIcon: {
    fontSize: 14,
    marginRight: 7
  },
  breadcrumbLink: {
    fontSize: "14px",
    fontFamily: theme.typography.fontFamily,
    color: "#3c3c3c",
    border: 0,
    marginRight: 7
  }
}));

/**
 * Header component for various wishlist admin forms
 * @param {Object} props Component props
 * @returns {Node} React component
 */
function WishlistHeader({ shouldDisplayStatus }) {
  const classes = useStyles();
  const [menuAnchorEl, setMenuAnchorEl] = useState();
  const {
    onArchiveWishlist,
    onCreateVariant,
    onRestoreWishlist,
    onCloneWishlist,
    onToggleWishlistVisibility,
    wishlist,
    variant,
    option
  } = useWishlist();

  if (!wishlist) {
    return null;
  }

  const hasCloneWishlistPermission = Reaction.hasPermission(["reaction:legacy:wishlists/clone"], Reaction.getUserId(), Reaction.getShopId());
  const hasArchiveWishlistPermission = Reaction.hasPermission(["reaction:legacy:wishlists/archive"], Reaction.getUserId(), Reaction.getShopId());

  // Archive menu item
  let archiveMenuItem = (
    <ConfirmDialog
      title={i18next.t("admin.wishlistTable.bulkActions.archiveTitle")}
      message={i18next.t("wishlistDetailEdit.archiveThisWishlist")}
      onConfirm={() => {
        let redirectUrl;

        if (option) {
          redirectUrl = `/wishlists/${wishlist._id}/${variant._id}`;
        } else if (variant) {
          redirectUrl = `/wishlists/${wishlist._id}`;
        } else {
          redirectUrl = "/wishlists";
        }

        onArchiveWishlist(wishlist._id, redirectUrl);
      }}
    >
      {({ openDialog }) => (
        <MenuItem onClick={openDialog}>{i18next.t("admin.wishlistTable.bulkActions.archive")}</MenuItem>
      )}
    </ConfirmDialog>
  );

  if (wishlist.isDeleted) {
    archiveMenuItem = (
      <ConfirmDialog
        title={i18next.t("admin.wishlistTable.bulkActions.restoreTitle")}
        message={i18next.t("wishlistDetailEdit.restoreThisWishlist")}
        onConfirm={() => {
          onRestoreWishlist(wishlist._id);
          setMenuAnchorEl(null);
        }}
      >
        {({ openDialog }) => (
          <MenuItem onClick={openDialog}>{i18next.t("admin.wishlistTable.bulkActions.restore")}</MenuItem>
        )}
      </ConfirmDialog>
    );
  }

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
      >
        <Box
          display="flex"
          flexDirection="column"
          flex="1"
        >
          <Link className={classes.breadcrumbLink} to={`/wishlists/${wishlist._id}`}>
            <Typography variant="h2">
              <Helmet title={wishlist.title} />
              {wishlist.title || "Untitled Wishlist"}
            </Typography>
          </Link>
          {shouldDisplayStatus &&
            <Box>
              <Typography variant="caption">
                {wishlist.isVisible ? "Visible" : "Hidden"}
                {wishlist.isDeleted ? i18next.t("app.archived") : null}
              </Typography>
            </Box>
          }
        </Box>

        <IconButton
          onClick={(event) => {
            setMenuAnchorEl(event.currentTarget);
          }}
        >
          <DotsHorizontalIcon />
        </IconButton>
      </Box>

      <Menu
        id="bulk-actions-menu"
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem
          onClick={async () => {
            await onCreateVariant({
              parentId: wishlist._id,
              redirectOnCreate: true
            });
            setMenuAnchorEl(null);
          }}
        >
          {i18next.t("variantList.createVariant")}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            onToggleWishlistVisibility(wishlist);
            setMenuAnchorEl(null);
          }}
        >
          {wishlist.isVisible ?
            i18next.t("admin.wishlistTable.bulkActions.makeHidden") :
            i18next.t("admin.wishlistTable.bulkActions.makeVisible")
          }
        </MenuItem>
        {hasCloneWishlistPermission &&
          <MenuItem
            onClick={() => {
              onCloneWishlist(wishlist._id);
              setMenuAnchorEl(null);
            }}
          >
            {i18next.t("admin.wishlistTable.bulkActions.duplicate")}
          </MenuItem>
        }
        {hasArchiveWishlistPermission &&
          archiveMenuItem
        }
      </Menu>
    </>
  );
}

WishlistHeader.propTypes = {
  shouldDisplayStatus: PropTypes.bool
};

export default WishlistHeader;

import { useState, useCallback } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { Meteor } from "meteor/meteor";
import i18next from "i18next";
import useCurrentShopId from "/imports/client/ui/hooks/useCurrentShopId";
import { useSnackbar } from "notistack";

// GraphQL Queries / Mutations
import ArchiveWishlistsMutation from "../graphql/mutations/archiveWishlists";
import ArchiveWishlistEntriesMutation from "../graphql/mutations/archiveWishlistEntries";
import CloneWishlistsMutation from "../graphql/mutations/cloneWishlists";
import CreateWishlistEntryMutation from "../graphql/mutations/createWishlistEntry";
import WishlistQuery from "../graphql/queries/wishlist";
import UpdateWishlistMutation from "../graphql/mutations/updateWishlist";
import UpdateWishlistEntryMutation from "../graphql/mutations/updateWishlistEntry";

/**
 * Restore an archived wishlist
 * @param {Object} wishlist Wishlist object
 * @returns {undefined} No return
 */
export function handleWishlistRestore(wishlist) {
  Meteor.call("wishlists/updateWishlistField", wishlist._id, "isArchived", false);
}

/**
 * @method useWishlist
 * @summary useWishlist hook
 * @param {Object} args input arguments
 * @param {String} args.wishlistId Wishlist Id to load wishlist data for
 * @param {String} args.entryId Entry Id to load wishlist data for
 * @param {String} args.optionId Option Id to load wishlist data for
 * @returns {Object} Result containing the wishlist and other helpers for managing that wishlist
 */
function useWishlist(args = {}) {
  const { enqueueSnackbar } = useSnackbar();

  const {
    wishlistId: wishlistIdProp,
    entryId: entryIdProp,
    optionId: optionIdProp
  } = args;
  const [newMetaField, setNewMetaField] = useState({ key: "", value: "" });
  const history = useHistory();
  const routeParams = useParams();
  const [updateWishlist] = useMutation(UpdateWishlistMutation);
  const [archiveWishlists] = useMutation(ArchiveWishlistsMutation);
  const [cloneWishlists] = useMutation(CloneWishlistsMutation);
  const [createWishlistEntry] = useMutation(CreateWishlistEntryMutation);
  const [updateWishlistEntry] = useMutation(UpdateWishlistEntryMutation);
  const [archiveWishlistEntries] = useMutation(ArchiveWishlistEntriesMutation);


  const [currentShopId] = useCurrentShopId();

  const wishlistId = routeParams.handle || wishlistIdProp;
  const entryId = routeParams.entryId || entryIdProp;
  const optionId = routeParams.optionId || optionIdProp;
  const shopId = routeParams.shopId || currentShopId;

  const { data: wishlistQueryResult, isLoading, refetch: refetchWishlist } = useQuery(WishlistQuery, {
    variables: {
      wishlistId
    },
    skip: !shopId
  });

  const { wishlist } = wishlistQueryResult || {};

  let entry;
  let option;

  if (wishlist && entryId) {
    entry = wishlist.entries.find(({ _id }) => _id === entryId);
  }

  if (wishlist && entryId && optionId) {
    option = entry.options.find(({ _id }) => _id === optionId);
  }

  const onArchiveWishlist = useCallback(async (wishlistLocal, redirectUrl) => {
    try {
      await archiveWishlists({ variables: { input: { wishlistIds: [wishlistLocal] } } });
      enqueueSnackbar(i18next.t("wishlistDetailEdit.archiveWishlistsSuccess"), { variant: "success" });
      history.push(redirectUrl);
    } catch (error) {
      enqueueSnackbar(i18next.t("wishlistDetailEdit.archiveWishlistsFail"), { variant: "success" });
    }
  }, [
    enqueueSnackbar,
    history,
    archiveWishlists
  ]);

  const onCloneWishlist = useCallback(async (wishlistLocal) => {
    try {
      await cloneWishlists({ variables: { input: { shopId, wishlistIds: [wishlistLocal] } } });
      enqueueSnackbar(i18next.t("wishlistDetailEdit.cloneWishlistSuccess"), { entry: "success" });
    } catch (error) {
      enqueueSnackbar(i18next.t("wishlistDetailEdit.cloneWishlistFail"), { entry: "error" });
    }
  }, [cloneWishlists, enqueueSnackbar, shopId]);

  const onCreateEntry = useCallback(async ({
    parentId: parentIdLocal = wishlist._id,
    shopId: shopIdLocal = shopId,
    redirectOnCreate = false
  }) => {
    try {
      const { data } = await createWishlistEntry({
        variables: {
          input: {
            wishlistId: parentIdLocal,
            shopId: shopIdLocal
          }
        }
      });

      // Optionally redirect to the new entry or option on create
      if (redirectOnCreate) {
        if (data && parentIdLocal === wishlist._id) {
          const newEntryId = data.createWishlistEntry && data.createWishlistEntry.entry && data.createWishlistEntry.entry._id;
          history.push(`/wishlists/${wishlist._id}/${newEntryId}`);
        } else {
          const newOptionId = data.createWishlistEntry && data.createWishlistEntry.entry && data.createWishlistEntry.entry._id;
          history.push(`/wishlists/${wishlist._id}/${parentIdLocal}/${newOptionId}`);
        }
      }

      // Refetch wishlist data when we adda new entry
      refetchWishlist();

      // Because of the way GraphQL and meteor interact when creating a new entry,
      // we can't immediately redirect a user to the new entry as GraphQL is too quick
      // and the meteor subscription isn't yet updated. Once this page has been updated
      // to use GraphQL for data fetching, add a redirect to the new entry when it's created
      enqueueSnackbar(i18next.t("wishlistDetailEdit.addEntry"), { entry: "success" });
    } catch (error) {
      enqueueSnackbar(i18next.t("wishlistDetailEdit.addEntryFail"), { entry: "error" });
    }
  }, [createWishlistEntry, enqueueSnackbar, history, wishlist, refetchWishlist, shopId]);

  const onToggleWishlistVisibility = useCallback(async () => {
    try {
      await updateWishlist({
        variables: {
          input: {
            wishlistId: wishlist._id,
            shopId,
            wishlist: {
              isVisible: !wishlist.isVisible
            }
          }
        }
      });

      enqueueSnackbar(i18next.t("wishlistDetailEdit.updateWishlistFieldSuccess"), { entry: "success" });
    } catch (error) {
      enqueueSnackbar(i18next.t("wishlistDetailEdit.updateWishlistFieldFail"), { entry: "error" });
    }
  }, [
    enqueueSnackbar,
    wishlist,
    shopId,
    updateWishlist
  ]);

  /**
   * @method onUpdateWishlist
   * @param {Object} args
   * @param {Object} args.wishlist Wishlist fields to update
   * @param {Object} [args.wishlistId] Wishlist ID to update. Leave blank for current wishlist.
   * @param {Object} [args.shopId] Shop ID of the wishlist to update. Leave blank for current shop.
   */
  const onUpdateWishlist = useCallback(async ({
    wishlist: wishlistLocal,
    wishlistId: wishlistIdLocal = wishlist._id,
  }) => {
    try {
      await updateWishlist({
        variables: {
          input: {
            wishlistId: wishlistIdLocal,
            wishlist: wishlistLocal
          }
        }
      });

      enqueueSnackbar(i18next.t("wishlistDetailEdit.updateWishlistFieldSuccess"), { entry: "success" });
    } catch (error) {
      enqueueSnackbar(i18next.t("wishlistDetailEdit.updateWishlistFieldFail"), { entry: "error" });
    }
  }, [
    enqueueSnackbar,
    wishlist,
    updateWishlist
  ]);


  const onUpdateWishlistEntry = useCallback(async ({
    entry: entryLocal,
    entryId: entryIdLocal,
    shopId: shopIdLocal = shopId
  }) => {
    try {
      await updateWishlistEntry({
        variables: {
          input: {
            shopId: shopIdLocal,
            entry: entryLocal,
            entryId: entryIdLocal
          }
        }
      });

      enqueueSnackbar(i18next.t("WishlistEntry.updateEntriesuccess"), { entry: "success" });
    } catch (error) {
      enqueueSnackbar(i18next.t("WishlistEntry.updateEntryFail"), { entry: "error" });
    }
  }, [enqueueSnackbar, shopId, updateWishlistEntry]);

  // const onUpdateWishlistEntryPrices = useCallback(async ({
  //   entryPrices: entryPricesLocal,
  //   entryId: entryIdLocal,
  //   shopId: shopIdLocal = shopId
  // }) => {
  //   const { price, compareAtPrice } = entryPricesLocal;
  //   try {
  //     await updateWishlistEntryPrices({
  //       variables: {
  //         input: {
  //           shopId: shopIdLocal,
  //           prices: {
  //             price,
  //             compareAtPrice: compareAtPrice.amount
  //           },
  //           entryId: entryIdLocal
  //         }
  //       }
  //     });

  //     enqueueSnackbar(i18next.t("WishlistEntry.updateEntryPricesSuccess"), { entry: "success" });
  //   } catch (error) {
  //     enqueueSnackbar(i18next.t("WishlistEntry.updateEntryPricesFail"), { entry: "error" });
  //   }
  // }, [enqueueSnackbar, shopId, updateWishlistEntryPrices]);

  const onToggleEntryVisibility = useCallback(async ({
    entry: entryLocal,
    shopId: shopIdLocal = shopId
  }) => {
    try {
      await updateWishlistEntry({
        variables: {
          input: {
            entryId: entryLocal._id,
            shopId: shopIdLocal,
            entry: {
              isVisible: !entryLocal.isVisible
            }
          }
        }
      });

      enqueueSnackbar(i18next.t("wishlistDetailEdit.updateWishlistFieldSuccess"), { entry: "success" });
    } catch (error) {
      enqueueSnackbar(i18next.t("wishlistDetailEdit.updateWishlistFieldFail"), { entry: "error" });
    }
  }, [enqueueSnackbar, shopId, updateWishlistEntry]);

  const onArchiveWishlistEntries = useCallback(async ({
    entryIds: entryIdsLocal,
    shopId: shopIdLocal = shopId,
    redirectOnArchive = false
  }) => {
    try {
      await archiveWishlistEntries({
        variables: {
          input: {
            shopId: shopIdLocal,
            entryIds: entryIdsLocal
          }
        }
      });

      if (redirectOnArchive) {
        let redirectUrl;

        if (option) {
          redirectUrl = `/wishlists/${wishlist._id}/${entry._id}`;
        } else {
          redirectUrl = `/wishlists/${wishlist._id}`;
        }

        history.push(redirectUrl);
      }

      // Refetch wishlist data when we adda new entry
      refetchWishlist();

      enqueueSnackbar(i18next.t("wishlistDetailEdit.archiveWishlistEntriesSuccess"), { entry: "success" });
    } catch (error) {
      enqueueSnackbar(i18next.t("wishlistDetailEdit.archiveWishlistEntriesFail"), { entry: "error" });
    }
  }, [archiveWishlistEntries, enqueueSnackbar, history, option, wishlist, refetchWishlist, shopId, entry]);

  // Convert the social metadata to a format better suited for forms
  if (wishlist && Array.isArray(wishlist.socialMetadata)) {
    wishlist.socialMetadata.forEach(({ service, message }) => {
      wishlist[`${service}Msg`] = message;
    });
  }

  return {
    currentEntry: option || entry,
    newMetaField,
    isLoading,
    onArchiveWishlist,
    onArchiveWishlistEntries,
    onCloneWishlist,
    onCreateEntry,
    onUpdateWishlist,
    option,
    onRestoreWishlist: handleWishlistRestore,
    onToggleWishlistVisibility,
    onToggleEntryVisibility,
    onUpdateWishlistEntry,
    wishlist: wishlistQueryResult && wishlistQueryResult.wishlist,
    refetchWishlist,
    setNewMetaField,
    shopId,
    entry
  };
}

export default useWishlist;

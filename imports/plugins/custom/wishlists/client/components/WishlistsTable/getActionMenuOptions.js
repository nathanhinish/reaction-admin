import i18next from "i18next";
import getTranslation from "../../utils/getTranslation";

export default function getActionMenuOptions({ apolloClient, enqueueSnackbar, selectedRows }) {
  const makeVisibleHandler = async () => {
    const errors = [];
    const successes = [];
    // TODO: refactor this loop to use a bulk update mutation that needs to be implemented.
    for (const wishlistId of selectedRows) {
      // eslint-disable-next-line no-await-in-loop
      const { data, error } = await apolloClient.mutate({
        mutation: updateWishlist,
        variables: {
          input: {
            wishlist: {
              isVisible: true,
            },
            wishlistId,
          },
        },
      });

      if (error) errors.push(error);
      if (data) successes.push(data);
    }

    if (errors.length) {
      enqueueSnackbar(i18next.t("admin.wishlistTable.bulkActions.error", { variant: "error" }));
      return;
    }

    refetch();
    enqueueSnackbar(getTranslation("admin.wishlistTable.bulkActions.makeVisibleSuccess", { count: successes.length }));
  };

  const makeHiddenHandler = async () => {
    const errors = [];
    const successes = [];
    // TODO: refactor this loop to use a bulk update mutation that needs to be implemented.
    for (const wishlistId of selectedRows) {
      // eslint-disable-next-line no-await-in-loop
      const { data, error } = await apolloClient.mutate({
        mutation: updateWishlist,
        variables: {
          input: {
            wishlist: {
              isVisible: false,
            },
            wishlistId,
          },
        },
      });

      if (error && error.length) errors.push(error);
      if (data) successes.push(data);
    }

    if (errors.length) {
      enqueueSnackbar(i18next.t("admin.wishlistTable.bulkActions.error", { variant: "error" }));
      return;
    }

    refetch();
    enqueueSnackbar(getTranslation("admin.wishlistTable.bulkActions.makeHiddenSuccess", { count: successes.length }));
  };

  const duplicateHandler = async () => {
    const { data, error } = await apolloClient.mutate({
      mutation: cloneWishlists,
      variables: {
        input: {
          wishlistIds: selectedRows,
        },
      },
    });

    if (error && error.length) {
      enqueueSnackbar(i18next.t("admin.wishlistTable.bulkActions.error", { variant: "error" }));
      return;
    }

    refetch();
    enqueueSnackbar(
      getTranslation("admin.wishlistTable.bulkActions.duplicateSuccess", {
        count: data.cloneWishlists.wishlists.length,
      })
    );
  };

  const archiveHandler = async () => {
    const { data, error } = await apolloClient.mutate({
      mutation: archiveWishlists,
      variables: {
        input: {
          wishlistIds: selectedRows,
        },
      },
    });

    if (error && error.length) {
      enqueueSnackbar(i18next.t("admin.wishlistTable.bulkActions.error", { variant: "error" }));
      return;
    }

    refetch();
    enqueueSnackbar(
      getTranslation("admin.wishlistTable.bulkActions.archiveSuccess", {
        count: data.archiveWishlists.wishlists.length,
      })
    );
  };

  return [
    {
      label: i18next.t("admin.wishlistTable.bulkActions.makeVisible"),
      confirmTitle: getTranslation("admin.wishlistTable.bulkActions.makeVisibleTitle", {
        count: selectedRows.length,
      }),
      confirmMessage: getTranslation("admin.wishlistTable.bulkActions.makeVisibleMessage", {
        count: selectedRows.length,
      }),
      isDisabled: selectedRows.length === 0,
      onClick: makeVisibleHandler,
    },
    {
      label: i18next.t("admin.wishlistTable.bulkActions.makeHidden"),
      confirmTitle: getTranslation("admin.wishlistTable.bulkActions.makeHiddenTitle", { count: selectedRows.length }),
      confirmMessage: getTranslation("admin.wishlistTable.bulkActions.makeHiddenMessage", {
        count: selectedRows.length,
      }),
      isDisabled: selectedRows.length === 0,
      onClick: makeHiddenHandler,
    },
    {
      label: i18next.t("admin.wishlistTable.bulkActions.duplicate"),
      confirmTitle: getTranslation("admin.wishlistTable.bulkActions.duplicateTitle", { count: selectedRows.length }),
      confirmMessage: getTranslation("admin.wishlistTable.bulkActions.duplicateMessage", {
        count: selectedRows.length,
      }),
      isDisabled: selectedRows.length === 0,
      onClick: duplicateHandler,
    },
    {
      label: i18next.t("admin.wishlistTable.bulkActions.archive"),
      confirmTitle: getTranslation("admin.wishlistTable.bulkActions.archiveTitle", { count: selectedRows.length }),
      confirmMessage: getTranslation("admin.wishlistTable.bulkActions.archiveMessage", {
        count: selectedRows.length,
      }),
      isDisabled: selectedRows.length === 0,
      onClick: archiveHandler,
    },
  ];
}

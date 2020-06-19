import React, { Fragment, useState, useMemo, useCallback } from "react";
import { useApolloClient, useMutation } from "@apollo/react-hooks";
import i18next from "i18next";
import { useHistory } from "react-router-dom";
import DataTable, { useDataTable } from "@reactioncommerce/catalyst/DataTable";
import Button from "@reactioncommerce/catalyst/Button";
import decodeOpaqueId from "@reactioncommerce/api-utils/decodeOpaqueId.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import { useSnackbar } from "notistack";
import { useDropzone } from "react-dropzone";
import { Card, CardHeader, CardContent, Grid, makeStyles } from "@material-ui/core";
import useCurrentShopId from "/imports/client/ui/hooks/useCurrentShopId";
import wishlistsQuery from "../graphql/queries/wishlists";
import archiveWishlists from "../graphql/mutations/archiveWishlists";
import updateWishlist from "../graphql/mutations/updateWishlist";
import cloneWishlists from "../graphql/mutations/cloneWishlists";
import createWishlistMutation from "../graphql/mutations/createWishlist";
import getTranslation from "../utils/getTranslation";
import FilterByFileCard from "./FilterByFileCard";

const useStyles = makeStyles((theme) => ({
  card: {
    overflow: "visible"
  },
  cardHeader: {
    paddingBottom: 0
  },
  selectedWishlists: {
    fontWeight: 400,
    marginLeft: theme.spacing(1)
  }
}));

const CSV_FILE_TYPES = [
  "text/csv",
  "text/plain",
  "text/x-csv",
  "application/vnd.ms-excel",
  "application/csv",
  "application/x-csv",
  "text/comma-separated-values",
  "text/x-comma-separated-values",
  "text/tab-separated-values"
];

/**
 * @summary Main wishlists view
 * @name WishlistsTable
 * @returns {React.Component} A React component
 */
function WishlistsTable() {
  const apolloClient = useApolloClient();
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const [shopId] = useCurrentShopId();
  const [createWishlist, { error: createWishlistError }] = useMutation(createWishlistMutation);

  // React-Table state
  const [isLoading, setIsLoading] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableData, setTableData] = useState([]);

  // Filter by file state
  const [files, setFiles] = useState([]);
  const [isFilterByFileVisible, setFilterByFileVisible] = useState(false);
  const [isFiltered, setFiltered] = useState(false);

  // Tag selector state
  const [isTagSelectorVisible, setTagSelectorVisibility] = useState(false);

  // Create and memoize the column data
  const columns = useMemo(() => [
    {
      Header: "",
      accessor: "original.media[0].URLs.thumbnail",
      cellProps: () => ({
        style: {
          paddingLeft: 0,
          paddingRight: 0
        }
      }),
      // eslint-disable-next-line react/no-multi-comp,react/display-name,react/prop-types
      Cell: ({ row }) => <div>{JSON.stringify(row)}</div>
    },
    {
      Header: i18next.t("admin.wishlistTable.header.wishlist"),
      accessor: "title"
    },
    {
      Header: i18next.t("admin.wishlistTable.header.id"),
      accessor: (row) => {
        const { id: wishlistId } = decodeOpaqueId(row._id);
        return wishlistId;
      },
      id: "_id"
    },
    {
      Header: i18next.t("admin.wishlistTable.header.visible"),
      // eslint-disable-next-line react/no-multi-comp,react/display-name,react/prop-types
      Cell: ({ row }) => <div>{JSON.stringify(row)}</div>,
      id: "isVisible"
    }
  ], []);


  const onFetchData = useCallback(async ({ globalFilter, manualFilters, pageIndex, pageSize }) => {
    // Wait for shop id to be available before fetching wishlists.
    setIsLoading(true);
    if (!shopId) {
      return;
    }

    const filterByWishlistIds = {};
    if (manualFilters.length) {
      filterByWishlistIds.wishlistIds = manualFilters[0].value.map((id) => encodeOpaqueId("reaction/wishlist", id));
      // Reset uploaded files
      setFiles([]);
    }

    const { data } = await apolloClient.query({
      query: wishlistsQuery,
      variables: {
        ...filterByWishlistIds,
        query: globalFilter,
        first: pageSize,
        limit: (pageIndex + 1) * pageSize,
        offset: pageIndex * pageSize
      },
      fetchPolicy: "network-only"
    });

    // Update the state with the fetched data as an array of objects and the calculated page count
    setTableData(data.wishlists.nodes);
    setPageCount(Math.ceil(data.wishlists.totalCount / pageSize));

    setIsLoading(false);
  }, [apolloClient, shopId]);

  // Row click callback
  const onRowClick = useCallback(async ({ row }) => {
    const href = getPDPUrl(row.original._id);
    history.push(href);
  }, [history]);

  const onRowSelect = useCallback(async ({ selectedRows: rows }) => {
    setSelectedRows(rows || []);
  }, []);

  const labels = useMemo(() => ({
    globalFilterPlaceholder: i18next.t("admin.wishlistTable.filters.placeholder")
  }), []);

  const dataTableProps = useDataTable({
    columns,
    data: tableData,
    labels,
    pageCount,
    onFetchData,
    onRowClick,
    onRowSelect,
    getRowId: (row) => row._id
  });

  const { refetch, setManualFilters } = dataTableProps;

  const onDrop = (accepted) => {
    if (accepted.length === 0) return;
    setFiles(accepted);
  };

  const handleCreateWishlist = async () => {
    const { data } = await createWishlist({ variables: { input: { shopId } } });

    if (data) {
      const { createWishlist: { wishlist } } = data;
      history.push(`/wishlists/${wishlist._id}`);
    }

    if (createWishlistError) {
      enqueueSnackbar(i18next.t("admin.wishlistTable.bulkActions.error", { variant: "error" }));
    }
  };

  // Filter by file event handlers
  const { getRootProps, getInputProps } = useDropzone({
    accept: CSV_FILE_TYPES,
    disableClick: true,
    disablePreview: true,
    multiple: false,
    onDrop
  });

  const importFiles = (newFiles) => {
    let wishlistIds = [];

    newFiles.map((file) => {
      const output = [];
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onloadend = () => {
        const parse = require("csv-parse");

        parse(reader.result, {
          trim: true,
          // eslint-disable-next-line camelcase
          skip_empty_lines: true
        })
          .on("readable", function () {
            let record;
            // eslint-disable-next-line no-cond-assign
            while (record = this.read()) {
              output.push(record);
            }
          })
          .on("end", () => {
            output.map((outputarray) => {
              wishlistIds = wishlistIds.concat(outputarray);
              return;
            });

            setManualFilters(file.name, wishlistIds);
            setFilterByFileVisible(false);
            setFiltered(true);
          });
      };
      return;
    });
  };

  const handleDeleteUploadedFile = (deletedFilename) => {
    const newFiles = files.filter((file) => file.name !== deletedFilename);
    setFiles(newFiles);
    if (newFiles.length === 0) {
      setFiltered(false);
    } else if (isFiltered) {
      importFiles(newFiles);
    }
  };

  // Create options for the built-in ActionMenu in the DataTable
  const options = useMemo(() => [{
    label: i18next.t("admin.wishlistTable.bulkActions.filterByFile"),
    onClick: () => {
      if (isTagSelectorVisible) setTagSelectorVisibility(false);
      setFilterByFileVisible(true);
    }
  }, {
    label: i18next.t("admin.wishlistTable.bulkActions.addRemoveTags"),
    isDisabled: selectedRows.length === 0,
    onClick: () => {
      if (isFilterByFileVisible) setFilterByFileVisible(false);
      setTagSelectorVisibility(true);
    }
  },
  {
    label: i18next.t("admin.wishlistTable.bulkActions.makeVisible"),
    confirmTitle: getTranslation("admin.wishlistTable.bulkActions.makeVisibleTitle", { count: selectedRows.length }),
    confirmMessage: getTranslation("admin.wishlistTable.bulkActions.makeVisibleMessage", { count: selectedRows.length }),
    isDisabled: selectedRows.length === 0,
    onClick: async () => {
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
                isVisible: true
              },
              wishlistId,
              shopId
            }
          }
        });

        if (error) errors.push(error);
        if (data) successes.push(data);
      }

      if (errors.length) {
        enqueueSnackbar(i18next.t("admin.wishlistTable.bulkActions.error", { variant: "error" }));
        return;
      }

      refetch();
      enqueueSnackbar(getTranslation(
        "admin.wishlistTable.bulkActions.makeVisibleSuccess",
        { count: successes.length }
      ));
    }
  }, {
    label: i18next.t("admin.wishlistTable.bulkActions.makeHidden"),
    confirmTitle: getTranslation("admin.wishlistTable.bulkActions.makeHiddenTitle", { count: selectedRows.length }),
    confirmMessage: getTranslation("admin.wishlistTable.bulkActions.makeHiddenMessage", { count: selectedRows.length }),
    isDisabled: selectedRows.length === 0,
    onClick: async () => {
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
                isVisible: false
              },
              wishlistId,
              shopId
            }
          }
        });

        if (error && error.length) errors.push(error);
        if (data) successes.push(data);
      }

      if (errors.length) {
        enqueueSnackbar(i18next.t("admin.wishlistTable.bulkActions.error", { variant: "error" }));
        return;
      }

      refetch();
      enqueueSnackbar(getTranslation(
        "admin.wishlistTable.bulkActions.makeHiddenSuccess",
        { count: successes.length }
      ));
    }
  }, {
    label: i18next.t("admin.wishlistTable.bulkActions.duplicate"),
    confirmTitle: getTranslation("admin.wishlistTable.bulkActions.duplicateTitle", { count: selectedRows.length }),
    confirmMessage: getTranslation("admin.wishlistTable.bulkActions.duplicateMessage", { count: selectedRows.length }),
    isDisabled: selectedRows.length === 0,
    onClick: async () => {
      const { data, error } = await apolloClient.mutate({
        mutation: cloneWishlists,
        variables: {
          input: {
            wishlistIds: selectedRows,
            shopId
          }
        }
      });

      if (error && error.length) {
        enqueueSnackbar(i18next.t("admin.wishlistTable.bulkActions.error", { variant: "error" }));
        return;
      }

      refetch();
      enqueueSnackbar(getTranslation(
        "admin.wishlistTable.bulkActions.duplicateSuccess",
        { count: data.cloneWishlists.wishlists.length }
      ));
    }
  }, {
    label: i18next.t("admin.wishlistTable.bulkActions.archive"),
    confirmTitle: getTranslation("admin.wishlistTable.bulkActions.archiveTitle", { count: selectedRows.length }),
    confirmMessage: getTranslation("admin.wishlistTable.bulkActions.archiveMessage", { count: selectedRows.length }),
    isDisabled: selectedRows.length === 0,
    onClick: async () => {
      const { data, error } = await apolloClient.mutate({
        mutation: archiveWishlists,
        variables: {
          input: {
            wishlistIds: selectedRows,
            shopId
          }
        }
      });

      if (error && error.length) {
        enqueueSnackbar(i18next.t("admin.wishlistTable.bulkActions.error", { variant: "error" }));
        return;
      }

      refetch();
      enqueueSnackbar(getTranslation(
        "admin.wishlistTable.bulkActions.archiveSuccess",
        { count: data.archiveWishlists.wishlists.length }
      ));
    }
  }], [apolloClient, enqueueSnackbar, isFilterByFileVisible, isTagSelectorVisible, refetch, selectedRows, shopId]);

  const classes = useStyles();
  const selectedWishlists = selectedRows.length ? `${selectedRows.length} selected` : "";
  const cardTitle = (
    <Fragment>
      {i18next.t("admin.wishlists")}<span className={classes.selectedWishlists}>{selectedWishlists}</span>
    </Fragment>
  );

  return (
    <Grid container spacing={3}>
      <FilterByFileCard
        isFilterByFileVisible={isFilterByFileVisible}
        files={files}
        getInputProps={getInputProps}
        getRootProps={getRootProps}
        importFiles={importFiles}
        handleDelete={handleDeleteUploadedFile}
        setFilterByFileVisible={setFilterByFileVisible}
      />
      {/* <TagSelector
        isVisible={isTagSelectorVisible}
        setVisibility={setTagSelectorVisibility}
        selectedWishlistIds={selectedRows}
        shopId={shopId}
      /> */}
      { (!isTagSelectorVisible && !isFilterByFileVisible) &&
        <Grid item sm={12}>
          <Button color="primary" variant="contained" onClick={handleCreateWishlist}>
            {i18next.t("admin.createWishlist") || "Create wishlist"}
          </Button>
        </Grid>
      }
      <Grid item sm={12}>
        <Card className={classes.card}>
          <CardHeader classes={{ root: classes.cardHeader }} title={cardTitle} />
          <CardContent>
            <DataTable
              {...dataTableProps}
              actionMenuProps={{ options }}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </Grid >
    </Grid >
  );
}

export default WishlistsTable;

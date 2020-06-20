import { useApolloClient, useMutation } from "@apollo/react-hooks";
import { Card, CardContent, CardHeader, Grid, makeStyles } from "@material-ui/core";
import decodeOpaqueId from "@reactioncommerce/api-utils/decodeOpaqueId.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import Button from "@reactioncommerce/catalyst/Button";
import DataTable, { useDataTable } from "@reactioncommerce/catalyst/DataTable";
import i18next from "i18next";
import { useSnackbar } from "notistack";
import React, { Fragment, useCallback, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import createWishlistMutation from "../../graphql/mutations/createWishlist";
import wishlistsQuery from "../../graphql/queries/wishlists";

const useStyles = makeStyles((theme) => ({
  card: {
    overflow: "visible",
  },
  cardHeader: {
    paddingBottom: 0,
  },
  selectedWishlists: {
    fontWeight: 400,
    marginLeft: theme.spacing(1),
  },
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
  "text/tab-separated-values",
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
  const columns = useMemo(
    () => [
      {
        Header: i18next.t("admin.wishlistTable.header.wishlist"),
        accessor: "name",
      },
      {
        Header: i18next.t("admin.wishlistTable.header.id"),
        accessor: (row) => {
          const { id: wishlistId } = decodeOpaqueId(row._id);
          return wishlistId;
        },
        id: "_id",
      },
      {
        Header: i18next.t("admin.wishlistTable.header.visible"),
        // eslint-disable-next-line react/no-multi-comp,react/display-name,react/prop-types
        Cell: ({ row }) => <div>{row.values.isVisible ? "Yes" : "No"}</div>,
        id: "isVisible",
      },
    ],
    []
  );

  const onFetchData = useCallback(
    async ({ globalFilter, manualFilters, pageIndex, pageSize }) => {
      // Wait for shop id to be available before fetching wishlists.
      setIsLoading(true);

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
          offset: pageIndex * pageSize,
        },
        fetchPolicy: "network-only",
      });

      // Update the state with the fetched data as an array of objects and the calculated page count
      setTableData(data.wishlists.nodes);
      setPageCount(Math.ceil(data.wishlists.totalCount / pageSize));

      setIsLoading(false);
    },
    [apolloClient]
  );

  // Row click callback
  const onRowClick = useCallback(
    async ({ row }) => {
      const href = `/wishlists/${row.original._id}`;
      history.push(href);
    },
    [history]
  );

  const onRowSelect = useCallback(async ({ selectedRows: rows }) => {
    setSelectedRows(rows || []);
  }, []);

  const labels = useMemo(
    () => ({
      globalFilterPlaceholder: i18next.t("admin.wishlistTable.filters.placeholder"),
    }),
    []
  );

  const dataTableProps = useDataTable({
    columns,
    data: tableData,
    labels,
    pageCount,
    onFetchData,
    onRowClick,
    onRowSelect,
    getRowId: (row) => row._id,
  });

  const handleCreateWishlist = async () => {
    const { data } = await createWishlist({ variables: { input: {} } });

    if (data) {
      const {
        createWishlist: { wishlist },
      } = data;
      history.push(`/wishlists/${wishlist._id}`);
    }

    if (createWishlistError) {
      enqueueSnackbar(i18next.t("admin.wishlistTable.bulkActions.error", { variant: "error" }));
    }
  };

  const classes = useStyles();
  const selectedWishlists = selectedRows.length ? `${selectedRows.length} selected` : "";
  const cardTitle = (
    <Fragment>
      {i18next.t("admin.wishlists")}
      <span className={classes.selectedWishlists}>{selectedWishlists}</span>
    </Fragment>
  );

  return (
    <Grid container spacing={3}>
      <Grid item sm={12}>
        <Button color="primary" variant="contained" onClick={handleCreateWishlist}>
          {i18next.t("admin.createWishlist") || "Create wishlist"}
        </Button>
      </Grid>
      <Grid item sm={12}>
        <Card className={classes.card}>
          <CardHeader classes={{ root: classes.cardHeader }} title={cardTitle} />
          <CardContent>
            <DataTable {...dataTableProps} isLoading={isLoading} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default WishlistsTable;

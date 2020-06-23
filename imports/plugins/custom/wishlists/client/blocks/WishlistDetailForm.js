import { Box, Button, Card, CardContent, CardHeader, Checkbox, FormControlLabel, makeStyles } from "@material-ui/core";
import CountryOptions from "@reactioncommerce/api-utils/CountryOptions.js";
import { TextField, useConfirmDialog } from "@reactioncommerce/catalyst";
import i18next from "i18next";
import React, { useState } from "react";
import muiCheckboxOptions from "reacto-form/cjs/muiCheckboxOptions";
import muiOptions from "reacto-form/cjs/muiOptions";
import useReactoForm from "reacto-form/cjs/useReactoForm";
import SimpleSchema from "simpl-schema";
import useWishlist from "../hooks/useWishlist";
import useGenerateSitemaps from "/imports/plugins/included/sitemap-generator/client/hooks/useGenerateSitemaps";

const useStyles = makeStyles((theme) => ({
  card: {
    marginBottom: theme.spacing(2),
  },
  textField: {
    marginBottom: theme.spacing(4),
    minWidth: 350,
  },
}));

const formSchema = new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },
  permalink: {
    type: String,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
});

const validator = formSchema.getFormValidator();

/**
 * @name WishlistDetailForm
 * @param {Object} props Component props
 * @returns {React.Component} Wishlist detail form react component
 */
const WishlistDetailForm = React.forwardRef((props, ref) => {
  const classes = useStyles();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { onUpdateWishlist, wishlist, shopId } = useWishlist();

  const { generateSitemaps } = useGenerateSitemaps(shopId);
  const {
    openDialog: openGenerateSitemapsConfirmDialog,
    ConfirmDialog: GenerateSitemapsConfirmDialog,
  } = useConfirmDialog({
    title: i18next.t("wishlistDetailEdit.refreshSitemap", { defaultValue: "Refresh sitemap now?" }),
    cancelActionText: i18next.t("wishlistDetailEdit.refreshSitemapNo", { defaultValue: "No, don't refresh" }),
    confirmActionText: i18next.t("wishlistDetailEdit.refreshSitemapYes", { defaultValue: "Yes, refresh" }),
    onConfirm: () => {
      generateSitemaps();
    },
  });

  let content;

  const { getFirstErrorMessage, getInputProps, hasErrors, isDirty, submitForm } = useReactoForm({
    async onSubmit(formData) {
      const shouldConformSitemapGenerate =
        formData.shouldAppearInSitemap !== wishlist.shouldAppearInSitemap && formData.isVisible && !formData.isArchived;

      setIsSubmitting(true);

      await onUpdateWishlist({
        wishlist: formSchema.clean(formData),
      });

      if (shouldConformSitemapGenerate) {
        openGenerateSitemapsConfirmDialog();
      }

      setIsSubmitting(false);
    },
    validator(formData) {
      return validator(formSchema.clean(formData));
    },
    value: wishlist,
  });

  const originCountryInputProps = getInputProps("originCountry", muiOptions);

  if (wishlist) {
    content = (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitForm();
        }}
      >
        <TextField
          className={classes.textField}
          error={hasErrors(["name"])}
          fullWidth
          helperText={getFirstErrorMessage(["name"])}
          label={i18next.t("wishlistDetailEdit.name")}
          {...getInputProps("name", muiOptions)}
        />
        <TextField
          className={classes.textField}
          error={hasErrors(["permalink"])}
          fullWidth
          helperText={getFirstErrorMessage(["permalink"])}
          label={i18next.t("wishlistDetailEdit.permalink")}
          {...getInputProps("permalink", muiOptions)}
        />
        <TextField
          className={classes.textField}
          error={hasErrors(["description"])}
          fullWidth
          helperText={getFirstErrorMessage(["description"])}
          label={i18next.t("wishlistDetailEdit.description")}
          {...getInputProps("description", muiOptions)}
        />
        <Box textAlign="right">
          <Button color="primary" disabled={!isDirty || isSubmitting} variant="contained" type="submit">
            {i18next.t("app.saveChanges")}
          </Button>
        </Box>
        <GenerateSitemapsConfirmDialog />
      </form>
    );
  }

  return (
    <Card className={classes.card} ref={ref}>
      <CardHeader title={i18next.t("admin.wishlistDetail.title")} />
      <CardContent>{content}</CardContent>
    </Card>
  );
});

export default WishlistDetailForm;

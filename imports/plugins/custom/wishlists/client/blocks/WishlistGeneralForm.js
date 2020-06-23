import React from "react";

export default function WishlistGeneralForm() {
  return (
    <Grid container spacing={3}>
      <Grid item sm={12}>
        <Card className={classes.card}>
          <CardHeader classes={{ root: classes.cardHeader }} title={cardTitle} />
          <CardContent>test</CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

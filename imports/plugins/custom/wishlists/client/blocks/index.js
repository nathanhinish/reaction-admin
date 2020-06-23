import { registerBlock } from "../../../../core/components/lib";
import WishlistDetailForm from './WishlistDetailForm';
import WishlistHeader from './WishlistHeader';

registerBlock({
  region: "WishlistDetailMain",
  name: "WishlistHeader",
  component: WishlistHeader,
  priority: 10
});

registerBlock({
  name: "GeneralForm",
  region: "WishlistDetailMain",
  component: WishlistDetailForm,
});

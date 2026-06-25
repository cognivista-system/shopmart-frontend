import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import {
  addItem, updateQuantity, removeItem, clearCart,
  selectCartItems, selectCartCount, selectCartSubtotal, cartLineKey,
} from '../redux/slices/cartSlice';
import { openCartDrawer } from '../redux/slices/uiSlice';

export const useCart = () => {
  const items = useSelector(selectCartItems);
  const count = useSelector(selectCartCount);
  const subtotal = useSelector(selectCartSubtotal);
  const dispatch = useDispatch();

  return {
    items, count, subtotal,
    add: (item, { silent = false } = {}) => {
      dispatch(addItem(item));
      if (!silent) {
        toast.success(`${item.name} added to cart`);
        dispatch(openCartDrawer());
      }
    },
    setQty: (key, quantity) => dispatch(updateQuantity({ key, quantity })),
    remove: (key) => dispatch(removeItem(key)),
    clear: () => dispatch(clearCart()),
    keyOf: cartLineKey,
  };
};

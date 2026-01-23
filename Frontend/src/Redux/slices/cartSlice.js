import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [], // [{ _id, name, price, image, qty }]
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    // ✅ Add item to cart
    addToCart: (state, action) => {
      const item = state.items.find(
        (i) => i._id === action.payload._id
      );

      if (item) {
        item.qty += 1;
      } else {
        state.items.push({ ...action.payload, qty: 1 });
      }
    },

    // ➕ Increase quantity
    increaseQty: (state, action) => {
      const item = state.items.find(
        (i) => i._id === action.payload
      );
      if (item) item.qty += 1;
    },

    // ➖ Decrease quantity
    decreaseQty: (state, action) => {
      const item = state.items.find(
        (i) => i._id === action.payload
      );
      if (item && item.qty > 1) item.qty -= 1;
    },

    // ❌ Remove item completely
    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (i) => i._id !== action.payload
      );
    },

    // 🧹 Clear cart (after order / logout)
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  increaseQty,
  decreaseQty,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

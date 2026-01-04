import { createSlice } from "@reduxjs/toolkit";


export interface CartState {
  totalItems: number;
  totalPrice: number;
}
const initialState: CartState = {
  totalItems: 0,
  totalPrice: 0,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    calculateTotals: (state, action) => {
      state.totalPrice = action.payload
    },
  },
});

export const {
  calculateTotals,
} = cartSlice.actions;

export const cartReducer = cartSlice.reducer;

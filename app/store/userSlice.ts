import { createSlice } from "@reduxjs/toolkit";

interface userStateProps {
  isAdmin: boolean;
  email: string;
  name: string;
}

const initialUserState: userStateProps = {
  isAdmin: false,
  email: "",
  name: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState: initialUserState,
  reducers: {
    addUser: (state, action) => {
      state.name = action.payload.name;
      state.isAdmin = action.payload.isAdmin;
      state.email = action.payload.email;
    },
    removeUser: (state) => {
      state.name = "";
      state.isAdmin = false;
      state.email = "";
    },
  },
});

export const { addUser, removeUser } = userSlice.actions;
export const userReducer = userSlice.reducer;

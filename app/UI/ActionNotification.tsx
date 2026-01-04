import React from "react";

const ActionNotification = (state: { message: string; success: boolean }) => {
  return (
    <>
      {state.message && (
        <div
          className={`mb-4 p-3  ${
            state.success
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {state.message}
        </div>
      )}
    </>
  );
};

export default ActionNotification;

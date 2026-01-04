import React from "react";

interface errorProps {
  errorMessage: string;
  tryAgainHandler?(e?: React.MouseEvent): void;
}
const ErrorBox = ({ errorMessage, tryAgainHandler }: errorProps) => {
  return (
    <div className="bg-gray-100 w-fit border border-red-500 px-4 py-3 my-8 rounded">
      <p className="text-red-500">{errorMessage}</p>
      {tryAgainHandler && (
        <button
          type="button"
          onClick={tryAgainHandler}
          className="mt-2 text-sm bg-green-300 p-2 rounded-md"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorBox;

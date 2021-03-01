import { useReducer, useCallback } from "react";

const initalState = {
  loading: false,
  error: null,
  data: null,
  extra: null,
};

const httpReducer = (httpState, action) => {
  switch (action.type) {
    case "SEND":
      return {
        ...httpState,
        loading: true,
        data: null,
        extra: null,
        identifier: action.identifier,
      };
    case "RESPONSE":
      return {
        ...httpState,
        loading: false,
        data: action.resData,
        extra: action.extra,
      };
    case "ERROR":
      return { loading: false, error: action.error };
    case "CLEAR":
      return initalState;
    default:
      throw new Error("Should not be reached");
  }
};

const useHttp = () => {
  const [httpState, dispatchHttp] = useReducer(httpReducer, initalState);

  const clear = useCallback(() => dispatchHttp({ type: "CLEAR" }), []);

  const sendRequest = useCallback((url, method, body, extra, identifier) => {
    dispatchHttp({ type: "SEND", identifier });
    fetch(url, {
      method: method,
      body: body,
      headers: { "Content-type": "application/json" },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        dispatchHttp({ type: "RESPONSE", resData, extra });
      })
      .catch((err) => {
        dispatchHttp({ type: "ERROR", error: "Something went wrong" });
      });
  }, []);

  return {
    isLoading: httpState.loading,
    error: httpState.error,
    data: httpState.data,
    sendRequest: sendRequest,
    extra: httpState.extra,
    identifier: httpState.identifier,
    clear,
  };
};

export default useHttp;

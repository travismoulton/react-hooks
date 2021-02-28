import React, { useReducer, useCallback, useMemo } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import Search from "./Search";
import ErrorModal from "../UI/ErrorModal";
import useHttp from "../../hooks/http";

const ingredientReducer = (curIngredeints, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...curIngredeints, action.ingredient];
    case "DELETE":
      return curIngredeints.filter((ing) => ing.id !== action.id);

    default:
      throw new Error("Unhandled case");
  }
};

function Ingredients() {
  const [ingredients, dispatch] = useReducer(ingredientReducer, []);
  const { isLoading, error, data, sendRequest } = useHttp();

  const addIngredientHandler = useCallback(
    (ingredient) => {
      dispatchHttp({ type: "SEND" });
      fetch(
        "https://react-hoooks-dummy-default-rtdb.firebaseio.com/ingredients.json",
        {
          method: "POST",
          body: JSON.stringify(ingredient),
          headers: { "Content-type": "aplication/json" },
        }
      )
        .then((res) => {
          dispatchHttp({ type: "RESPONSE" });
          return res.json();
        })
        .then((resData) => {
          dispatch({
            type: "ADD",
            ingredient: { id: resData.name, ...ingredient },
          });
        });
    },
    [dispatchHttp]
  );

  const removeIngredientHandler = useCallback(
    (ingredientId) => {
      sendRequest(
        `https://react-hoooks-dummy-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`,
        "DELETE"
      );
    },
    [sendRequest]
  );

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  const clearError = useCallback(() => {
    dispatchHttp({ type: "CLEAR" });
  }, []);

  const ingredientList = useMemo(
    () => (
      <IngredientList
        ingredients={ingredients}
        onRemoveItem={removeIngredientHandler}
      />
    ),
    [ingredients, removeIngredientHandler]
  );

  return (
    <div className="App">
      {error ? <ErrorModal onClose={clearError}>{error}</ErrorModal> : null}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;

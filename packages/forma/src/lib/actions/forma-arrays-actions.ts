import { Dispatch } from "react";

import {
  ArraysMutatorsActions,
  BaseActions,
  SetArrayAction
} from "../reducers";

export const pushArrayItem =
  (dispatch: Dispatch<SetArrayAction>) =>
  <Value>(name: string, item: Value) => {
    dispatch({
      type: BaseActions.set_array_mutator,
      payload: { name, type: ArraysMutatorsActions.push_item, value: item }
    });
  };

export const unshiftArrayItem =
  (dispatch: Dispatch<SetArrayAction>) =>
  <Value>(name: string, item: Value) => {
    dispatch({
      type: BaseActions.set_array_mutator,
      payload: { name, type: ArraysMutatorsActions.unshift_item, value: item }
    });
  };

export const removeArrayItem =
  (dispatch: Dispatch<SetArrayAction>) => (name: string, index: number) => {
    dispatch({
      type: BaseActions.set_array_mutator,
      payload: { name, type: ArraysMutatorsActions.remove_item, index }
    });
  };

export const updateArrayItem =
  (dispatch: Dispatch<SetArrayAction>) =>
  <Value>(name: string, index: number, item: Value) => {
    dispatch({
      type: BaseActions.set_array_mutator,
      payload: {
        name,
        type: ArraysMutatorsActions.update_item,
        index,
        value: item
      }
    });
  };

export const insertArrayItem =
  (dispatch: Dispatch<SetArrayAction>) =>
  <Value>(name: string, index: number, item: Value) => {
    dispatch({
      type: BaseActions.set_array_mutator,
      payload: {
        type: ArraysMutatorsActions.insert_item,
        name,
        value: item,
        index
      }
    });
  };

export const replaceArrayItems =
  (dispatch: Dispatch<SetArrayAction>) =>
  <Value>(name: string, items: Value[]) => {
    dispatch({
      type: BaseActions.set_array_mutator,
      payload: {
        type: ArraysMutatorsActions.replace_items,
        name,
        value: items
      }
    });
  };

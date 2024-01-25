import React from "react";

export const isString = value => typeof value === "string";
export const isNumber = value => typeof value === "number";
export const isBoolean = value => typeof value === "boolean";
export const isPrimitive = value => typeof value === "string" || typeof value === "number" || typeof value === "boolean";
export const isSet = value => value !== "" && value !== null && value !== undefined;
export const isUnset = value => value === "" || value === null || value === undefined;
export const isNullOrUndefined = value => value === null || value === undefined;
export const isArray = (value, validateIfNotEmpty = false) => Array.isArray(value) && (!validateIfNotEmpty || (validateIfNotEmpty && value.length > 0))
export const isObject = value => typeof value === 'object' && value !== null && !Array.isArray(value);   // Fuente: https://stackoverflow.com/questions/8511281/check-if-a-value-is-an-object-in-javascript - https://stackoverflow.com/questions/8511281/check-if-a-value-is-an-object-in-javascript/8511350#8511350
export const isObjectOrArray = value => (typeof value === 'object' && value !== null) || Array.isArray(value);
export const isFunction = value => value && typeof value === "function";  // Fuente: https://stackoverflow.com/questions/5999998/check-if-a-variable-is-of-function-type (Ésta fuente ratifica mi verificación, yeah!!!)
export const isBooleanOrFunction = value => isBoolean(value) || isFunction(value);
export const isPrimitiveOrFunction = value => isPrimitive(value) || isFunction(value);
export const isStringOrFunction = value => isString(value) || isFunction(value);
export const arePlainArraySame = (arr1, arr2) => {
  if (typeof arr1 !== typeof arr2) return false;
  if (!isArray(arr1) || !isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;
  return !arr1.some((v1, i1) => v1 !== arr2[i1]);
}

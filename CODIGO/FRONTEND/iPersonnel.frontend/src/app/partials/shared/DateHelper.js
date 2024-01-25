import React from "react";

export const getDateInfo = (date = new Date()) => {
  const t = new Date(date);
  const [y, M, d, h, m, s] = [
    t.getFullYear().toString().padStart(4, "0"),
    (t.getMonth() + 1).toString(),
    t.getDate().toString(),
    t.getHours().toString().padStart(2, "0"),
    t.getMinutes().toString().padStart(2, "0"),
    t.getSeconds().toString().padStart(2, "0"),
  ];
  return { y, M, d, h, m, s };
};
export const getDateInfoFromString = (stringDate) => {
  const [date = "", time = ""] = stringDate.split(" ");
  const [d = 0, M = 0, y = 0] = date.split("/");
  const [h = 0, m = 0, s = 0] = time.split(":");
  return { y, M, d, h, m, s };
};
export const convertDateToDate = (rawValue = new Date(), { y: uY, M: uM, d: ud, h: uh, m: um, s: us } = {}) => {
  if (!rawValue) return undefined;
  const { y, M, d, h, m, s } = getDateInfo(rawValue);
  return new Date(uY>=0?uY:y, parseInt(uM>=0?uM:M) - 1, ud>=0?ud:d, uh>=0?uh:h, um>=0?um:m, us>=0?us:s);
};
export const convertStringToDate = (rawValue, { y: uY, M: uM, d: ud, h: uh, m: um, s: us } = {}) => {
  if (!rawValue) return undefined;
  const { y, M, d, h, m, s } = getDateInfoFromString(rawValue);
  return new Date(uY>=0?uY:y, parseInt(uM>=0?uM:M) - 1, ud>=0?ud:d, uh>=0?uh:h, um>=0?um:m, us>=0?us:s);
};
export const convertCustomDateString = (rawValue = new Date(), { y: uY, M: uM, d: ud } = {}) => {
  if (!rawValue) return "";
  const { y, M, d } = getDateInfo(rawValue);
  return `${ud>=0?ud:d}/${uM>=0?uM:M}/${uY>=0?uY:y}`;
};
export const convertCustomTimeString = (rawValue = new Date(), { h: uh, m: um, s: us } = {}) => {
  if (!rawValue) return "";
  const { h, m, s } = getDateInfo(rawValue);
  return `${uh>=0?uh:h}:${um>=0?um:m}:${us>=0?us:s}`;
};
export const convertCustomDateTimeString = (rawValue = new Date(), { y: uY, M: uM, d: ud, h: uh, m: um, s: us } = {}) => {
  if (!rawValue) return "";
  const { y, M, d, h, m, s } = getDateInfo(rawValue);
  return `${ud>=0?ud:d}/${uM>=0?uM:M}/${uY>=0?uY:y} ${uh>=0?uh:h}:${um>=0?um:m}:${us>=0?us:s}`;
};

export const toDateString = convertCustomDateString;
export const toTimeString = convertCustomTimeString;
export const toDateTimeString = convertCustomDateTimeString;
// export const toDateString = (date = new Date()) => new Date(date).toLocaleDateString();
// export const toTimeString = (date = new Date()) => new Date(date).toLocaleTimeString();
// export const toDateTimeString = (date = new Date()) => `${(new Date(date)).toLocaleDateString()} ${(new Date(date)).toLocaleTimeString()}`;
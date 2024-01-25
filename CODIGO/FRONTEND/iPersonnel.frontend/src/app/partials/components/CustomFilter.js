import React, { useEffect, useState, useRef } from "react";
import AppBar from "@material-ui/core/AppBar";
import Form, { Item, GroupItem, SimpleItem } from "devextreme-react/form";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

const appBarStyle = {
  backgroundColor: "#337ab7",
  borderRadius: "2px 3.5px 3.5px 3.5px",
};
const appBarForm = { marginBottom: "10px", padding: "10px" };

const getDateInfo = (date) => {
  const t = new Date(date);
  const [y, M, d, h, m, s] = [
    t
      .getFullYear()
      .toString()
      .padStart(4, "0"),
    (t.getMonth() + 1).toString(),
    t.getDate().toString(),
    t
      .getHours()
      .toString()
      .padStart(2, "0"),
    t
      .getMinutes()
      .toString()
      .padStart(2, "0"),
    t
      .getSeconds()
      .toString()
      .padStart(2, "0"),
  ];
  return { y, M, d, h, m, s };
};
const getDateInfoFromString = (stringDate) => {
  const [date = "", time = ""] = stringDate.split(" ");
  const [d = 0, M = 0, y = 0] = date.split("/");
  const [h = 0, m = 0, s = 0] = time.split(":");
  return { y, M, d, h, m, s };
};
export const convertStringToDate = (rawValue) => {
  if (!rawValue) return undefined;
  const { y, M, d, h, m, s } = getDateInfoFromString(rawValue);
  return new Date(y, parseInt(M) - 1, d, h, m, s);
};
export const convertCustomDateString = (rawValue) => {
  if (!rawValue) return "";
  const { y, M, d } = getDateInfo(rawValue);
  return `${d}/${M}/${y}`;
};
export const convertCustomTimeString = (rawValue) => {
  if (!rawValue) return "";
  const { h, m, s } = getDateInfo(rawValue);
  return `${h}:${m}:${s}`;
};
export const convertCustomDateTimeString = (rawValue) => {
  if (!rawValue) return "";
  const { y, M, d, h, m, s } = getDateInfo(rawValue);
  return `${d}/${M}/${y} ${h}:${m}:${s}`;
};

const isFunction = (functionName) => functionName && typeof functionName === "function";
const isPrimitive = (value) => typeof value === "string" || typeof value === "number" || typeof value === "boolean";
const isUnset = (value) => value === "" || value === null || value === undefined;
const isNullOrUndefined = (value) => value === null || value === undefined;

export const customFilterDataType = {
  Date: "date",
  DateTime: "datetime",
};

export const convertFilterObjectToFilterArray = (
  filterData,
  {
    dataTypes = undefined,
    keysToGenerateFilter = [],
    transformData = undefined,
    excludeBlankValues = false,
  } = {}
) => {
  let auxFilter = [];
  if (filterData) {
    let keys = Object.keys(filterData);
    if (keysToGenerateFilter && keysToGenerateFilter.length > 0)
      keys = keys.filter(
        (key) =>
          keysToGenerateFilter.includes(key) &&
          (!excludeBlankValues ||
            typeof filterData[key] !== "string" ||
            (excludeBlankValues &&
              typeof filterData[key] === "string" &&
              filterData[key].trim() !== ""))
      );
    keys.forEach((key) => {
      let value = filterData[key];
      if (
        transformData &&
        Object.keys(transformData).length > 0 &&
        transformData[key] &&
        isFunction(transformData[key])
      ) {
        value = transformData[key].call(undefined, ...[value]);
      } else {
        if (!isPrimitive(value)) {
          if (isNullOrUndefined(value)) {
            value = "";
          } else if (dataTypes && Object.keys(dataTypes).length > 0) {
            switch (dataTypes[key]) {
              case customFilterDataType.Date:
                value = convertCustomDateString(value);
                break;
              case customFilterDataType.DateTime:
                value = convertCustomDateTimeString(value);
                break;
            }
          }
        }
      }
      auxFilter = auxFilter.concat([[key, "=", value], "AND"]);
    });
    auxFilter.splice(-1, 1);
  }
  return auxFilter;
};

// -----------------------------------------------------------------------------------
const getFilterableColumns = gridInstance => {
  let filterables;
  if (gridInstance) {
    filterables = {};
    const allowFilteringVisible = gridInstance.option("filterRow.visible");
    //V16-JDL-//gridInstance._options.columns.filter(({ allowFiltering = allowFilteringVisible, visible = true }) => allowFiltering && visible).forEach(column => filterables[column.dataField] = column);
    gridInstance.getVisibleColumns().filter(({ allowFiltering = allowFilteringVisible, visible = true }) => allowFiltering && visible).forEach(column => filterables[column.dataField] = column);
  }
  return filterables;
}
export const onOptionChanged = (e, callback) => {
  const { name, fullName, value, component } = e;
  if (name === "columns") {
    const [, option] = fullName.split(".");
    switch (option) {
      case "filterValue":
        const [columnIndex] = /[0-9]+/.exec(fullName);
        const [selector] = component.getVisibleColumns().filter(({ index }) => index >= 0 && index.toString() === columnIndex).map(({ dataField }) => dataField);
        if (isFunction(callback)) callback({ dataField: selector, value });
        break;
    }
  }
}
export const performFiltering = ({ gridInstance, data, filter }) => {
  if (gridInstance) {
    const filterableColumns = getFilterableColumns(gridInstance);
    const filterableKeys = filterableColumns ? Object.keys(filterableColumns) : [];
    Object.keys(data || {}).filter(key => filterableKeys.includes(key)).forEach(key => gridInstance.columnOption(key, { filterValue: data[key], selectedFilterOperation: 'contains' }));
    gridInstance.filter(filter);
  }
}
export const dxCustomFilterHelper = { onOptionChanged, performFiltering };
// -----------------------------------------------------------------------------------

const CustomFilter = ({
  title = undefined,
  visible,
  disabled,
  cssClassForm = "",
  cssClassAppBar = "",
  cssClassToolbar = "",
  helper = {},
  transformData,
  dataTypes,
  keysToGenerateFilter,
  filterData: userFilterData,
  renderFormTitle,
  renderFormContent,
  loadWhenStartingComponent = false,
  performFilterWhenFilterDataHasChanged = false,
  excludeBlankValues = false,
  onInitialized,
  onBeforeFilter,
  onAfterFilter,
}) => {
  const [previousFilterData, setPreviousFilterData] = useState(undefined);
  const [filterData, setFilterData] = useState({ ...(userFilterData || {}) });
  const [filterArray, setFilterArray] = useState([]);

  const getFilterFromObject = (data = { ...filterData }) =>
    convertFilterObjectToFilterArray(data, {
      dataTypes,
      keysToGenerateFilter,
      transformData,
      excludeBlankValues,
    });

  const extendedFilter = async ({ previousData = { ...previousFilterData }, data = { ...filterData }, from = undefined } = {}) => {
    if (from) setPreviousFilterData({ ...(filterData || {}) });
    if (isFunction(onBeforeFilter)) onBeforeFilter({ previousData, data });
    const filter = getFilterFromObject(data);
    setFilterArray(filter);
    const newKeys = data && typeof data === "object" ? Object.keys(data).filter((key) => !Object.keys(previousData).includes(key)) : [];
    const keysChanged = [...(previousData && typeof previousData === "object" ? Object.keys(previousData).filter((key) => previousData[key] !== data[key]) : []), ...newKeys];
    const keysChangedAndUnset = keysChanged.filter((key) => isUnset(data[key]));
    const keysChangedAndValuesEmpty = keysChanged.filter((key) => typeof data[key] === "string" && data[key].toString() === "");
    const keysChangedAndValuesNull = keysChanged.filter((key) => typeof data[key] === "object" && data[key] === null);
    const keysChangedAndValuesUndefined = keysChanged.filter((key) => typeof data[key] === "undefined" && data[key] === undefined);
    const infoAboutKeys = { keysChanged, keysChangedAndUnset, keysChangedAndValuesEmpty, keysChangedAndValuesNull, keysChangedAndValuesUndefined };
    if (isFunction(onAfterFilter)) await onAfterFilter({ previousData, data, filter, infoAboutKeys });
  };

  const getInstance = () => ({ filter: async ({ previousData = { ...previousFilterData }, data = { ...filterData } } = {}) => (await extendedFilter({ previousData, data, from: 'instance' })) });

  useEffect(() => {
    setPreviousFilterData({ ...(filterData || {}) });
    setFilterData({ ...(userFilterData || {}) });
  }, [userFilterData]);

  useEffect(() => {
    if (performFilterWhenFilterDataHasChanged) extendedFilter({ previousData: { ...previousFilterData }, data: { ...filterData } });
  }, [filterData]);

  useEffect(() => {
    if (isFunction(onInitialized)) onInitialized();
    if (typeof helper === 'object' && helper !== null) Object.assign(helper, { ...getInstance() });
  }, []);

  useEffect(() => {
    if (visible && loadWhenStartingComponent) extendedFilter();
  }, [loadWhenStartingComponent]);

  return (
    <React.Fragment>
      {
        <Form visible={visible} disabled={disabled} formData={filterData} className={cssClassForm} style={!cssClassForm ? appBarForm : {}} >
          {
            isFunction(renderFormTitle) &&
            <SimpleItem>
              {visible && renderFormTitle({ previousFilterData, filterData, filterArray, getInstance })}
            </SimpleItem>
          }
          {
            !!title && !isFunction(renderFormTitle) &&
            <Item visible={!!title}>
              <AppBar
                position="static"
                className={cssClassAppBar}
                style={!cssClassAppBar ? appBarStyle : {}}
              >
                <Toolbar variant="dense" className={cssClassToolbar}>
                  <Typography variant="h6" color="inherit">{title}</Typography>
                </Toolbar>
              </AppBar>
            </Item>
          }
          <GroupItem>
            {visible && renderFormContent({ previousFilterData, filterData, filterArray, getInstance })}
          </GroupItem>
        </Form>
      }
    </React.Fragment>
  );
};

export default CustomFilter;

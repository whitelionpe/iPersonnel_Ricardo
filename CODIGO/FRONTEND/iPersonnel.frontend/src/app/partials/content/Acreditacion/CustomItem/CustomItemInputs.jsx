import React, { Fragment, useRef, useState } from "react";
import NumberBoxItem from "../Inputs/NumberBox";
import TextBoxItem from "../Inputs/TextBox";
import DateBoxItem from "../Inputs/DateBox";
import ListBoxItem from "../Inputs/ListBox";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

export const ItemNumber = ({
  Item = { Text: "", Index: "none", Lista: [] },
  Elements = [],
  readOnly = false,
  labelTop = false,
  colSpanItem = 4,
}) => {
  return (
    <NumberBoxItem
      label={Item.Text}
      labelTop={labelTop}
      name={Item.Index}
      elements={Elements}
      readOnly={readOnly}
      isRequired={true}
      colSpan={colSpanItem}
    />
  );
};

export const ItemText = ({
  Item = { Text: "", Index: "none", Lista: [] },
  Elements = [],
  readOnly = false,
  labelTop = false,
  colSpanItem = 4,
}) => {
  return (
    <TextBoxItem
      label={Item.Text}
      labelTop={labelTop}
      name={Item.Index}
      elements={Elements}
      readOnly={readOnly}
      isRequired={true}
      colSpan={colSpanItem}
    />
  );
};

export const ItemDate = ({
  Item = { Text: "", Index: "none", Lista: [] },
  Elements = [],
  readOnly = false,
  labelTop = false,
  colSpanItem = 4
}) => {
  return (
    <DateBoxItem
      label={Item.Text}
      labelTop={labelTop}
      name={Item.Index}
      elements={Elements}
      readOnly={readOnly}
      isRequired={true}
      colSpan={colSpanItem}
    />
  );
};

export const ItemList = ({
  Item = { Text: "", Index: "none", Lista: [] },
  Elements = [],
  readOnly = false,
  labelTop = false,
  colSpanItem = 4,
}) => {
  return (
    <ListBoxItem
      label={Item.Text}
      dataName={Item.Index}
      isRequired={true}
      dataSource={Item.Lista}
      displayValue="IdDato"
      displayText="Dato"
      elements={Elements}
      readOnly={readOnly}
      colSpan={colSpanItem}
      labelTop={labelTop}
    />
  );
};

export const ItemFileText = ({
  Item = { Index: "None", Text: "" },
  Value = "",
  labelTop = false,
  colSpanItem=4
}) => {
  const valueText = { [Item.Index]: Value };
  return (
    <TextBoxItem
      label={Item.Text}
      name={Item.Index}
      elements={valueText}
      readOnly={true}
      isRequired={true}
      colSpan={colSpanItem}
      labelTop={labelTop}
    />
  );
};

export const ItemGroup = ({ Item = { Text: "" } }) => {
  const classesEncabezado = useStylesEncabezado();

  return (
    <AppBar
      position="static"
      style={{ marginBottom: "20px" }}
      className={classesEncabezado.secundario}
    >
      <Toolbar variant="dense" className={classesEncabezado.toolbar}>
        <Typography
          variant="h6"
          color="inherit"
          className={classesEncabezado.title}
        >
          {Item.Text}
        </Typography>
      </Toolbar>
    </AppBar>
    // </div>
  );
};

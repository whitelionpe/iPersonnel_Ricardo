import React, { Fragment, useState } from "react";
import {
  ItemNumber,
  ItemText,
  ItemDate,
  ItemList,
  ItemFileText,
  ItemGroup
} from "./CustomItemInputs";
import "../DynamicColumns.css";
import { CustomItem, HiddenInputFile } from "./CustomItemsUtil";

/******************************************************* */

const CustomItemRow = ({
  item = {
    Index: 0,
    EstadoAprobacion: "",
    IdRequisito: "",
    Value: "",
    Observacion: "",
    Tipo: "T",
    Automatico: false
  },
  labelTop = false,
  colSpanItem = 4,
  EstadoAprobacionRequisito = "",
  RechazoIndisciplina = "S",
  modoEdicion = false,
  dataRowEditRequisitos = [],
  EstadoAprobacion,
  IdSolicitud = 0,
  optRequisito = [],
  maxSizeFile = 5,
  //   eventClick = () => {
  //     console.log("ObservedItemCell eventClick");
  //   },
  // eventViewDocument = () => {
  //   console.log("ObservedItemCell eventViewDocument");
  // },
  intl,
  eventViewDocument
}) => {
  const [valueFile, setValueFile] = useState(dataRowEditRequisitos[item.Index]);

  return (
    <Fragment>

      <CustomItem
        item={item}
        EstadoAprobacionRequisito={EstadoAprobacionRequisito}
        RechazoIndisciplina={RechazoIndisciplina}
        modoEdicion={modoEdicion}
        dataRowEditRequisitos={dataRowEditRequisitos}
        EstadoAprobacion={EstadoAprobacion}
        IdSolicitud={IdSolicitud}
        maxSizeFile={maxSizeFile}
        // eventClick={eventClick}
        eventViewDocument={eventViewDocument}
        intl={intl}

      >
        {item.Tipo === "N" ? (
          <ItemNumber labelTop={labelTop} colSpanItem={colSpanItem} />
        ) : item.Tipo === "T" ? (
          <ItemText labelTop={labelTop}  colSpanItem={colSpanItem} />
        ) : item.Tipo === "F" ? (
          <ItemDate labelTop={labelTop} colSpanItem={colSpanItem} />
        ) : item.Tipo === "L" ? (
          <ItemList labelTop={labelTop} colSpanItem={colSpanItem} />
        ) : item.Tipo === "A" ? (
          <ItemFileText Value={valueFile} labelTop={labelTop} colSpanItem={colSpanItem} />
        ) : item.Tipo === "G" ? (
          <ItemGroup />
        ) : (
          <ItemText labelTop={labelTop} colSpanItem={colSpanItem}  />
        )}
      </CustomItem>
      <HiddenInputFile
        item={item}
        maxSizeFile={maxSizeFile}
        dataRowEditRequisitos={dataRowEditRequisitos}
        optRequisito={optRequisito}
        intl={intl}
        setValueFile={setValueFile}
      />
    </Fragment>
  );
};

export default CustomItemRow;

import React from "react";
import { isNotEmpty } from "../../../../_metronic";

const estiloFuente = {
  fontSize: "11px",
  textAlign: "left",
  textTransform: "capitalize"
};

export function DoubleLinePersona(cellData) {
  return (
    <div style={estiloFuente}>
      <b>
        {isNotEmpty(cellData.row.data.Apellido)
          ? cellData.row.data.Apellido.toUpperCase()
          : ""}
      </b>
      &nbsp;
      {/* <br /> */}
      {isNotEmpty(cellData.row.data.Nombre)
        ? cellData.row.data.Nombre.toLowerCase()
        : ""}
    </div>
  );
}  

export function PersonaCondicionLabel(cellData) {
  let tipoPersona = isNotEmpty(cellData.row.data.Condicion)
    ? cellData.row.data.Condicion
    : "";

  return (
    <div style={estiloFuente}>
      <span className={`text-tipo-${tipoPersona.toLowerCase()}`}>
        {isNotEmpty(tipoPersona) ? tipoPersona.toUpperCase() : ""}
      </span>
      &nbsp;
    </div>
  );

  //  }
}

export function DoubleLinePosicion(cellData) { 
  return (
    <div style={estiloFuente}>
      {/* <i class="dx-icon-shrinkfont"> </i> */}
      {isNotEmpty(cellData.row.data.PosicionPadre) && (
        <>
          {" "}
          <i class="dx-icon-redo" />{" "}
          <b> {cellData.row.data.PosicionPadre.toUpperCase()} </b>{" "}
        </>
      )}
    </div>
  );
}

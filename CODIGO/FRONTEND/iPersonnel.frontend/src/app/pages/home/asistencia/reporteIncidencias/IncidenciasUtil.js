import React, { Fragment } from "react";
import { dateFormat, Meses, convertyyyyMMddToFormatDate, convertyyyyMMddToDate, isNotEmpty } from "../../../../../_metronic/utils/utils";
import "./IncidenciaPage.css";
import "./IncidenciaListPage.css";
import styled from "@emotion/styled";
import { Tooltip as ToolTipoReact } from "devextreme-react/tooltip"; 

export const getEstadoCeldaDia = (
  currentIdPersona,
  idReserva,
  turno,
  estado,
  idPersona,
  estadoCama,
  camaExclusiva
) => {
  let estadoCelda = "";
  estadoCelda = "INA";

  return estadoCelda;
};

//Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
//Retorna la clase css de acuerdo al estado generado de la celda
export const getClassCeldaByEstado = estadoCelda => {
  let str_css = "celda_Hijo_General ";
  //debugger;

  switch (estadoCelda) {
    case "LF":
      str_css += "celda_LF";
      break;
    case "LD":
      str_css += "celda_LD";
      break;
    case "LN":
      str_css += "celda_LN";
      break;
    case "INA":
      str_css += "item_opt_color_reserva item_color_font";
      break;
    case "O":
      str_css += "item_opt_color_checkin item_color_font";
      break;
    case "F":
      str_css += "item_opt_color_checkout item_color_font";
      break;
    case "EX":
      str_css += "celda_EX";
      break;
    case "ND":
      str_css += "celda_ND";
      break;
    default: break;
  }
  return str_css;
};

export function esDiaDisponible(estadoCeldActual) {
  return (
    estadoCeldActual === "LF" ||
    estadoCeldActual === "LD" ||
    estadoCeldActual === "LN" ||
    estadoCeldActual === "EX"
  );
}

export const ReservaEstados = () => {
  return [
    { text: "Libre", Id: "LF", color: "white" },
    { text: "Justificado", Id: "JUS", color: "gray" },
    { text: "Libre Día", Id: "LD", color: "white" },
    { text: "Libre Noche", Id: "LN", color: "white" },
    { text: "Ocupado por otro trabajador", Id: "OC", color: "#a8a9aa" },
    { text: "Reservado por otro trabajador", Id: "RE", color: "#d2d2d8" },
    { text: "Ocupado por el mismo trabajador", Id: "OT", color: "#005400" },
    { text: "Exclusiva otro trabajador", Id: "EF", color: "#970e00" },
    { text: "Exclusiva otro trabajador Día", Id: "ED", color: "#970e00" },
    { text: "Exclusiva otro trabajador Noche", Id: "EN", color: "#970e00" },
    { text: "Reservado por el mismo trabjador", Id: "RT", color: "#8cde8f" },
    { text: "Seleccionado para generar reserva", Id: "SE", color: "#000a8d" },
    {
      text: "No disponible por estar reservado u ocupado por el trabajador",
      Id: "XX",
      color: "#000100"
    }
  ];
};

export const IncidenciaAbreviatura = {
  C07: "ADD", //C07  Asistencia en dia de descanso
  C08: "CH", //C08	Cumplió horario
  C06: "AF", //C06	Asistencia en Feriado
  C04: "INA", //C04	Inasistencia
  C05: "MI", //C05	Marcas incompletas
  C02: "SA", //C02	Salida Anticipada
  C01: "T", //C01	Tardanza
  C03: "TS", //C03	Tardanza y Salida Anticipada
  C11: "SI", //C11	Salida Intermedia
  DES: "DES", //DES Día de Descanso
  F: "F", //Feriado
  OBS: "OBS", //Día Propcesado con Observaciones
  JUS: "JUS", //Día Justificado
  PPP: "?", //Día No Procesado o Pendiente Por Procesar
};

export const IncidenciaLeyenda = ({ Incidencias }) => {
  // console.log("IncidenciaLeyenda ::> ", Incidencias);
  return (
    <div
      style={{
        maxWidth: "50%",
        //position: "fixed", 
        bottom: "0"
      }}
    >
      <label>Leyenda:</label>
      <br />

      <div className="row">
        {Incidencias.map(x => (
          <div
            key={`KI_${x.IdIncidencia}`}
            className="col-3"
            style={{ display: "flex", marginBottom: "10px" }}
          >
            <span
              style={{
                background: x.Color,
                padding: "3px 5px 3px 5px",
                fontSize: "0.8rem",
                color: x.IdIncidencia == 'PPP' ? 'red' : 'white',
                height: "20px",
                width: "30px",
                textAlign: "center",
                flex: "0 0 20%",
                fontWeight: "bold"
              }}
            >
              {x.Alias}
            </span>
            <span style={{
              flex: "0 0 75%",
              marginLeft: "10px",
              fontSize: "0.8rem",
              color: "black"
            }}>
              {x.Incidencia}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const crearArregloColumnasHeader = (array_header, intl, eventos, nameDays) => {
  let header_json = [];
  let ListaMeses = Meses();
  for (let i = 0; i < array_header.length; i++) {
    let item = array_header[i];

    let mes = {
      dataField: item.key,
      caption: intl.formatMessage({ id: ListaMeses[item.mes - 1].Descripcion }),
      items: []
    };

    for (let j = 0; j < item.detalle.length; j++) {
      let fecha = convertyyyyMMddToDate(item.detalle[j].key.split("_")[1]);
      //console.log({ fecha, day: fecha.getDay(), name: nameDays[fecha.getDay()] }); 

      mes.items.push({
        dataField: item.detalle[j].key,
        caption: item.detalle[j].dia,
        key: item.detalle[j].key,
        alignment: "center",
        width: 30,
        events: eventos,
        name: nameDays[fecha.getDay()] || ""
      });
    }
    header_json.push(mes);
  }
  return header_json;
};

export const obtenerColumnasHeaderReporte = (array_header, nameDays, intl) => {
  let ListaCabecera = "CODIGO|PERSONA|DOCUMENTO|POSICION";
  let ListaCabeceraField = "IdPersona|NombreCompleto|Documento|Posicion";
  let ListaMeses = Meses();
  for (let i = 0; i < array_header.length; i++) {
    let item = array_header[i];
    for (let j = 0; j < item.detalle.length; j++) {
      let fecha = convertyyyyMMddToDate(item.detalle[j].key.split("_")[1]);
      ListaCabecera = ListaCabecera + "|" + item.key + "," + (nameDays[fecha.getDay()] || "") + "," + (item.detalle[j].dia).toString() + "," + intl.formatMessage({ id: ListaMeses[item.mes - 1].Descripcion });
      ListaCabeceraField = ListaCabeceraField + "|" + item.detalle[j].key;
    }
  }
  return [ListaCabecera, ListaCabeceraField];
};


export const ItemFormReservation = () => { };

export const ItemCellIncidencia = ({
  Id = "DA",
  IdIncidencia,
  Incidencia,
  TotalIncidencias,
  Color = "#fff",
  IdPersona,
  Fecha,
  ParentStyle = {},
  JustificadoCompleto = 'N',
  intl
}) => {

  const styleDefault = {
    position: "relative",
    top: "25%"
  };

  return JustificadoCompleto === "S" ? (
    <Fragment key={`${Id}_DA_${IdPersona}_${Fecha}`}>  
      <DivIncidenciaDetail Color={"#FFA500"} className={"div-day-incidencia"} id={`${Id}_DA_${IdPersona}_${Fecha}`} style={{ ...ParentStyle }}>
        <span style={{ ...styleDefault }}>
          {IncidenciaAbreviatura["JUS"]}
        </span>
      </DivIncidenciaDetail>
      <ToolTipoReact
        target={`#${Id}_DA_${IdPersona}_${Fecha}`}
        showEvent="dxhoverstart"
        hideEvent="dxhoverend"
        position="right"
      >
        <div>
          {intl.formatMessage({ id: "ASISTENCIA.PERSONA.BOLSAHORAS.JUSTIFICACION"}).toUpperCase()}  
        </div>
      </ToolTipoReact>
    </Fragment>
  ) : IdIncidencia === "" ? (////----> Icono de Falta Procesar---LSF
    <DivEmptyDetail Color={"white"} className={"div-day-incidencia"}>
      {/* <i className="la la-remove" /> */}
      <span
        style={{ ...styleDefault }}
      >
        {IncidenciaAbreviatura["PPP"]}
      </span>
    </DivEmptyDetail>
  ) : (
    <Fragment key={`${Id}_DA_${IdPersona}_${Fecha}`}>
      <DivIncidenciaDetail className={"div-day-incidencia"} id={`${Id}_DA_${IdPersona}_${Fecha}`} Color={Color} style={{ ...ParentStyle }}>
        <span
          style={{ ...styleDefault }}
        >
          {IncidenciaAbreviatura[IdIncidencia] || IdIncidencia}
        </span>

        {TotalIncidencias > 1 && (
          <SpanCounterIncidencia>+{TotalIncidencias - 1}</SpanCounterIncidencia>
        )}
      </DivIncidenciaDetail>

      <ToolTipoReact
        target={`#${Id}_DA_${IdPersona}_${Fecha}`}
        showEvent="dxhoverstart"
        hideEvent="dxhoverend"
        position="right"
      >
        <div>
          {Incidencia}
          {TotalIncidencias > 1 ? "..." : ""}
        </div>
      </ToolTipoReact>
    </Fragment >
  );
};

export const getRenderCellIncidencia = () => { };

export const DivIncidenciaDetail = styled.div`
  background: ${props => props.Color};
  color: white;
  font-weight: bold;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  text-align: center;
  vertical-align: middle;
  font-size: 0.8rem;
  border: 0px;
`;
export const DivEmptyDetail = styled.div`
  background: ${props => props.Color};
  color: red;
  font-weight: bold;
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  text-align: center;
  vertical-align: middle;
  font-size: 0.8rem;
  border: 0px;
`;

export const SpanCounterIncidencia = styled.span`
  top: 0;
  position: absolute;
  z-index: 2;
  border-radius: 50%;
  background-color: red;
  right: 0px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
`;

/* export const cellRenderHabitacion = (param) => {
   
    if (param && param.data) {
        if (param.column.dataField == 'Habitacion') {
            //////////console.log("se repinta", param);
            return (param.data.Servicios != '') ?
                <Fragment>
                    <div className="label" id={`${param.data.IdHabitacion}_${param.data.IdCama}`} >
                        {param.text}
                    </div>
                    <Tooltip
                        target={`#${param.data.IdHabitacion}_${param.data.IdCama}`}
                        showEvent="dxhoverstart"
                        hideEvent="dxhoverend"
                        position="right"
                    >
                        <div>{param.data.Servicios.split('|').map(x => (<Fragment><span>{x.split('@')[1]}</span><br /></Fragment>))}</div>
                    </Tooltip>
                </Fragment >
                : param.text;
        }
    }

}
 */
export const onCellPreparedDay = e => {
  if (e.rowType === "data" && isNotEmpty(e.column.dataField)) {
    let columnValid = e.column.dataField.substring(0, 2);

    if (columnValid === "K_") {
      e.cellElement.classList.add("celda_Padre");
    }
  }
};

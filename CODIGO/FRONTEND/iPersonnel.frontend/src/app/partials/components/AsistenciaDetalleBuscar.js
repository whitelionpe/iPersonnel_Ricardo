import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Portlet } from "../content/Portlet";
import { isNotEmpty } from "../../../_metronic";
import { DataGrid, Column, Paging, Pager, FilterRow, Selection } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
//import { obtenerTodos as obtenerTodosHorarioDia } from "../../api/asistencia/horarioDia.api";
import { useSelector } from "react-redux";
import '../../pages/home/asistencia/horarioDia/HorarioDiaPage.css';



const AsistenciaDetalleBuscar = props => {
  const { intl } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);


  function onCellPreparedTurno(e) {
    const { Turno } = e.data;
    return (

      <div>
        { Turno === "DIA" && (
          <span
            title={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.DAY" })}
          >
            <i className="fas fa-sun  text-warning icon-10x" ></i>
          </span>
        )}
        { Turno === "NOCHE" && (
          <span
            title={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.NIGHT" })}
          >
            <i className="fas fa-moon icon-10x" ></i>
          </span>
        )}
      </div>

    );

  }

  const renderGridIngreso = () => {
    return <div className="card-header-ingreso" >{intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ENTRY" })}</div>;
  }
  const renderGridRefrigerio = () => {
    return <div className="card-header-refrigerio" >{intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.REFRESHMENT" })}</div>;
  }
  const renderGridSalida = () => {
    return <div className="card-header-salida" >{intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.DEPARTURE" })}</div>;
  }
  const renderGridHorasExtra = () => {
    return <div className="card-header-horasExtra" >{intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.START.OVERTIME.CONTROL" })}</div>;
  }
  const renderGridDia = () => {
    return <div className="card-header-dia" >{intl.formatMessage({ id: "ADMINISTRATION.REGIME" })}</div>;
  }


  function onCellPreparedEsDescanso(e) {
    if (e.rowType === "data") {
      if (e.data.Descanso === "S") {
        e.cellElement.style.color = "red";
      }
    }
    /*Dia Seleccionado*/
    if (e.rowType === "data") {
      if (e.data.IdDia === props.idDiaSeleccionado) { 
        //console.log("idDiaSeleccionado", props.idDiaSeleccionado);
        e.cellElement.style.color = "green";
      }
    }
  }


  useEffect(() => {
    //cargarCombos();
  }, []);



  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"380px"}
        width={"1000px"}
        title={(intl.formatMessage({ id: "ACCESS.SCHEDULE.DETAIL.MAINTENANCE" }).toUpperCase())}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
        <Portlet>

          <DataGrid
            dataSource={props.listDetalle}
            showBorders={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
            onCellPrepared={onCellPreparedEsDescanso}
          >

            <Selection mode={props.selectionMode} />
            <FilterRow visible={false} showOperationChooser={false} />
            <Column dataField="IdDia" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY" })} visible={false} />

            <Column alignment={"center"} headerCellRender={renderGridDia}>
              <Column dataField="Dia" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY" })} width={"6%"} alignment={"left"} />
              <Column dataField="Turno" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TURN" })} width={"6%"} alignment={"center"} cellRender={onCellPreparedTurno} />
            </Column>

            <Column alignment={"center"} headerCellRender={renderGridIngreso}>
              <Column dataField="InicioControl" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.CONTROL" })} width={"8%"} alignment={"center"} />
              <Column dataField="HoraEntrada" caption={intl.formatMessage({ id: "ACCESS.PERSON.MARK.CHECK" })} width={"8%"} alignment={"center"} />

              <Column dataField="MinutosFlexible" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.FLEXI" })} width={"8%"} alignment={"center"} />
              <Column dataField="MinutosTolerancia" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TOLERANCE" })} width={"10%"} alignment={"center"} />

            </Column>

            <Column alignment={"center"} headerCellRender={renderGridRefrigerio}>
              <Column dataField="InicioRefrigerio" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.START" })} width={"8%"} alignment={"center"} />
              <Column dataField="FinRefrigerio" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.END" })} width={"8%"} alignment={"center"} />
              <Column dataField="MinutosRefrigerio" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.MINUTES" })} width={"10%"} alignment={"center"} />
            </Column>

            <Column alignment={"center"} headerCellRender={renderGridSalida}>
              <Column dataField="HoraSalida" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.EXIT" })} width={"10%"} alignment={"center"} />
            </Column>

            <Column alignment={"center"} headerCellRender={renderGridHorasExtra}>
              <Column dataField="ControlHEAntes" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.BEFORE" })} width={"10%"} alignment={"center"} />
              <Column dataField="ControlHEDespues" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.AFTER" })} width={"10%"} alignment={"center"} />
            </Column>


            <Paging defaultPageSize={7} enabled={true} />
            <Pager showPageSizeSelector={false} />

          </DataGrid>


        </Portlet>
      </Popup>
    </>
  );
};

AsistenciaDetalleBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
AsistenciaDetalleBuscar.defaultProps = {
  showButton: false,
  selectionMode: "row",

};
export default injectIntl(AsistenciaDetalleBuscar);

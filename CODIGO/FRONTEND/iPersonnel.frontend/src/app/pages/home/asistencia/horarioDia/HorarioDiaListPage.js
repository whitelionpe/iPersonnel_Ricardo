import React, { useEffect } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem, Button as ColumnButton, Paging, Pager } from "devextreme-react/data-grid";
import { PortletBody } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types"
import "../../campamento/reserva/ReservaEditPage.css";
import './HorarioDiaPage.css'


const HorarioDiaListPage = props => {
  const { intl } = props;

  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const copiarRegistro = evt => {
    props.copiarRegistro(evt);
  };


  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };


  function onCellPreparedEsDescanso(e) {
    if (e.rowType === "data") {
      if (e.data.Descanso === "S") {
        e.cellElement.style.color = "red";
      }
    }
  }


  function onCellPreparedTurno(e) {
    const { Turno } = e.data;
    return (

      <div>
        {Turno === "DIA" && (
          <span
            title={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.DAY" })}
          >
            <i className="fas fa-sun  text-warning icon-10x" ></i>
          </span>
        )}
        {Turno === "NOCHE" && (
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
  const renderGridAcciones = () => {
    return <div className="card-header-accion" >{intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ACTIONS" })}</div>;
  }


  function renderColumnButtonCopy(e) {
    return isNotEmpty(e.data.InicioControl) && (
      <span
        title={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.COPY" })}
      >
        <i className="flaticon2-copy icon-md text-dark" onClick={() => copiarRegistro(e.data)} ></i>
      </span>
    )
  }

  useEffect(() => {
    if (props.dataGridRef) {
      setTimeout(() => {
        props.dataGridRef.instance.refresh();
      }, 500);
    }
  }, [props.asistenciaHorarioDia]);

  return (
    <>

      <PortletBody>
        <DataGrid
          dataSource={props.asistenciaHorarioDia}
          showBorders={true}
          focusedRowEnabled={true}
          repaintChangesOnly={true}
          keyExpr="RowIndex"
          onEditingStart={editarRegistro}
          onFocusedRowChanged={seleccionarRegistro}
          onCellPrepared={onCellPreparedEsDescanso}
          ref={ref => { props.setDataGridRef(ref); }}
        >
          <Editing
            mode="row"
            useIcons={props.showButtons}
            allowUpdating={props.showButtons}
            texts={textEditing}
          />

          <Column dataField="IdDia" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY" })} width={"10%"} alignment={"center"} visible={false} />

          <Column alignment={"center"} headerCellRender={renderGridDia}>
            <Column dataField="Dia" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY" })} width={"11%"} alignment={"center"} />
            <Column dataField="Turno" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TURN" })} width={"5%"} alignment={"center"} cellRender={onCellPreparedTurno} />
          </Column>

          <Column alignment={"center"} headerCellRender={renderGridIngreso}>
            <Column dataField="InicioControl" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.HOME.CONTROL" })} width={"8%"} alignment={"center"} />
            <Column dataField="HoraEntrada" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ENTRY.TIME" })} width={"10%"} alignment={"center"} />

            <Column dataField="MinutosFlexible" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.MINFLEXIBLE" })} width={"8%"} alignment={"center"} />
            <Column dataField="MinutosTolerancia" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TOLERANCES" })} width={"8%"} alignment={"center"} />

            {/* {(dataRowEditNew.Flexible === "S") && (
              <Column dataField="MinutosFlexible" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.MINFLEXIBLE" })} width={"8%"} alignment={"center"} />
            )
            }
            {(dataRowEditNew.Flexible === "N") && (
              <Column dataField="MinutosTolerancia" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TOLERANCES" })} width={"8%"} alignment={"center"} />
            )
            } */}

          </Column>

          <Column alignment={"center"} headerCellRender={renderGridRefrigerio}>
            <Column dataField="InicioRefrigerio" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.START" })} width={"6%"} alignment={"center"} />
            <Column dataField="FinRefrigerio" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.END" })} width={"6%"} alignment={"center"} />
            <Column dataField="MinutosRefrigerio" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ALLOCATED.MINUTES" })} width={"10%"} alignment={"center"} />
          </Column>

          <Column alignment={"center"} headerCellRender={renderGridSalida}>
            <Column dataField="HoraSalida" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.DEPARTURE.TIME" })} width={"8%"} alignment={"center"} />
          </Column>

          <Column alignment={"center"} headerCellRender={renderGridHorasExtra}>
            <Column dataField="ControlHEAntes" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.BEFORE.ADMISSION" })} width={"10%"} alignment={"center"} />
            <Column dataField="ControlHEDespues" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.AFTER.DEPARTURE" })} width={"10%"} alignment={"center"} />
          </Column>

          <Column type="buttons" width={"8%"} alignment={"center"} headerCellRender={renderGridAcciones}>
            <ColumnButton icon="copy" hint={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.COPY", })} render={renderColumnButtonCopy} />
            <ColumnButton name="edit" />
          </Column>

          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="Dia"
              alignment="left"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>

          <Paging defaultPageSize={45} />
          <Pager showPageSizeSelector={false} />
        </DataGrid>
      </PortletBody>
    </>
  );
};

HorarioDiaListPage.prototype = {
  showButtons: PropTypes.bool,
  modoEdicion: PropTypes.bool,

}
HorarioDiaListPage.defaultProps = {
  showButtons: true,
  modoEdicion: true,

}

export default injectIntl(HorarioDiaListPage);

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
      DataGrid,
      Column,
      Button as ColumnButton,
      Paging,
      Pager,
      FilterRow,
      Summary,
      TotalItem
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../partials/content/Portlet";

import { isNotEmpty } from "../../../../../_metronic";

import { obtener as obtenerMarcacion } from "../../../../api/acceso/vehiculoMarcacion.api";

//Multi-idioma
import { injectIntl } from "react-intl";
import { connect } from "react-redux";

import {
  handleErrorMessages,
  handleSuccessMessages,
  handleWarningMessages,
} from "../../../../store/ducks/notify-messages";

import { listarTipoMarcacion } from "../../../../../_metronic/utils/utils";
import PersonaGrupoMarcacionFilterPage from './PersonaGrupoMarcacionFilterPage';
import HeaderInformation from "../../../../partials/components/HeaderInformation";

const PersonaGrupoMarcacionListPage = (props) => {
  const { intl } = props;
  const [activarFiltros, setactivarFiltros] = useState(false);
  const perfil = useSelector((state) => state.perfil.perfilActual);
  const columnas = props.columnas;
  const [dataFilter, setDataFilter] = useState({
    FechaInicio: "",
    FechaFin: "",
  });

  const editarRegistro = (evt) => {
    let { Automatico } = evt.data;

    if (Automatico == "N") {
      props.editarRegistro(evt.data, true);
    } else {
      //evt.cancel = true;
      handleWarningMessages(
        intl.formatMessage({ id: "ACCESS.PERSON.MARK.WARNINGEDIT" })
      );
      props.editarRegistro(evt.data, false);
    }
  };

  const eliminarRegistro = (evt) => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };

  const onRowRemoving = (evt) => {
    let { Automatico } = evt.data;

    if (Automatico == "N") {
      evt.cancel = false;
    } else {
      evt.cancel = true;
      handleWarningMessages(
        intl.formatMessage({ id: "ACCESS.PERSON.MARK.WARNINGDELETE" })
      );
    }
  };


  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.AccesoNegado === "S") {
        e.cellElement.style.color = "red";
      }
    }
  }

  const textEditing = {
    confirmDeleteMessage:'',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  function onActivarFiltroMarcacion() {

    let hoy = new Date();// Date.now(); 
    let fecInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    setDataFilter({
      FechaInicio: fecInicio,
      FechaFin: hoy,
    });

    setactivarFiltros(!activarFiltros ? true : false);
  }

  async function generarFiltro(data) {
    const { FechaInicio, FechaFin } = data;

    props.consultarRegistro({
      FechaInicio: FechaInicio,
      FechaFin: FechaFin
    });

  }

  function cellRender(param) {
    if (param && param.data) {
      let lstTipos = listarTipoMarcacion();
      let filtro = lstTipos.find(x => x.Valor == param.data.Tipo);

      if (filtro != undefined) {
        return (isNotEmpty(filtro.Descripcion) ? filtro.Descripcion : "");
      }
      return "";
    }
  }

  const verDetalleMarca = (evt) => {
    props.consultarRegistro(evt.row.data, false);
  };

  const cellRenderServicios = (param) => {
    console.log(param);
    if (param && param.data) {

      let arr_servicios = param.text.split('@');

      if (arr_servicios.length > 1) {
        if (arr_servicios[1] == 'S') {
          return <span className="text-danger">{arr_servicios[0]}</span>
        } else {
          return arr_servicios[0];
        }
      }
      return arr_servicios[0];
    }
  }

  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  icon={activarFiltros ? "search" : "search"}
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                  onClick={onActivarFiltroMarcacion}
                />
                          &nbsp;
                          <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={props.cancelarEdicion}
                />
                          &nbsp;
                        </PortletHeaderToolbar>
            }
          />
        } />

      <PortletBody>
        <React.Fragment>
          {activarFiltros ? (
            <PersonaGrupoMarcacionFilterPage
              generarFiltro={generarFiltro}
              dataFilter={dataFilter}
            />
          ) : null}
          <div className="row">
            <DataGrid
              id="gridPersonaMarcacion"
              dataSource={props.personaMarcacionData}
              showBorders={true}
              focusedRowEnabled={true}
              keyExpr="RowIndex"
              focusedRowKey={props.focusedRowKey}
              onCellPrepared={onCellPrepared}
            >
              <Column dataField="IdDivision" caption="" visible={false} />
              <Column dataField="IdComedor" caption="" visible={false} />
              <Column dataField="Fecha" caption={intl.formatMessage({ id: "CASINO.PERSON.GROUP.DATE" })} width={"15%"} alignment={"center"} />
              <Column dataField="Comedor" caption={intl.formatMessage({ id: "CASINO.PERSON.GROUP.COMEDOR" })} width={"25%"} alignment={"center"} />

              {columnas.map((x, i) => (
                <Column dataField={x.IdServicio} caption={x.Servicio} key={i} cellRender={cellRenderServicios} alignment={"center"} />
              ))}

              <Paging defaultPageSize={10} />
              <Pager showPageSizeSelector={false} />

              <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Fecha"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({id:"COMMON.TOTAL.ROW"}) } {0}`}
                        />                      
               </Summary>

            </DataGrid>
          </div>
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(PersonaGrupoMarcacionListPage);

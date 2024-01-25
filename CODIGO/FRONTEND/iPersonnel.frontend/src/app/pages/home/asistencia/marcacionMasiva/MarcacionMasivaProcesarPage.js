import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import Form, { Item, GroupItem, EmptyItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';

import {
  handleErrorMessages,
  handleSuccessMessages,
  handleWarningMessages,
  handleInfoMessages
} from "../../../../store/ducks/notify-messages";

//Utils
import { DataGrid, Column, Editing, Button as ColumnButton, Summary, TotalItem, Selection } from "devextreme-react/data-grid";
import { DoubleLinePersona as DoubleLineLabel, PersonaCondicionLabel } from "../../../../partials/content/Grid/DoubleLineLabel";
import CustomTabNav from '../../../../partials/components/Tabs/CustomTabNav';
import { listarEstado, isNotEmpty, convertyyyyMMddToFormatDate, dateFormat } from "../../../../../_metronic";

import AsistenciaHorarioBuscar from "../../../../partials/components/AsistenciaHorarioBuscar";

import { obtener as obtenerConfiguracion } from "../../../../api/sistema/configuracion.api";
import Confirm from "../../../../partials/components/Confirm";
// import HorarioMasivoFormWizardPage from './HorarioMasivoFormWizardPage';
// import HorarioMasivoFormImportPage from './HorarioMasivoFormImportPage';
import FieldsetAcreditacion from '../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';
import MarcacionMasivaFormImportPage from './MarcacionMasivaFormImportPage';

const MarcacionMasivaProcesarPage = (props) => {

  const { intl, setLoading, nuevaAsignacionImportar } = props;
  const classesEncabezado = useStylesEncabezado();

  const { IdCliente } = useSelector(state => state.perfil.perfilActual);


  const [isVisiblePopUpHorario, setisVisiblePopUpHorario] = useState(false);
  const [indefinidoValue, setIndefinidoValue] = useState(false);
  const [fechaFinValue, setFechaFinValue] = useState();
  const [estado, setEstado] = useState([]);
  // const [selectedRowHorarios, setSelectedRowHorarios] = useState([]);

  // const [itIsReprocessed, setitIsReprocessed] = useState(false);
  const [cicloMax, setCicloMax] = useState(0);

  const [filtroLocal, setFiltroLocal] = useState({
    IdCliente: IdCliente,
    IdCompania: "",
  });


  async function cargarCombos() {
    let estado = listarEstado();
    setEstado(estado);
  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Observado === 'S') {
        e.cellElement.style.color = 'red';
      }
    }
  }


  const agregarHorario = (horarios) => {

    const { IdHorario, Horario, IdCompania, Semanal, Ciclo } = horarios[0];
    props.dataRowEditNew.IdHorario = IdHorario;
    props.dataRowEditNew.Horario = Horario;
    props.dataRowEditNew.IdCompania = IdCompania;
    if (Semanal === 'N') {
      setCicloMax(Ciclo);
    }
    else {
      setCicloMax(1);
    }
    disabledButtonNew();
  };

  async function onValueChangedInfinido(value) {

    if (value === "S") {
      setIndefinidoValue(true);
      let fechaFin;
      await obtenerConfiguracion({ IdCliente: IdCliente, IdConfiguracion: "FECHAMINMAX" })
        .then(result => {
          fechaFin = convertyyyyMMddToFormatDate(result.Valor2);
          setFechaFinValue(fechaFin);
        }).finally(x => {
          if (!isNotEmpty(fechaFin)) handleWarningMessages("Aviso", "No tiene configurado fecha máximo.");
        });

    } else {
      props.dataRowEditNew.FechaFin = '';
      setFechaFinValue();
      setIndefinidoValue(false);
    }

  }

  function disabledButtonNew() {
    if (isNotEmpty(props.dataRowEditNew.IdCompania) && isNotEmpty(props.dataRowEditNew.IdHorario) && isNotEmpty(props.dataRowEditNew.FechaInicio) && isNotEmpty(props.dataRowEditNew.FechaFin)) {
      props.setDisabledNewButton(false);
    } else {
      props.setDisabledNewButton(true);
    }
  }


  function showIcon(rowData) {
    return (
      <div className={rowData.row.data.Observado === "S" ? 'fa flaticon2-delete text-danger' : 'fa flaticon2-check-mark text-primary'} />
    );
  }


  useEffect(() => {
    cargarCombos();
    props.dataRowEditNew.FechaInicio = new Date();
    props.dataRowEditNew.Indefinido = 'N';
  }, []);


  return (
    <Fragment>

      <PortletBody >
        {nuevaAsignacionImportar ? (
 
          <MarcacionMasivaFormImportPage
            titulo={props.titulo}
            modoEdicion={props.modoEdicion}
            dataRowEditNew={props.dataRowEditNew}
            setDataRowEditNew={props.setDataRowEditNew}
            // validarPersona={props.validarPersona} -->No se usa dentro
            varIdCompania={props.varIdCompania}
            companiaData={props.companiaData}
            companyName={props.companyName}

            setDataPersonasTemporal={props.setDataPersonasTemporal}
            dataPersonasTemporal={props.dataPersonasTemporal}

            procesarPersonasMasivo={props.procesarPersonasMasivo}
            cancelarEdicion={props.cancelarEdicion}
            getCompanySeleccionada={props.getCompanySeleccionada}

          />
        ) : (
          <>
          </>
          // <HorarioMasivoFormWizardPage
          //   titulo={props.titulo}
          //   modoEdicion={props.modoEdicion}
          //   dataRowEditNew={props.dataRowEditNew}
          //   setDataRowEditNew={props.setDataRowEditNew}
          //   validarPersona={props.validarPersona}
          //   varIdCompania={props.varIdCompania}
          //   companiaData={props.companiaData}

          //   dataPersonasTemporal={props.dataPersonasTemporal}

          //   procesarPersonas={props.procesarPersonas}
          //   cancelarEdicion={props.cancelarEdicion}
          //   getCompanySeleccionada={props.getCompanySeleccionada}
          //   disabledPeopleButton={props.disabledPeopleButton}
          //   setDisabledPeopleButton={props.setDisabledPeopleButton}
          // />
        )}

        <br />

        <FieldsetAcreditacion title={intl.formatMessage({ id: "ASSISTANCE.MASSIVE.JUSTIFICATION.DETAIL.PEOPLES" })}>

          <DataGrid
            dataSource={props.dataPersonasTemporal}
            showBorders={true}
            focusedRowEnabled={true}
            keyExpr="IdSecuencial"
            onCellPrepared={onCellPrepared}
            //onRowRemoving={eliminarRegistro}
            repaintChangesOnly={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
            columnAutoWidth={true}
          >

            <Column dataField="Observado" caption={""} cellRender={showIcon} width={"5%"} alignment={"center"} />
            {/* <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"7%"} alignment={"Center"} /> */}
            <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} alignment={"center"} width={"10%"} />
            <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"15%"} />
            <Column dataField="FechaMarca" caption={intl.formatMessage({ id: "CASINO.MARKING.DATEMARKING" })} width={"15%"} />
            
            <Column dataField="CodigoEquipo" caption={intl.formatMessage({ id: "SYSTEM.DEVICE" })} width={"10%"} />
            <Column dataField="CodigoPuerta" caption={intl.formatMessage({ id: "ACCESS.DOOR" })} width={"10%"} />
            <Column dataField="CodigoZona" caption={intl.formatMessage({ id: "ACCESS.GROUP.RESTRICTION.ZONE" })} width={"10%"} /> 
             
            <Column dataField="Mensaje" caption={intl.formatMessage({ id: "ASSISTANCE.JUSTIFICATION.MASSIVE.MESSAGE" })} width={"20%"} />
            <Summary>
              <TotalItem
                cssClass="classColorPaginador_"
                column="NombreCompleto"
                alignment="left"
                summaryType="count"
                displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
              />
            </Summary>
          </DataGrid>
        </FieldsetAcreditacion>

      </PortletBody>


      {/* POPUP-> BUSCAR HORARIOS */}
      {isVisiblePopUpHorario && (
        <AsistenciaHorarioBuscar
          selectData={agregarHorario}
          showPopup={{ isVisiblePopUp: isVisiblePopUpHorario, setisVisiblePopUp: setisVisiblePopUpHorario }}
          cancelar={() => setisVisiblePopUpHorario(false)}
          uniqueId={"MarcacionMasivaProcesarPage"}
          filtro={filtroLocal}
          setLoading={setLoading}
        />
      )}

    </Fragment >
  );
};


export default injectIntl(WithLoandingPanel(MarcacionMasivaProcesarPage));

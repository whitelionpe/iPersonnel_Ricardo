/*
import React, { useState } from "react";
import {
  DataGrid,
  Column,
  Button as ColumnButton
} from "devextreme-react/data-grid";
import {
  listarSexoSimple,
  //listarTipoDocumento,
  //listarTipoSangre,
  //listarEstadoCivil
} from "../../../../../../../_metronic";
import {
  PortletBody,
  //PortletHeader,
  //PortletHeaderToolbar
} from "../../../../../../partials/content/Portlet";
//import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

//import { listarbySolicitud } from "../../../../../api/acreditacion/visitaPersona.api";
import VisitaListPageDetallePopup from "./VisitaListPageDetallePopup";

import {
  // storeListar as loadUrl,
  obtenerbysolicitante
  // eliminar as eliminarSolicitud
} from "../../../../../../api/acreditacion/visitaPersona.api";
import { cargarRequisitosDatoEvaluar } from "../../../../../../partials/content/Acreditacion/Visitas/VisitasUtils";
import notify from "devextreme/ui/notify";

const VisitaListPageDetalle = ({
  intl,
  setLoading,
  Solicitud = { IdSolicitud: 0, EstadoAprobacion: "I" },
  PersonasVisitas = [],
  eventRefreshDataGrid,
  eventEditPerson,
  eventViewPerson,
  eventDeletePerson,
  colorRojo,
  colorVerde
}) => {
  const [viewPopupPersona, setViewPopupPersona] = useState(false);
  const [optRequisito, setOptRequisito] = useState([]);
  const [personaRequisitos, setpersonaRequisitos] = useState([]);
  const [personaVisita, setPersonaVisita] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const cellEstadoRender = e => {
    let estado = e.data.EstadoAprobacion;
    let css = "";
    let estado_txt = "";
    if (e.data.EstadoAprobacion.trim() === "") {
      estado = "I";
    }

    switch (estado) {
      case "I":
        css = "estado_item_incompleto";
        estado_txt = intl
          .formatMessage({ id: "COMMON.INCOMPLETE" })
          .toUpperCase();
        break;
      case "P":
        css = "estado_item_pendiente";
        estado_txt = intl.formatMessage({ id: "COMMON.EARRING" }).toUpperCase();
        break;
      case "O":
        css = "estado_item_observado";
        estado_txt = intl
          .formatMessage({ id: "COMMON.OBSERVED" })
          .toUpperCase();
        break;
      case "R":
        css = "estado_item_rechazado";
        estado_txt = intl
          .formatMessage({ id: "COMMON.REJECTED" })
          .toUpperCase();
        break;
      case "A":
        css = "estado_item_aprobado";
        estado_txt = intl
          .formatMessage({ id: "COMMON.APPROVED" })
          .toUpperCase();
        break;
      default: break;
    }

    return css === "" ? (
      <div className={"estado_item_general"}>{estado_txt}</div>
    ) : (
      <div className={`estado_item_general  ${css}`}>{estado_txt}</div>
    );
  };

  //const [personalDataRules, setPersonalDataRules] = useState([]);
  //const [flLoadPersonalDataRules, setFlLoadPersonalDataRules] = useState(false);
  const [tipoDocumentos, setTipoDocumentos] = useState([]);
  const [sexoSimple, setSexoSimple] = useState([]);
  const [permisosDatosPersona, setPermisoDatosPersona] = useState({
    IDTIPODOCUMENTO: false,
    DOCUMENTO: false,
    APELLIDO: false,
    NOMBRE: false,
    DIRECCION: false,
    FECHANACIMIENTO: false,
    SEXO: false,
    TELEFONOMOVIL: false,
    EMAIL: false
  });

  const uploadPersonData = async (IdSolicitud, IdSecuencial) => {
    //setLoading(true);
    let datos = await obtenerbysolicitante({
      IdSolicitud: IdSolicitud,
      IdSecuencial: IdSecuencial
    })
      .then(resp => resp)
      .catch(err => [])
      .finally(re => {
        //setLoading(false);
      });
    //console.log("uploadPersonData", { IdSolicitud, IdSecuencial, datos });
    if (!!datos && datos.length > 0) {
      let datosVisita = datos[0][0];
      let datosPersonas = datos[1];
      let datosRequisitos = datos[2];
      let datosDatosEvaluar = datos[3];
      let datosPersonaDatosEvaluar = datos[4];
      let datosDatosEvaluarDetalle = datos[5];
      let datosTiempoAcreditacion = datos[6];
      setSexoSimple(listarSexoSimple());
      setTipoDocumentos(
        datosPersonas.map(x => ({
          IdTipoDocumento: x.IdTipoDocumento,
          TipoDocumento: x.TipoDocumento
        }))
      );
      let { datosPersona, datosEvaluar } = cargarRequisitosDatoEvaluar(
        datosRequisitos,
        datosDatosEvaluar,
        datosPersonaDatosEvaluar,
        datosDatosEvaluarDetalle
      );
      
      setPersonaVisita(prev => ({
        ...prev,
        ...datosVisita,
        ...datosPersonas[0],
        ...datosPersona,
        Observacion: datosPersonaDatosEvaluar[0].Observacion,
        IdCompania: datosVisita.IdCompaniaMandante,
        NombreCompleto: datosVisita.PersonaVisitada,
        esNuevoRegistro: false,
        TiempoAcreditacion: datosTiempoAcreditacion?.[0]
      }));

      setOptRequisito(datosEvaluar);

      // console.log("======================");
      // console.log({ datosEvaluar, datosPersona });
      // console.log("======================");

      setpersonaRequisitos(datosEvaluar);
    }
  };

  const eventGetRecord = async e => {
    //console.log("eventGetRecord", { e });
    let { IdSecuencial, IdSolicitud } = e.row.data;
    setModoEdicion(false);
    await uploadPersonData(IdSolicitud, IdSecuencial);
    setViewPopupPersona(true);
  };

  const eventEditRecord = async e => {
    let { EstadoAprobacion, IdSecuencial, IdSolicitud } = e.row.data;
    if (EstadoAprobacion === "O" || EstadoAprobacion === "I") {
      setModoEdicion(true);
      await uploadPersonData(IdSolicitud, IdSecuencial);
      setViewPopupPersona(true);
    } else {
      const type = "warning"; //e.value ? 'success' : 'error';
      const text = intl.formatMessage({ id: "MESSAGES.EDIT" }); //"Solicitud enviada, no se puede editar."; //props.product.Name + (e.value ? ' is available' : ' is not available');
      notify(text, type, 2000);
    }
  };

  const refreshDataGrid = () => {
    eventRefreshDataGrid();
  };

  return (
    <>
      <PortletBody>
        <div className="grid_detail_title">Visitas</div>
        <DataGrid
          id="dgDetalleVisitaPersona"
          dataSource={PersonasVisitas}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="Documento"
          header={"dgHeaderDetail"}
          // onCellPrepared={onCellPrepared}
          className="css-grid-detail"
        >
          <Column
            caption={intl.formatMessage({
              id: "ACCREDITATION.LIST.SURNAMESNAMES"
            })}
            dataField="Nombres"
            width={"50%"}
            alignment={"left"}
            allowSorting={true}
            allowFiltering={true}
            allowHeaderFiltering={false}
          // headerCellRender={renderTitleHeader}
          />
          <Column
            dataField="TipoDocumento"
            caption={intl.formatMessage({
              id: "ADMINISTRATION.PERSON.DOCUMENT.TYPE"
            })}
            width={"15%"}
            allowSorting={false}
            allowSearch={false}
            allowFiltering={false}
          />
          <Column
            caption={intl.formatMessage({
              id: "ADMINISTRATION.PERSON.DOCUMENT"
            })}
            dataField="Documento"
            width={"20%"}
            alignment={"left"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
          />

          <Column
            dataField="EstadoAprobacion"
            caption={intl.formatMessage({ id: "COMMON.STATE" })}
            width={"15%"}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={false}
            alignment={"center"}
            cellRender={cellEstadoRender}
          />

          <Column type="buttons" width={85} visible={true}>
            <ColumnButton
              icon="fa fa-eye"
              hint={intl.formatMessage({ id: "ACTION.VIEW" })}
              onClick={eventGetRecord}
            />
          </Column>
        </DataGrid>
      </PortletBody>

      {viewPopupPersona && (
        <VisitaListPageDetallePopup
          dataRowEditNew={personaVisita}
          permisosDatosPersona={permisosDatosPersona}
          optRequisito={optRequisito}
          setOptRequisito={setOptRequisito}
          personaRequisitos={personaRequisitos}
          setpersonaRequisitos={setpersonaRequisitos}
          modoEdicion={modoEdicion}
          // personalDataRules={personalDataRules}
          // setFlLoadPersonalDataRules={setFlLoadPersonalDataRules}
          // flLoadPersonalDataRules={flLoadPersonalDataRules}
          tipoDocumentos={tipoDocumentos}
          sexoSimple={sexoSimple}
          // cancelarEdicion={cancelarEdicion}
          // cargarDatos={verEdit}
          // eventoRetornar={eventoRetornar}
          // ActualizarGrilla={actualizarGrillas}
          // setVerPopup={setPopupVisible}
          // setFileView={setFileView}
          showPopup={{
            isVisiblePopUp: viewPopupPersona,
            setisVisiblePopUp: setViewPopupPersona
          }}
          tabActivo={0}
          intl={intl}
          setLoading={setLoading}
          refreshDataGrid={refreshDataGrid}
          SaveEnabled={(Solicitud.EstadoAprobacion === "O")}
          colorRojo={colorRojo}
          colorVerde={colorVerde}
        />
      )}
    </>
  );
};

export default VisitaListPageDetalle;
*/
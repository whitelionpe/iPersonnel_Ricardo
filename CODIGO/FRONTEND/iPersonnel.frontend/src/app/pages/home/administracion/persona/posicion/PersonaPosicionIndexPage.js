import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { isNotEmpty, dateFormat } from "../../../../../../_metronic";

import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";
import {
  handleErrorMessages,
  handleSuccessMessages,
  handleInfoMessages,
} from "../../../../../store/ducks/notify-messages";
import PropTypes from "prop-types";

import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
//listar, eliminar, obtener, crear, actualizar, obtenerActual
import { servicioPersonaPosicion } from "../../../../../api/administracion/personaPosicion.api";

import { crear as nuevoPersonaCentroCosto, actualizar as actualizarPersonaCentroCosto, obtener as obtenerPersonaCentroCosto, eliminar as eliminarPersonaCentroCosto } from "../../../../../api/administracion/personaCentroCosto.api";

import PersonaPosicionListPage from "./PersonaPosicionListPage";
import PersonaPosicionEditPage from "./PersonaPosicionEditPage";
import PersonaCentroCostoEditPage from '../centroCosto/PersonaCentroCostoEditPage';
import { servicePersonaContrato } from "../../../../../api/administracion/personaContrato.api";

const PersonaPosicionIndexPage = props => {

  const { intl, setLoading, getInfo, accessButton, settingDataField, selectedIndex, varIdPersona } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const [listarTabs, setListarTabs] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});
  const [modoEdicionHijo, setModoEdicionHijo] = useState(false);

  const [varIdMotivoCese, setVarIdMotivoCese] = useState("");
  const [fechaFinContrato, setFechaFinContrato] = useState("");

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});

  const [collapsed, setCollapsed] = useState(false);
  const [expandRow, setExpandRow] = useState(0);

  const [isDeleteCentroCostos, setIsDeleteCentroCostos] = useState(false);

  //::::::::::-Funciones, REGIMEN PERSONA:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  async function listarPersonaPosicion() {
    setLoading(true);
    const { IdCliente, IdPersona } = selectedIndex;
    await servicioPersonaPosicion.listar({
      IdPersona, IdCliente, IdCompania: '%', IdPosicion: '%', IdUnidadOrganizativa: '%', NumPagina: 0, TamPagina: 0
    }).then(posicion => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setListarTabs(posicion);
      setModoEdicion(false);
      setModoEdicionHijo(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function agregarPersonaPosicion(posicion, confirm, valueConfirm, message) {

    setSelected(posicion);

    if (valueConfirm > 0 && !isNotEmpty(confirm)) {
      setShowConfirm(true)
      setTitulo(message);
    } else {
      if (!isNotEmpty(confirm)) confirm = true;
    }

    if (!confirm) return false;

    setLoading(true);
    const { IdCliente, IdCompania, IdPersona, IdUnidadOrganizativa, IdPosicion, IdSecuencial,
      FechaInicio, FechaFin, FechaCese, IdMotivoCese, CodigoPlanilla, Activo } = posicion;
    let params = {
      IdCliente
      , IdCompania
      , IdPersona
      , IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : ""
      , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
      , IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : ""
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
      , FechaCese: isNotEmpty(FechaCese) ? dateFormat(FechaCese, 'yyyyMMdd') : ""
      , IdMotivoCese: isNotEmpty(IdMotivoCese) ? IdMotivoCese : ""
      , CodigoPlanilla: isNotEmpty(CodigoPlanilla) ? CodigoPlanilla.toUpperCase() : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await servicioPersonaPosicion.crear(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarPersonaPosicion();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function actualizarPersonaPosicion(posicion) {
    setLoading(true);
    const { IdCliente, IdCompania, IdPersona, IdUnidadOrganizativa, IdPosicion, IdSecuencial,
      FechaInicio, FechaFin, FechaCese, IdMotivoCese, CodigoPlanilla, Activo } = posicion;
    let params = {
      IdCliente
      , IdCompania
      , IdPersona
      , IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : ""
      , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
      , IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : ""
      , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : ""
      , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
      , FechaCese: isNotEmpty(FechaCese) ? dateFormat(FechaCese, 'yyyyMMdd') : ""
      , IdMotivoCese: isNotEmpty(IdMotivoCese) ? IdMotivoCese : ""
      , CodigoPlanilla: isNotEmpty(CodigoPlanilla) ? CodigoPlanilla.toUpperCase() : ""
      , Activo
      , IdUsuario: usuario.username
    };
    await servicioPersonaPosicion.actualizar(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      listarPersonaPosicion();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarPersonaPosicion(posicion, confirm) {
    // console.log("eliminarPersonaPosicion|posicion:",posicion);

    setIsDeleteCentroCostos(false);
    setSelectedDelete(posicion);
    setShowConfirmDelete(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdCompania, IdPersona, IdPosicion, IdUnidadOrganizativa, IdSecuencial } = posicion;
      await servicioPersonaPosicion.eliminar({ IdCliente, IdCompania, IdPersona, IdPosicion, IdUnidadOrganizativa, IdSecuencial, IdUsuario: usuario.username }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPersonaPosicion();
    }
  }

  async function obtenerPersonaPosicion(fitro) {
    setLoading(true);
    const { IdCliente, IdCompania, IdPersona, IdPosicion, IdSecuencial } = fitro;
    await servicioPersonaPosicion.obtener({ IdCliente, IdCompania, IdPersona, IdPosicion, IdSecuencial }).then(posicion => {
      const { IdMotivoCese } = posicion;
      setVarIdMotivoCese(IdMotivoCese);
      var data = {
        ...posicion,
        // ...fitro,
        esNuevoRegistro: false
      }
      setDataRowEditNew(data);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false) });

  }


  const editarPersonaPosicion = async (dataRow) => {
    const { IdMotivoCese } = dataRow;
    setVarIdMotivoCese(IdMotivoCese);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setDataRowEditNew({});
    await obtenerPersonaPosicion(dataRow);
    setModoEdicion(true);
  };

  async function nuevoPersonaPosicion() {
    var today = new Date();
    const { IdPersona } = selectedIndex;

    //Obtener Datos por contrato Vigente.
    setLoading(true);
    setDataRowEditNew({});

    await servicePersonaContrato.obtenerTodos({
      IdCliente: IdCliente,
      IdPersona: IdPersona,
      IdCompaniaMandante: "",
      IdCompaniaContratista: "",
      IdDivision: "",
      IdContrato: ""
    }).then(response => {
      //  console.log("nuevoPersonaPosicion|response:",response);
      if (response.length > 0) {
        const { IdUnidadOrganizativa, UnidadOrganizativa, IdDivision, IdFuncion, IdTipoPosicion, IdContrato, FechaInicio, FechaFin, IdCompaniaContratista, CompaniaContratista,Asunto } = response[0];
        let contratoVigente = { 
          IdCompania: IdCompaniaContratista,
           Compania: CompaniaContratista,
            IdUnidadOrganizativa, 
            UnidadOrganizativa,
             IdDivision,
              IdFuncion,
               IdTipoPosicion,
                IdContrato,
                FechaInicio,
                FechaFin,
                FechaInicioContrato :FechaInicio,
                FechaFinContrato :FechaFin, 
                Asunto : Asunto
                };

        setDataRowEditNew({
          ...selectedIndex,
          Activo: "S", ...contratoVigente, FechaInicio: today, FechaFin: FechaFin, FlgContratista: 'S', FechaMin: FechaInicio, FechaMax: FechaFin, esNuevoRegistro: true
        });
      }
      else {
        setDataRowEditNew({
          ...selectedIndex,
          FechaInicioContrato :null,
          FechaFinContrato :null, 
          Asunto : "",
          Activo: "S",
           FechaInicio: today, 
           FechaFin: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
           FlgContratista: 'N',
          esNuevoRegistro: true
        });
      }
      setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
      setModoEdicion(true);
      setModoEdicionHijo(false);
      setVarIdMotivoCese("");
    }).finally(() => { setLoading(false) });



  };

  const seleccionarPersonaPosicion = dataRow => {
    //console.log("seleccionarPersonaPosicion", dataRow);
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
    setSelected(dataRow);
    setModoEdicion(false);
    setModoEdicionHijo(false);

  }


  const cancelarEdicion = () => {
    setModoEdicion(false);
    setDataRowEditNew({});
  }

  //:::::::::::::::::::::::::::::::::Funcion- Persona Centro Costo::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const nuevoRegistroCentroCosto = async (data) => {

    let currentPosicionPersona = { ...data, FechaInicioPosicion: data.FechaInicio, FechaFinPosicion: data.FechaFin, Activo: "S", esNuevoRegistro: true };
    setModoEdicion(true);
    setModoEdicionHijo(true);
    setDataRowEditNew(currentPosicionPersona);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));

  }

  const cancelarEdicionFormHijo = () => {
    setModoEdicion(false);
    setModoEdicionHijo(false);
    setDataRowEditNew({});
  }

  const agregarRegistroCentroCosto = async (dataRow) => {

    setLoading(true);
    const { IdPersona, IdCentroCosto, IdCliente, IdSecuencial, FechaInicio, FechaFin, Activo, IdPosicion, IdCompania, IdUnidadOrganizativa } = dataRow;
    let params = {
      IdCliente,
      IdPersona,
      IdCompania,
      IdPosicion,
      IdSecuencial,
      IdSecuencialCentroCosto: 0,
      IdUnidadOrganizativa,
      IdCentroCosto,
      FechaInicio: dateFormat(FechaInicio, "yyyyMMdd"), //new Date(FechaInicio).toLocaleString(),
      FechaFin: dateFormat(FechaFin,"yyyyMMdd"), //new Date(FechaFin).toLocaleString(),
      Activo,
      IdUsuario: usuario.username,
      IdDivision,
    };
    await nuevoPersonaCentroCosto(params).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarPersonaPosicion();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });


  }

  const editarPersonaCentroCosto = async (dataRow, selectPosicion) => {

    setLoading(true);
    let { IdPersona, IdCompania, IdPosicion, IdSecuencial, IdSecuencialCentroCosto, } = dataRow;
    let centroCosto = await obtenerPersonaCentroCosto({
      IdPersona, IdCompania, IdCliente,
      IdPosicion, IdSecuencial, IdSecuencialCentroCosto
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });


    let currentPosicionPersona = {
      ...selectPosicion, ...centroCosto,
      FechaInicioPosicion: selectPosicion.FechaInicio, FechaFinPosicion: selectPosicion.FechaFin,
      esNuevoRegistro: false
    };
    setModoEdicion(true);
    setModoEdicionHijo(true);

    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setDataRowEditNew(currentPosicionPersona);

  };

  const eliminarPersonaCentroCostos = async (dataRow, confirm) => {
    //console.log("eliminarPersonaCentroCostos|dataRow:", dataRow);
    setIsDeleteCentroCostos(true);
    setSelectedDelete(dataRow);
    if (confirm) {
      setLoading(true);
      let { IdPersona, IdCliente, IdCentroCosto, IdSecuencial, IdSecuencialCentroCosto } = dataRow;
      await eliminarPersonaCentroCosto({ IdPersona, IdCliente, IdCentroCosto, IdSecuencial, IdSecuencialCentroCosto }).then(() => {
        //console.log("result|eliminarPersonaCentroCosto:");
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarPersonaPosicion();
    } else {
      setSelected(dataRow);
      setModoEdicionHijo(true);
      setShowConfirmDelete(true);
    }
  }

  const actualizarRegistroCentroCosto = async (dataRow) => {
    //EGSC
    setLoading(true);
    const { IdPersona, IdCentroCosto, IdCliente, IdSecuencial, FechaInicio, FechaFin,
      IdSecuencialCentroCosto, Activo, IdPosicion, IdCompania, IdUnidadOrganizativa } = dataRow;

    let params = {
      IdCliente,
      IdPersona,
      IdCompania,
      IdPosicion,
      IdSecuencial,
      IdSecuencialCentroCosto,
      IdUnidadOrganizativa,
      IdCentroCosto,
      FechaInicio: dateFormat(FechaInicio,"yyyyMMdd"), //new Date(FechaInicio).toLocaleString(),
      FechaFin: dateFormat(FechaFin, "yyyyMMdd"), //new Date(FechaFin).toLocaleString(),
      Activo,
      IdUsuario: usuario.username,
      IdDivision,
    };
    await actualizarPersonaCentroCosto(params).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      listarPersonaPosicion();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  async function eliminarListRowTab(selected, confirm) {
    console.log("eliminarListRowTab|")
    isDeleteCentroCostos ? eliminarPersonaCentroCostos(selected, confirm) : eliminarPersonaPosicion(selected, confirm);
  }

  useEffect(() => {
    listarPersonaPosicion();
  }, []);


  return <>

    {modoEdicion && (
      <>
        {(modoEdicionHijo) ?
          <PersonaCentroCostoEditPage
            modoEdicion={modoEdicion}
            dataRowEditNew={dataRowEditNew}
            setDataRowEditNew={setDataRowEditNew}
            titulo={titulo}
            cancelarEdicion={cancelarEdicionFormHijo}
            agregar={agregarRegistroCentroCosto}
            actualizar={actualizarRegistroCentroCosto}
            getInfo={getInfo}
            showButton={true}
          />
          : (
            <PersonaPosicionEditPage
              modoEdicion={modoEdicion}
              dataRowEditNew={dataRowEditNew}
              setDataRowEditNew={setDataRowEditNew}
              actualizarPosicion={actualizarPersonaPosicion}
              agregarPosicion={agregarPersonaPosicion}
              cancelarEdicion={cancelarEdicion}
              titulo={titulo}
              idMotivoCese={varIdMotivoCese}

              //req y edit
              settingDataField={settingDataField}//dataMenu.datos
              accessButton={accessButton}
              varIdPersona={varIdPersona}
            />
          )}
        <div className="container_only">
          <div className="float-right">
            <ControlSwitch checked={auditoriaSwitch}
              onChange={e => { setAuditoriaSwitch(e.target.checked) }}
            /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
          </div>
        </div>
        {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
      </>

    )}
    {!modoEdicion && (
      <>
        <PersonaPosicionListPage
          personaPosicions={listarTabs}
          editarRegistro={editarPersonaPosicion}
          eliminarRegistro={eliminarPersonaPosicion}
          nuevoRegistro={nuevoPersonaPosicion}
          cancelarEdicion={props.cancelarEdicion}
          seleccionarRegistro={seleccionarPersonaPosicion}
          nuevoRegistroCentroCosto={nuevoRegistroCentroCosto}
          editarRegistroCentroCosto={editarPersonaCentroCosto}
          eliminarRegistroCentroCosto={eliminarPersonaCentroCostos}
          focusedRowKey={focusedRowKey}
          expandRow={{ expandRow, setExpandRow }}
          collapsedRow={{ collapsed, setCollapsed }}
          getInfo={getInfo}
          accessButton={accessButton}
          showButtons={props.showButtons}
        />
      </>
    )}

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={showConfirmDelete}
      setIsVisible={setShowConfirmDelete}
      setInstance={setInstance}
      onConfirm={() => eliminarListRowTab(selected, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />

    <Confirm
      message={titulo}
      isVisible={showConfirm}
      setIsVisible={setShowConfirm}
      setInstance={setInstance}
      onConfirm={() => agregarPersonaPosicion(selected, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />
  </>

};

PersonaPosicionIndexPage.propTypes = {
  showButtons: PropTypes.bool
};
PersonaPosicionIndexPage.defaultProps = {
  showButtons: true
};

export default injectIntl(WithLoandingPanel(PersonaPosicionIndexPage));

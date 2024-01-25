import React, { useEffect, useState } from "react";
import {
  handleErrorMessages,
  handleSuccessMessages,
  handleInfoMessages,
  handleWarningMessages,
} from "../../../../../store/ducks/notify-messages";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../../_metronic/utils/securityUtils'
import { useSelector } from "react-redux";
import AuditoriaPage from "../../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import Confirm from "../../../../../partials/components/Confirm";
import {
  ServicePersonaCredencial,
  devolucionFotocheck
} from "../../../../../api/identificacion/personaCredencial.api";
import { dateFormat, isNotEmpty, validarUsoLicencia } from "../../../../../../_metronic";
import {
  useStylesEncabezado,
  useStylesTab,
} from "../.././../../../store/config/Styles";

//Multi-idioma
import { injectIntl } from "react-intl";
//import { obtener as obtenerMenu } from "../../../../api/sistema/menu.api";
import { servicePersona } from "../../../../../api/administracion/persona.api";
//import { obtenerActual as obtenerVisita } from "../../../../../api/administracion/personaVisita.api";


import IdentificacionCredencialEditPage from './IdentificacionCredencialEditPage';
import IdentificacionCredencialListPage from './IdentificacionCredencialListPage';
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

import { obtener as obtenerSistemaConfiguracion } from "../../../../../api/sistema/configuracion.api";

const IdentificacionCredencialIndexPage = (props) => {
  const { intl, setLoading, dataMenu, varIdPersona, foto, getInfo } = props;

  const usuario = useSelector((state) => state.auth.user);
  const perfil = useSelector((state) => state.perfil.perfilActual);
  //const [pathFile, setPathFile] = useState();

  const [focusedRowKey, setFocusedRowKey] = useState();


  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [credencialAutogenerado, setCredencialAutogenerado] = useState(true);
  const [titulo, setTitulo] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );

  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const classesEncabezado = useStylesEncabezado();

  const [tituloTabs, setTituloTabs] = useState(
    intl.formatMessage({ id: "ACTION.LIST" })
  );
  const [listarTabs, setListarTabs] = useState([]);
  //const [validarUsoLic, setValidarUsoLic] = useState([]);

  const classes = useStylesTab();
  //const [value, setValue] = useState(0);

  const [valorMinimoTexto, setValorMinimoTexto] = useState(4);

  const [isVisible, setIsVisible] = useState(false);
  const [confirmarImpresion, setConfirmarImpresion] = useState(false);

  const [instance, setInstance] = useState({});
  //Datos principales
  //const [selected, setSelected] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});


  const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
  //const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
  const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::


  const cancelarEdicion = () => {
    //changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
    setDataRowEditNew({});

  };


  useEffect(() => {
    loadControlsPermission();
    listarIdentificacionCredencial();
    loadConfiguracion();
  }, []);



  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //:::: PERSONA IDENTIFICACION CREDENCIAL  ::::::::::::::::::::::::::::::::::::::::::::::::::::

  const listarIdentificacionCredencial = async () => {
    setLoading(true);
    setModoEdicion(false);
    let credenciales = await ServicePersonaCredencial.listar({
      idCliente: perfil.IdCliente,
      idPersona: varIdPersona,
      idSecuencial: 0,
    }).catch((err) => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
    setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
    setListarTabs(credenciales);

  }

  const agregarPersonaCredencial = async (datos) => {
    const {
      Credencial,
      IdMotivo,
      IdTipoCredencial,
      FechaInicio,
      FechaFin,
      Impreso,
      FechaImpreso,
      CodigoReferencia1,
      CodigoReferencia2,
      Observacion,
      Activo,
    } = datos;
    console.log("agregarPersonaCredencial|datos:", datos);
    let params = {
      IdCliente: perfil.IdCliente,
      IdPersona: varIdPersona,
      IdSecuencial: 0,
      Credencial: isNotEmpty(Credencial) ? Credencial.toUpperCase() : "",
      IdMotivo: IdMotivo,
      IdTipoCredencial,
      FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
      Impreso: 'N',//Impreso no por defecto!
      FechaImpreso: isNotEmpty(FechaImpreso) ? dateFormat(FechaImpreso, 'yyyyMMdd') : "",
      CodigoReferencia1: isNotEmpty(CodigoReferencia1) ? CodigoReferencia1.toUpperCase() : "",
      CodigoReferencia2: isNotEmpty(CodigoReferencia2) ? CodigoReferencia2.toUpperCase() : "",
      Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : "",
      Activo,
      IdUsuario: usuario.username,
    };
    setLoading(true);
    await ServicePersonaCredencial.crear(params)
      .then((response) => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarIdentificacionCredencial();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  const actualizarPersonaCredencial = async (datos, print = 'N') => {
    //console.log("actualizarPersonaCredencial-->",datos, "PRINT-->", print );
    if (print === 'S') {
      setSelectedDelete(datos);
      setConfirmarImpresion(true);
      return;
    }
    //console.log("ActualizacionPersonaCredencial-update");
    const {
      IdCliente,
      IdPersona,
      IdSecuencial,
      Credencial,
      IdMotivo,
      IdTipoCredencial,
      FechaInicio,
      FechaFin,
      Impreso,
      FechaImpreso,
      CodigoReferencia1,
      CodigoReferencia2,
      Observacion,
      Activo,
    } = datos;

    let params = {
      IdCliente: IdCliente,
      IdPersona: IdPersona,
      IdSecuencial: IdSecuencial,
      Credencial: isNotEmpty(Credencial) ? Credencial.toUpperCase() : "",
      IdMotivo: IdMotivo,
      IdTipoCredencial,
      FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
      Impreso: Impreso,
      FechaImpreso: isNotEmpty(FechaImpreso) ? dateFormat(FechaImpreso, 'yyyyMMdd') : "",
      CodigoReferencia1: isNotEmpty(CodigoReferencia1) ? CodigoReferencia1.toUpperCase() : "",
      CodigoReferencia2: isNotEmpty(CodigoReferencia2) ? CodigoReferencia2.toUpperCase() : "",
      Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : "",
      Activo: Activo,
      IdUsuario: usuario.username,
    };
    setLoading(true);
    await ServicePersonaCredencial.actualizar(params)
      .then((response) => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarIdentificacionCredencial();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }
  //actualizarImpresion
  const actualizarImpresion = async (datos) => {
    //console.log("ActualizarImpresion.data", datos);
    const {
      IdCliente,
      IdPersona,
      IdSecuencial,
      Credencial,
      IdMotivo,
      IdTipoCredencial,
      FechaInicio,
      FechaFin,
      Impreso,
      FechaImpreso,
      CodigoReferencia1,
      CodigoReferencia2,
      Observacion,
      Activo,
    } = datos;

    let params = {
      IdCliente: IdCliente,
      IdPersona: IdPersona,
      IdSecuencial: IdSecuencial,
      Credencial: isNotEmpty(Credencial) ? Credencial.toUpperCase() : "",
      IdMotivo: IdMotivo,
      IdTipoCredencial,
      FechaInicio: dateFormat(FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(FechaFin, 'yyyyMMdd'),
      Impreso: 'IMPRIMIR',
      FechaImpreso: isNotEmpty(FechaImpreso) ? dateFormat(FechaImpreso, 'yyyyMMdd') : "",
      CodigoReferencia1: isNotEmpty(CodigoReferencia1) ? CodigoReferencia1.toUpperCase() : "",
      CodigoReferencia2: isNotEmpty(CodigoReferencia2) ? CodigoReferencia2.toUpperCase() : "",
      Observacion: isNotEmpty(Observacion) ? Observacion.toUpperCase() : "",
      Activo: Activo,
      IdUsuario: usuario.username,
    };
    setLoading(true);
    await ServicePersonaCredencial.actualizar(params)
      .then((response) => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        listarIdentificacionCredencial();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }

  async function eliminarPersonaCredencial(personaCredencial, confirm) {
    setSelectedDelete(personaCredencial);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPersona, IdSecuencial } = selectedDelete;
      await ServicePersonaCredencial.eliminar({
        IdCliente: IdCliente,
        IdPersona: IdPersona,
        IdSecuencial,
      }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" })
        );
      }).catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarIdentificacionCredencial();
    }
  }

  async function obtenerCredenciales(dataRow) {
    setLoading(true);
    const { IdCliente, IdPersona, IdSecuencial } = dataRow;
    await ServicePersonaCredencial.obtener({
      IdCliente, IdPersona, IdSecuencial
    })
      .then(credencial => {
        setDataRowEditNew({
          ...credencial,
          esNuevoRegistro: false,
        });
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false) });
  }

  const editarPersonaCredencial = async (dataRow) => {
    const { RowIndex } = dataRow;

    setLoading(true);

    await servicePersona.obtenerPeriodo({
      IdCliente: perfil.IdCliente,
      IdPersona: varIdPersona,
      FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
      FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
    }).then(response => {
      if (response) {
        if (!isNotEmpty(response.MensajeValidacion)) {
          setFechasContrato({ FechaInicioContrato: response.FechaInicio, FechaFinContrato: response.FechaFin });
        } else {
          setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
        }
      }
    }).finally(x => {
      setLoading(false);
    });

    setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
    setDataRowEditNew({});
    obtenerCredenciales(dataRow);
    setFocusedRowKey(RowIndex);
    setModoEdicion(true);

  };

  // async function obtenerPersonaVisita() {
  //   console.log("obtenerPersonaVisita,", idPersona);
  //   setLoading(true);
  //    setRegistraVisita(false);
  //   await obtenerVisita({ IdCliente, IdPersona: idPersona }).then(response => {
  //     if (response){
  //        setRegistraVisita(true);
  //        setDataRowEditVisita({ ...response, esNuevoRegistro: false });
  //     }
  //   }).catch(err => {
  //     handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
  //   }).finally(() => { setLoading(false) });
  // }

  const seleccionarPersonaCredencial = (dataRow) => {
    const { RowIndex } = dataRow;
    setFocusedRowKey(RowIndex);
  };

  // const nuevoRegistroTabs = async (FechaFinContrato) => {
  //   setDataRowEditNew({});
  //   let hoy = new Date();
  //   let fecInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  //   let fecFin = new Date(FechaFinContrato.substring(0, 4), FechaFinContrato.substring(4, 6) - 1, FechaFinContrato.substring(6, 8));
  //   let nuevo = { Activo: "S", Impreso: 'N', FechaInicio: fecInicio , FechaFin:fecFin, Credencial:"(AUTOGENERADO)"};
  //   setDataRowEditNew({
  //     ...nuevo,
  //     esNuevoRegistro: true,
  //     isReadOnly: false,
  //     IdVehiculo: 0,
  //   });
  //   setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
  //   setModoEdicionTabs(true);
  //   setModoEdicion(true);
  // };

  const nuevoRegistroCredencial = async () => {

    setLoading(true);

    let nextRow = true;
    let arr_activos = listarTabs.filter(x => x.Activo == 'S');

    await validarUsoLicencia({
      IdCliente: perfil.IdCliente,
      IdModulo: dataMenu.info.IdModulo,
    }).then(response => {
      nextRow = response;
      //if (nextRow) nuevoRegistroTabs();
    });
    // console.log("nextRow", nextRow);
    await servicePersona.obtenerPeriodo({
      IdCliente: perfil.IdCliente,
      IdPersona: varIdPersona,
      FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
      FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
    }).then(response => {
      if (response) {
        if (!isNotEmpty(response.MensajeValidacion)) {
          setFechasContrato({ FechaInicioContrato: response.FechaInicio, FechaFinContrato: response.FechaFin });

          if (arr_activos.length > 0 && nextRow) {
            handleWarningMessages(intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.VALIDATE.MESSAGE" }));
            return;
          }

          if (nextRow) {
            setDataRowEditNew({});
            let fecInicio = parseInt(response.FechaInicio) > parseInt(dateFormat(new Date(), 'yyyyMMdd')) ? new Date(response.FechaInicio.substring(0, 4), response.FechaInicio.substring(4, 6) - 1, response.FechaInicio.substring(6, 8)) : new Date();
            let fecFin = new Date(response.FechaFin.substring(0, 4), response.FechaFin.substring(4, 6) - 1, response.FechaFin.substring(6, 8));
            // let fecFin = new Date();
            let credencial=  credencialAutogenerado?intl.formatMessage({ id: "COMMON.CODE.AUTO" }):"";
            console.log("crdedencial-auot", credencialAutogenerado);
            console.log("credencial",credencial);
            let nuevo = { Activo: "S", Impreso: 'N', FechaInicio: fecInicio, FechaFin: fecFin, Credencial: credencial };
            setDataRowEditNew({
              ...nuevo,
              esNuevoRegistro: true,
              isReadOnly: false,
              IdVehiculo: 0,
            });
            setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
            setModoEdicionTabs(true);
            setModoEdicion(true);
          };
        } else {
          setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
        }
      }
    }).finally(x => {
      setLoading(false);
    });
    setLoading(false);

  }

  const devolverFotocheck = async (datos) => {

    const { IdCliente, IdPersona, IdSecuencial } = datos;
    let params = {
      IdCliente: IdCliente,
      IdPersona: IdPersona,
      IdSecuencial: IdSecuencial,
      IdUsuario: usuario.username,
    };
    setLoading(true);
    await devolucionFotocheck(params)
      .then((response) => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarIdentificacionCredencial();
      })
      .catch((err) => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
  }


  /**Configuración Botones**************************************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 7; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  const loadConfiguracion = async () => {

    await obtenerSistemaConfiguracion({ IdCliente: perfil.IdCliente, IdConfiguracion: "IDENTI_CREDE_AUTO" })//_DEFAULT
      .then(result => {
       console.log("obtenerSistemaConfiguracion",result.Valor1);
       let credencialAuto = result.Valor1 == "S" ? true : false;
        setCredencialAutogenerado(credencialAuto);
      }).finally();
  }
  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      {modoEdicion && (
        <> 
          <IdentificacionCredencialEditPage
            dataRowEditNew={dataRowEditNew}
            actualizarPersonaCredencial={actualizarPersonaCredencial}
            agregarPersonaCredencial={agregarPersonaCredencial}
            cancelarEdicion={cancelarEdicion}
            getInfo={getInfo}
            modoEdicion={modoEdicion}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
            varIdPersona={varIdPersona}
            foto={foto}
            valorMinimoTexto={valorMinimoTexto}
            fechasContrato={fechasContrato}
            credencialAutogenerado={credencialAutogenerado}

          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch
                checked={auditoriaSwitch}
                onChange={(e) => {
                  setAuditoriaSwitch(e.target.checked);
                }}
              />
              <b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (
            <AuditoriaPage dataRowEditNew={dataRowEditNew} />
          )}
        </>
      )}
      {!modoEdicion && (
        <>
          <IdentificacionCredencialListPage
            credencialData={listarTabs}
            editarRegistro={editarPersonaCredencial}
            eliminarRegistro={eliminarPersonaCredencial}
            nuevoRegistro={nuevoRegistroCredencial}
            devolverFotocheck={devolverFotocheck}
            cancelarEdicion={props.cancelarEdicion}
            seleccionarRegistro={seleccionarPersonaCredencial}
            focusedRowKey={focusedRowKey}
            getInfo={getInfo}
            accessButton={accessButton}
          />
        </>
      )}

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarPersonaCredencial(selectedDelete, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

      <Confirm
        message={intl.formatMessage({ id: "IDENTIFICATION.PHOTOCHECK.PRINT.CONFIRM" })}
        isVisible={confirmarImpresion}
        setIsVisible={setConfirmarImpresion}
        setInstance={setInstance}
        onConfirm={() => actualizarImpresion(selectedDelete)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

    </>
  );
};

export default injectIntl(WithLoandingPanel(IdentificacionCredencialIndexPage));

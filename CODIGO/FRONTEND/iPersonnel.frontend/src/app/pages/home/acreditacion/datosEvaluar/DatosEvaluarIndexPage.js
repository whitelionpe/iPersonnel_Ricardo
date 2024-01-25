import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty } from "../../../../../_metronic";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import BallotOutlinedIcon from '@material-ui/icons/BallotOutlined';
import ReorderIcon from '@material-ui/icons/Reorder';

import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'

import DatosEvaluarEditPage from "./DatosEvaluarEditPage";
import DatosEvaluarListPage from "./DatosEvaluarListPage";
import DatosEvaluarDetalleEditPage from "./DatosEvaluarDetalleEditPage";
import DatosEvaluarDetalleListPage from "./DatosEvaluarDetalleListPage";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import {
  obtener as obtenerDatosEvaluar, listar as listarDatoEvaluar, crear as crearDatosEvaluar, actualizar as actualizarDatosEvaluar, eliminar as eliminarDatosEvaluar
} from "../../../../api/acreditacion/datosEvaluar.api";

import {
  obtener as obtenerDatosEvaluarDetalle, listar as listarDatoEvaluarDetalle, crear as crearDatosEvaluarDetalle, actualizar as actualizarDatosEvaluarDetalle, eliminar as eliminarDatosEvaluarDetalle
} from "../../../../api/acreditacion/datosEvaluarDetalle.api";

import Confirm from "../../../../partials/components/Confirm";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
const DatosEvaluarIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [listarTabs, setListarTabs] = useState([]);

  const [varDatoEvaluar, setVarDatoEvaluar] = useState("");
  const [isTypeDisabled, setIsTypeDisabled] = useState(true);
  const [selected, setSelected] = useState({});

  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();


  const [modoEdicion, setModoEdicion] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  useEffect(() => {
    listarDatosEvaluar();
    loadControlsPermission();
  }, []);

  const getInfo = () => {
    const { IdDatoEvaluar, DatoEvaluar } = selected;
    return [
      { text: intl.formatMessage({ id: "COMMON.CODE" }), value: IdDatoEvaluar, colSpan: 1 },
      { text: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.MAINTENANCE" }), value: DatoEvaluar, colSpan: 1 }
    ];
  }

  /**Configuración Botones**************************************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 3; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  /*********************************************************** */

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setVarDatoEvaluar("");
    setIsTypeDisabled(true);
    listarDatosEvaluar();
  };

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //Datos Evaluar      :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  async function listarDatosEvaluar() {
    setLoading(true);
    let datosEvaluar = await listarDatoEvaluar({ IdCliente: perfil.IdCliente }).finally(() => { setLoading(false); });
    setModoEdicion(false);
    setListarTabs(datosEvaluar);
    // console.log("listarDatosEvaluar|datosEvaluar:", datosEvaluar);
  }

  const nuevoRegistroDatoEvaluar = async () => {
    let datoEvaluar = { Activo: "S", FlDatoOpcional: false, RequeridoCambioCompania: "N", Actualizable: 'N', esNuevoRegistro: true };
    setDataRowEditNew(datoEvaluar);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  }


  const agregarRegistroDatoEvaluar = async (dataRow) => {
    const {
      IdDatoEvaluar,
      DatoEvaluar,
      Tipo,
      IdEntidad,
      ValorDefecto,
      Activo,
      IdInterfaz,
      CodigoInterfaz,
      ReglaInterfaz,
      RequeridoCambioCompania,
      ValidacionMinimaDias,
      Actualizable,
      AdjuntarArchivo,
      DatoOpcional
    } = dataRow;

    let defaultValue = "";
    switch (Tipo) {
      case "T": defaultValue = isNotEmpty(dataRow.DatoTexto) ? dataRow.DatoTexto : ""; break;
      case "F": defaultValue = isNotEmpty(dataRow.DatoFecha) ? dataRow.DatoFecha.toString() : ""; break;
      case "L": defaultValue = isNotEmpty(dataRow.ValorDefecto) ? dataRow.ValorDefecto : ""; break;
      case "N": defaultValue = isNotEmpty(dataRow.DatoNumerico) ? dataRow.DatoNumerico.toString() : 0; break;
    }
    let params = {
      IdCliente: perfil.IdCliente,
      IdDatoEvaluar,
      DatoEvaluar,
      Tipo,
      IdEntidad,
      ValorDefecto: isNotEmpty(defaultValue) ? defaultValue : "",
      Activo,
      IdInterfaz: isNotEmpty(IdInterfaz) ? IdInterfaz : "",
      CodigoInterfaz: isNotEmpty(CodigoInterfaz) ? CodigoInterfaz : "",
      ReglaInterfaz: isNotEmpty(ReglaInterfaz) ? ReglaInterfaz : "",
      RequeridoCambioCompania,
      ValidacionMinimaDias: isNotEmpty(ValidacionMinimaDias) ? ValidacionMinimaDias : 0,
      Actualizable: isNotEmpty(Actualizable) ? Actualizable : "",
      IdUsuario: usuario.username,
      AdjuntarArchivo: isNotEmpty(AdjuntarArchivo) ? AdjuntarArchivo : "N",
      DatoOpcional: isNotEmpty(DatoOpcional) ? DatoOpcional : "N",

    };

    ///************************************************** */

    setLoading(true);
    crearDatosEvaluar(params).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      setDataRowEditNew({});
      listarDatosEvaluar();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  const actualizarRegistroDatoEvaluar = async (dataRow) => {
    const {
      IdDatoEvaluar,
      DatoEvaluar,
      Tipo,
      IdEntidad,
      ValorDefecto,
      Activo,
      IdInterfaz,
      CodigoInterfaz,
      ReglaInterfaz,
      RequeridoCambioCompania,
      ValidacionMinimaDias,
      Actualizable,
      AdjuntarArchivo,
      DatoOpcional
    } = dataRow;

    let defaultValue = "";
    switch (Tipo) {
      case "T": defaultValue = isNotEmpty(dataRow.DatoTexto) ? dataRow.DatoTexto : ""; break;
      case "F": defaultValue = isNotEmpty(dataRow.DatoFecha) ? dataRow.DatoFecha.toString() : ""; break;
      case "L": defaultValue = isNotEmpty(dataRow.ValorDefecto) ? dataRow.ValorDefecto : ""; break;
      case "N": defaultValue = isNotEmpty(dataRow.DatoNumerico) ? dataRow.DatoNumerico.toString() : 0; break;
    }

    let params = {
      IdCliente: perfil.IdCliente,
      IdDatoEvaluar,
      DatoEvaluar,
      Tipo,
      IdEntidad,
      ValorDefecto: isNotEmpty(defaultValue) ? defaultValue : "",
      Activo,
      IdInterfaz: isNotEmpty(IdInterfaz) ? IdInterfaz : "",
      CodigoInterfaz: isNotEmpty(CodigoInterfaz) ? CodigoInterfaz : "",
      ReglaInterfaz: isNotEmpty(ReglaInterfaz) ? ReglaInterfaz : "",
      RequeridoCambioCompania,
      ValidacionMinimaDias: isNotEmpty(ValidacionMinimaDias) ? ValidacionMinimaDias : 0,
      Actualizable: isNotEmpty(Actualizable) ? Actualizable : "",
      IdUsuario: usuario.username,
      AdjuntarArchivo: isNotEmpty(AdjuntarArchivo) ? AdjuntarArchivo : "N",
      DatoOpcional: isNotEmpty(DatoOpcional) ? DatoOpcional : "N",
    };

    ///************************************************** */

    setLoading(true);
    actualizarDatosEvaluar(params).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      setDataRowEditNew({});
      listarDatosEvaluar();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const editarRegistroDatoEvaluar = async (dataRow) => {
    let { IdDatoEvaluar } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdDatoEvaluar
    };

    setLoading(true);
    let datosEvaluar = await obtenerDatosEvaluar(params).finally(() => { setLoading(false); });

    switch (datosEvaluar.Tipo) {
      case "T": datosEvaluar.DatoTexto = isNotEmpty(datosEvaluar.ValorDefecto) ? datosEvaluar.ValorDefecto : ""; break;
      case "F": datosEvaluar.DatoFecha = isNotEmpty(datosEvaluar.ValorDefecto) ? new Date(datosEvaluar.ValorDefecto) : ""; break;
      case "L": datosEvaluar.ValorDefecto = isNotEmpty(datosEvaluar.ValorDefecto) ? datosEvaluar.ValorDefecto : ""; break;
      case "N": datosEvaluar.DatoNumerico = isNotEmpty(datosEvaluar.ValorDefecto) ? parseInt(datosEvaluar.ValorDefecto) : 0; break;
    }


    setDataRowEditNew({ ...datosEvaluar, FlDatoOpcional: datosEvaluar.DatoOpcional === "S", esNuevoRegistro: false, Actualizable: "S" });
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicion(true);
  }

  const eliminarRegistroDatoEvaluar = async (dataRow) => {
    let { IdDatoEvaluar } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdDatoEvaluar,
    };

    setLoading(true);
    await eliminarDatosEvaluar(params).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      setModoEdicion(false);
      setDataRowEditNew({});
      listarDatosEvaluar();
      setVarDatoEvaluar("");
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const cancelarEdicionDatoEvaluar = () => {
    setModoEdicion(false);
    setDataRowEditNew({});
  }

  const verRegistroDblClickDatoEvaluar = async (dataRow) => {
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    changeTabIndex(1);
    setModoEdicion(false);
    let datoEvaluar = await obtenerDatosEvaluar(dataRow);
    setDataRowEditNew({ ...datoEvaluar, FlDatoOpcional: datoEvaluar.DatoOpcional === "S", esNuevoRegistro: false });

    setIsTypeDisabled(datoEvaluar.Tipo != "L");
  }



  const cargarRegistroSeleccioandoDatoEvaluar = async () => {
    changeTabIndex(1);
    setModoEdicion(false);
    setLoading(true);
    let datoEvaluar = await obtenerDatosEvaluar({
      IdCliente: perfil.IdCliente, IdDatoEvaluar: varDatoEvaluar,
    }).finally(() => { setLoading(false); });
    setDataRowEditNew({ ...datoEvaluar, FlDatoOpcional: datoEvaluar.DatoOpcional === "S", esNuevoRegistro: false, Actualizable: "N" });
    setIsTypeDisabled(datoEvaluar.Tipo != "L");
  }

  const seleccionarRegistroDatoEvaluar = (dataRow) => {
    setSelected(dataRow);
    setModoEdicion(false);
    setVarDatoEvaluar(dataRow.IdDatoEvaluar);

    setFocusedRowKey(dataRow.RowIndex);

    setDataRowEditNew({ ...dataRow, FlDatoOpcional: dataRow.DatoOpcional === "S" });
    setIsTypeDisabled(dataRow.Tipo != "L");
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //Datos Evaluar  Detalle    ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const cargarDatosEvaluarDetalle = async () => {
    setLoading(true);
    setListarTabs([])
    let datosEvaluar = await listarDatoEvaluarDetalle({ IdCliente: perfil.IdCliente, IdDatoEvaluar: varDatoEvaluar }).finally(() => { setLoading(false); });
    setModoEdicion(false);
    setListarTabs(datosEvaluar);
  }

  const editarRegistroDatoEvaluarDetalle = async (dataRow) => {
    let { IdDatoEvaluar, IdDato } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdDatoEvaluar,
      IdDato,
    };

    setLoading(true);
    let datosEvaluarDetalle = await obtenerDatosEvaluarDetalle(params).finally(() => { setLoading(false); });
    setDataRowEditNew({ ...datosEvaluarDetalle, FlDatoOpcional: datosEvaluarDetalle.DatoOpcional === "S", esNuevoRegistro: false });
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setModoEdicion(true);
  }

  const eliminarRegistroDatoEvaluarDetalle = async (dataRow) => {
    let { IdDatoEvaluar, IdDato } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdDatoEvaluar: IdDatoEvaluar,
      IdDato,
    };
    setLoading(true);
    await eliminarDatosEvaluarDetalle(params).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      setModoEdicion(false);
      setDataRowEditNew({});
      cargarDatosEvaluarDetalle();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const nuevoRegistroDatoEvaluarDetalle = async () => {
    let datoEvaluar = { Activo: "S", FlDatoOpcional: false, esNuevoRegistro: true, AdjuntarArchivo: "S" };
    setDataRowEditNew(datoEvaluar);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  }
  const cancelarEdicionDatoEvaluarDetalle = () => {
    setModoEdicion(false);
    setDataRowEditNew({});
  }
  const agregarRegistroDatoEvaluarDetalle = async (dataRow) => {

    let {
      IdDato,
      Dato,
      AdjuntarArchivo,
      Activo,
      IdDatoEvaluar,
    } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdDatoEvaluar: varDatoEvaluar,
      IdDato,
      Dato,
      AdjuntarArchivo,
      Activo,
      IdUsuario: usuario.username,
    };

    ///************************************************** */

    setLoading(true);
    crearDatosEvaluarDetalle(params).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      setDataRowEditNew({});
      cargarDatosEvaluarDetalle();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  const actualizarRegistroDatoEvaluarDetalle = async (dataRow) => {
    let {
      IdDato,
      Dato,
      Activo,
      AdjuntarArchivo,
    } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdDatoEvaluar: varDatoEvaluar,
      IdDato,
      Dato,
      AdjuntarArchivo,
      Activo,
      IdUsuario: usuario.username,
    };


    ///************************************************** */

    setLoading(true);
    actualizarDatosEvaluarDetalle(params).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      setDataRowEditNew({});
      cargarDatosEvaluarDetalle();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function eliminarListRowTab(dataRow, confirm) {
    if (confirm) {
      switch (tabIndex) {
        case 0://tab listar
          eliminarRegistroDatoEvaluar(selected);
          break;
        case 2://tab listar
          eliminarRegistroDatoEvaluarDetalle(selected);
          break;
      }
    } else {
      setIsVisible(true);
      setSelected(dataRow);
    }
  }


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ACCREDITATION.DATAEVALUATE.DETAIL"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";

    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varDatoEvaluar) ? false : true;
    //return true;
  }

  const tabContent_DatosEvaluarListPage = () => {
    return <>
      {
        !modoEdicion && (
          <DatosEvaluarListPage
            editarRegistro={editarRegistroDatoEvaluar}
            eliminarRegistro={eliminarListRowTab}
            showButton={true}
            getInfo={getInfo}
            nuevoRegistro={nuevoRegistroDatoEvaluar}
            cancelarEdicion={cancelarEdicionDatoEvaluar}
            datosEvaluar={listarTabs}
            verRegistroDblClick={verRegistroDblClickDatoEvaluar}
            seleccionarRegistro={seleccionarRegistroDatoEvaluar}
            focusedRowKey={focusedRowKey}
          />
        )
      }
      {
        modoEdicion && (
          <>
            <DatosEvaluarEditPage

              dataRowEditNew={dataRowEditNew}
              modoEdicion={modoEdicion}
              titulo={titulo}
              cancelarEdicion={cancelarEdicion}
              setDataRowEditNew={setDataRowEditNew}
              agregar={agregarRegistroDatoEvaluar}
              actualizar={actualizarRegistroDatoEvaluar}
              accessButton={accessButton}
              settingDataField={dataMenu.datos}
            />
            <div className="container_only">
              <div className="float-right">
                <ControlSwitch
                  checked={auditoriaSwitch}
                  onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
              </div>
            </div>
            {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
          </>
        )
      }
    </>
  }


  const tabContent_DatosEvaluarEditPage = () => {
    return <>
      <DatosEvaluarEditPage
        dataRowEditNew={dataRowEditNew}
        modoEdicion={modoEdicion}
        titulo={titulo}
        cancelarEdicion={cancelarEdicion}
        setDataRowEditNew={setDataRowEditNew}
        agregar={agregarRegistroDatoEvaluar}
        actualizar={actualizarRegistroDatoEvaluar}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />
      <div className="container_only">
        <div className="float-right">
          <ControlSwitch
            checked={auditoriaSwitch}
            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
          /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
        </div>
      </div>
      {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
    </>
  }

  const tabContent_DatosEvaluarDetalleListPage = () => {
    return <>
      {!modoEdicion && (
        <DatosEvaluarDetalleListPage
          editarRegistro={editarRegistroDatoEvaluarDetalle}
          eliminarRegistro={eliminarListRowTab}
          showButton={true}
          getInfo={getInfo}
          nuevoRegistro={nuevoRegistroDatoEvaluarDetalle}
          cancelarEdicion={cancelarEdicion}
          datosEvaluarDetalle={listarTabs}
        />
      )}
      {modoEdicion && (
        <>
          <DatosEvaluarDetalleEditPage

            dataRowEditNew={dataRowEditNew}
            modoEdicion={modoEdicion}
            titulo={titulo}
            cancelarEdicion={cancelarEdicionDatoEvaluarDetalle}
            setDataRowEditNew={setDataRowEditNew}
            agregar={agregarRegistroDatoEvaluarDetalle}
            actualizar={actualizarRegistroDatoEvaluarDetalle}
            accessButton={accessButton}
            settingDataField={dataMenu.datos}
            showButton={true}
            getInfo={getInfo}

          />
          <div className="container_only">
            <div className="float-right">
              <ControlSwitch
                checked={auditoriaSwitch}
                onChange={e => { setAuditoriaSwitch(e.target.checked) }}
              /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
            </div>
          </div>
          {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
        </>
      )}
    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.PATHNAME" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />,
            onClick: () => { listarDatosEvaluar() },
          },
          {
            label: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE" }),
            icon: <BallotOutlinedIcon fontSize="large" />,
            onClick: (e) => {
              setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
              cargarRegistroSeleccioandoDatoEvaluar()
            },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE.DETAIL" }),
            icon: <ReorderIcon fontSize="large" />,
            onClick: () => { cargarDatosEvaluarDetalle() },
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? isTypeDisabled : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_DatosEvaluarListPage(),
            tabContent_DatosEvaluarEditPage(),
            tabContent_DatosEvaluarDetalleListPage()
          ]
        }
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarListRowTab(selected, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};

export default injectIntl(WithLoandingPanel(DatosEvaluarIndexPage));

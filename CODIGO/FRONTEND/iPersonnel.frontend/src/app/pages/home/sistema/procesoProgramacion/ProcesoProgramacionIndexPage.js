import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions, setDisabledTabs } from '../../../../../_metronic/utils/securityUtils'
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import Confirm from "../../../../partials/components/Confirm";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import PeopleOutlineIcon from '@material-ui/icons/PeopleOutline';
import SettingsIcon from '@material-ui/icons/Settings';
import AvTimerIcon from '@material-ui/icons/AvTimer';
import FindInPageIcon from '@material-ui/icons/FindInPage';

import '../cliente/ClienteStyle.css';
import ClienteListPage from "../cliente/ClienteListPage";
import ClienteEditPage from "../cliente/ClienteEditPage";
import { service } from "../../../../api/sistema/procesoCliente.api";
import ProcesoListPage from "./proceso/ProcesoListPage";
import ProcesoEditPage from "./proceso/ProcesoEditPage";

import ProgramacionIndexPage from "./programacion/ProgramacionIndexPage";
import AuditoriaIndexPage from "./auditoria/AuditoriaIndexPage";
import SistemaProcesoBuscar from "../../../../partials/components/SistemaProcesoBuscar";

import { obtener, listar } from "../../../../api/sistema/cliente.api";
import { obtener as obtenerSistemaConfiguracion, obtener_medidas as obtenerSistemaConfiguracionMedidas } from "../../../../api/sistema/configuracion.api";

const ProcesoProgramacionIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const [varIdCliente, setVarIdCliente] = useState();
  const [varIdProceso, setVarIdProceso] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [focusedRowKeyProcesoCliente, setFocusedRowKeyProcesoCliente] = useState();

  const [clientes, setClientes] = useState([]);
  const [selected, setSelected] = useState({});
  const [selectedProceso, setSelectedProceso] = useState({});

  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [titulo, setTitulo] = useState({});
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const [tabIndex, setTabIndex] = useState(0);
  const [listarTabs, setListarTabs] = useState([]);

  const [isVisibleAlert, setIsVisibleAlert] = useState();
  const [alturaSugerido, setAlturaSugerido] = useState();
  const [anchoSugerido, setAnchoSugerido] = useState();
  const [alturaSugeridoRadio, setAlturaSugeridoRadio] = useState();
  const [anchoSugeridoRadio, setAnchoSugeridoRadio] = useState();
  

  const [instance, setInstance] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState({});
  const [isVisiblePopUpProcesos, setisVisiblePopUpProcesos] = useState(false);

  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  async function listarClientes() {
    setLoading(true);
    //disabledTabs(true);
    await listar({
      NumPagina: 0
      , TamPagina: 0
    }).then(clientes => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setClientes(clientes);
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function obtenerCliente() {
    setLoading(true);
    const { IdCliente } = selected;
    await validateConfigurationImageLength(IdCliente);
    await obtener({ IdCliente }).then(cliente => {
      setDataRowEditNew({ ...cliente, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  const seleccionarRegistro = dataRow => {
    const { IdCliente, RowIndex } = dataRow;

    setModoEdicion(false);
    setSelected(dataRow);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    if (IdCliente != varIdCliente) {
      setVarIdCliente(IdCliente);
      setFocusedRowKey(RowIndex);
    }
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerCliente(dataRow.IdCliente);
  };

  async function validateConfigurationImageLength(IdCliente) {
    await obtenerSistemaConfiguracionMedidas({ IdCliente: IdCliente, IdImageSize: "MAXIMAGESIZECLIENTE", idImageRatio: "CLIENTIMAGERATIO" })
      .then(result => {
        if (result === "") {
          setAlturaSugerido(0)
          setAnchoSugerido(0)
          setAlturaSugeridoRadio(0)
          setAnchoSugeridoRadio(0)
          setIsVisibleAlert(true);

        } else {
          setIsVisibleAlert(false);
          setAlturaSugerido(result.AltoMedida)
          setAnchoSugerido(result.AnchoMedida)
          setAlturaSugeridoRadio(result.AltoMedidaRadio)
          setAnchoSugeridoRadio(result.AnchoMedidaRadio)
        }
      }).finally();
  }



  /****PROCESO CLIENTE*******************************************/

  async function agregarProcesoCliente(procesos) {
    var response = "";
    setLoading(true);
    procesos.map(async (data) => {
      const { IdProceso, Activo, CorreoAdicional } = data;
      //const { CorreoAdicional } = dataRow;
      let params = {
        IdCliente: varIdCliente
        , IdProceso: isNotEmpty(IdProceso) ? IdProceso : 0
        , CorreoAdicional: isNotEmpty(CorreoAdicional) ? CorreoAdicional.toUpperCase() : ""
        , Activo: Activo
        , IdUsuario: usuario.username
      };

      await service.crear(params).then(response => {
        // if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
        listarProcesoCliente(params);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    });

    for (let i = 0; i < procesos.length; i++) {
      if (i === procesos.length - 1) {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      }
    }
  }

  async function actualizarProcesoCliente(dataRow) {
    setLoading(true);
    const { IdProceso, CorreoAdicional, Activo } = dataRow;
    let params = {
      IdCliente: varIdCliente
      , IdProceso: isNotEmpty(IdProceso) ? IdProceso : 0
      , CorreoAdicional: isNotEmpty(CorreoAdicional) ? CorreoAdicional.toUpperCase() : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    }
    await service.actualizar(params).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarProcesoCliente();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function eliminarProcesoCliente(dataRow, confirm) {
    setSelectedDelete(dataRow);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente } = dataRow;
      //console.log("dataRoweliminar", dataRow);
      await service.eliminar({
        IdCliente
        , IdProceso: varIdProceso
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        listarProcesoCliente();
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
    }
  }

  async function listarProcesoCliente() {
    setLoading(true);
    let procesosCliente = await service.listar({
      IdCliente: varIdCliente
      , NumPagina: 0
      , TamPagina: 0
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => {
      setLoading(false)
    });

    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));

    setListarTabs(procesosCliente);
  }

  async function obtenerProcesoCliente(dataRow) {
    setLoading(true);
    const { IdProceso } = dataRow;
    await service.obtener({
      IdCliente: varIdCliente
      , IdProceso: IdProceso
    }).then(ProcesosCliente => {
      setDataRowEditNew({ ...ProcesosCliente, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
    }).finally(() => { setLoading(false); });
  }


  const nuevoProcesoCliente = () => {
    setisVisiblePopUpProcesos(true);
  };


  const editarProcesoCliente = async (dataRow) => {
    const { RowIndex } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    setFocusedRowKeyProcesoCliente(RowIndex);
    await obtenerProcesoCliente(dataRow);
  };

  const cancelarProcesoCliente = () => {
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };

  const seleccionarProcesoCliente = dataRow => {
    const { IdCliente, IdProceso, RowIndex } = dataRow;
    setSelectedProceso(dataRow);
    setVarIdCliente(IdCliente);
    setVarIdProceso(IdProceso);
    setFocusedRowKeyProcesoCliente(RowIndex);
    //console.log("dataRowPROcliente", dataRow);
  };

  const abrirProgramacion = (dataRow) => {
    //console.log("abrirProgramacion", dataRow);
    const { IdCliente, IdProceso, RowIndex } = dataRow;
    setSelectedProceso(dataRow);
    setVarIdCliente(IdCliente);
    setVarIdProceso(IdProceso);
    changeTabIndex(4);
  }

  /************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 5;
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }

  useEffect(() => {
    listarClientes();
    loadControlsPermission();
  }, []);


  const getInfo = () => {
    const { Cliente } = selected;
    return [
      { text: [intl.formatMessage({ id: "SYSTEM.CUSTOMER" })], value: Cliente, colSpan: 3 }
    ];

  }

  const getInfoProceso = () => {
    const { Cliente } = selected;
    const { Proceso } = selectedProceso;
    return [
      { text: [intl.formatMessage({ id: "SYSTEM.CUSTOMER" })], value: Cliente, colSpan: 3 },
      { text: [intl.formatMessage({ id: "SYSTEM.PROCESS" })], value: Proceso, colSpan: 3 }
    ];
  }

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "SYSTEM.AUDITCONFIGURATION",
      "SYSTEM.PROCESS.PROCESSES",
      "SYSTEM.PROCESS.SCHEDULES"
    ];

    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + "  " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdCliente) ? false : true;
    //return true;
  }

  const tabContent_ClienteListPage = () => {
    return <ClienteListPage
      titulo={titulo}
      clientes={clientes}
      seleccionarRegistro={seleccionarRegistro}
      verRegistroDblClick={verRegistroDblClick}
      focusedRowKey={focusedRowKey}
      accessButton={accessButton}
      showButton={false}
    />
  }


  const tabContent_ClienteEditPage = () => {
    return <>
      <ClienteEditPage
        modoEdicion={modoEdicion}
        dataRowEditNew={dataRowEditNew}
        cancelarEdicion={cancelarEdicion}
        titulo={titulo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
        isVisibleAlert={isVisibleAlert}
        alturaSugerido={alturaSugerido}
        anchoSugerido={anchoSugerido}

        medidaSugeridas={{
          width: anchoSugerido, height: alturaSugerido,
          width_radio: anchoSugeridoRadio, height_radio: alturaSugeridoRadio
        }}

      />
      <div className="container_only">
        <div className="float-right">
          <ControlSwitch checked={auditoriaSwitch}
            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
          /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
        </div>
      </div>
      {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNew} />)}
    </>
  }

  const tabContent_AuditoriaIndexPage = () => {
    return <>
      <AuditoriaIndexPage
        varIdCliente={varIdCliente}
        selectedIndex={selected}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        settingDataField={dataMenu.datos}
        accessButton={accessButton}
      //showButtons={false}
      />
    </>
  }


  const tabContent_ProcesoIndexPage = () => {
    return <>
      {modoEdicion && (
        <>
          <ProcesoEditPage
            modoEdicion={modoEdicion}
            dataRowEditNew={dataRowEditNew}
            actualizarProcesoCliente={actualizarProcesoCliente}
            agregarProcesoCliente={agregarProcesoCliente}
            cancelarEdicion={cancelarProcesoCliente}
            titulo={titulo}
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
      )}
      {!modoEdicion && (
        <>
          <ProcesoListPage
            //titulo={titulo}
            procesoClienteData={listarTabs}
            editarRegistro={editarProcesoCliente}
            eliminarRegistro={eliminarProcesoCliente}
            nuevoRegistro={nuevoProcesoCliente}
            seleccionarRegistro={seleccionarProcesoCliente}
            focusedRowKey={focusedRowKeyProcesoCliente}
            accessButton={accessButton}
            getInfo={getInfo}
            //abrirProgramacion={abrirProgramacion}
            changeTabIndex={changeTabIndex}
            cancelarEdicion={cancelarEdicion}
          />
        </>
      )}

      {/* POPUP-> buscar proceso */}
      {isVisiblePopUpProcesos && (

        <SistemaProcesoBuscar
          //procesos={serviceProceso.obtenerTodos()}
          showPopup={{ isVisiblePopUp: isVisiblePopUpProcesos, setisVisiblePopUp: setisVisiblePopUpProcesos }}
          cancelar={() => setisVisiblePopUpProcesos(false)}
          agregar={agregarProcesoCliente}
          selectionMode={"multiple"}
          showButton={true}
        />
      )
      }

    </>
  }


  const tabContent_ProgramacionIndexPage = () => {
    return <>
      <ProgramacionIndexPage
        varIdCliente={varIdCliente}
        varIdProceso={varIdProceso}
        selectedIndex={selected}
        //cancelarEdicion={cancelarEdicion}
        getInfo={getInfoProceso}
        // accessButton={false}
        settingDataField={dataMenu.datos}
        accessButton={accessButton}
        showButtons={false}
        changeTabIndex={changeTabIndex}
      />
    </>
  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (
    <>
      <TabNavContainer
        title={intl.formatMessage({ id: "SYSTEM" })}
        subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
        nombrebarra={titleHeaderToolbar()}
        tabIndex={tabIndex}
        handleChange={handleChange}
        componentTabsHeaders={[
          {
            label: intl.formatMessage({ id: "ACTION.LIST" }),
            icon: <FormatListNumberedIcon fontSize="large" />
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.CUSTOMER" }),
            icon: <PeopleOutlineIcon fontSize="large" />,
            onClick: (e) => { obtenerCliente(selected) },
            disabled: tabsDisabled()
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.AUDITCONFIGURATION" }),
            icon: <FindInPageIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[2] ? false : true
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.PROCESS.PROCESSES" }),
            icon: <SettingsIcon fontSize="large" />,
            onClick: (e) => { listarProcesoCliente() },
            disabled: !tabsDisabled() && accessButton.Tabs[3] ? false : true
          },
          {
            label: intl.formatMessage({ id: "SYSTEM.PROCESS.SCHEDULES" }),
            icon: <AvTimerIcon fontSize="large" />,
            disabled: !tabsDisabled() && accessButton.Tabs[4] ? true : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_ClienteListPage(),
            tabContent_ClienteEditPage(),
            tabContent_AuditoriaIndexPage(),
            tabContent_ProcesoIndexPage(),
            tabContent_ProgramacionIndexPage()
          ]
        }
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarProcesoCliente(selected, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};

export default injectIntl(WithLoandingPanel(ProcesoProgramacionIndexPage));

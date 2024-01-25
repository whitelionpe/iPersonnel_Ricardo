import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty } from "../../../../../_metronic";
import { handleErrorMessages, handleSuccessMessages, handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";

//import ScatterPlotIcon from '@material-ui/icons/ScatterPlot';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import AssignmentTurnedInOutlinedIcon from '@material-ui/icons/AssignmentTurnedInOutlined';
import BallotOutlinedIcon from '@material-ui/icons/BallotOutlined';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import RequisitoEditPage from "./RequisitoEditPage";
import RequisitoListPage from "./RequisitoListPage";


import RequisitoDatoEvaluarIndexPage from "./datoEvaluar/RequisitoDatoEvaluarIndexPage";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

import {
  service as serviceRequisito
} from "../../../../api/acreditacion/requisito.api";

import Confirm from "../../../../partials/components/Confirm";

import { getButtonPermissions, defaultPermissions, setDisabledTabs, getDisableTab } from '../../../../../_metronic/utils/securityUtils'
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
const RequisitoIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [listarTabs, setListarTabs] = useState([]);

  const [varIdRequisito, setvarIdRequisito] = useState("");
  const [varRequisito, setvarRequisito] = useState("");

  const [selected, setSelected] = useState({});

  //const [contrato, setContrato] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();

  const [modoEdicion, setModoEdicion] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };


  const [isVisible, setIsVisible] = useState(false);

  const [tipoEntidad, setTipoEntidad] = useState("");

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setvarIdRequisito("");
    setTipoEntidad("");
    setvarRequisito("");
    //setIsTypeDisabled(true);
    listarRequisitos();
  };

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //Datos Evaluar      :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  async function listarRequisitos() {
    setLoading(true);
    let requisito = await serviceRequisito.listar({ IdCliente: perfil.IdCliente }).finally(() => { setLoading(false); });
    setModoEdicion(false);
    setListarTabs(requisito);
    //console.log("listarRequisitos|requisito:", requisito);
  }

  const nuevoRegistroRequisito = async () => {
    let requisito = { Activo: "S", esNuevoRegistro: true, FlDatoOpcional: false };
    setDataRowEditNew(requisito);
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  }


  const agregarRegistroRequisito = async (dataRow) => {
    //console.log("agregarRegistroRequisito.dataRow", dataRow);
    const {
      IdRequisito,
      Requisito,
      IdEntidad,
      TipoRequisito,
      AprobarPorInterfaz,
      Orden,
      Activo,
      DatoOpcional
    } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdRequisito: isNotEmpty(IdRequisito) ? IdRequisito.toUpperCase() : "",
      Requisito: isNotEmpty(Requisito) ? Requisito.toUpperCase() : "",
      IdEntidad,
      TipoRequisito,
      AprobarPorInterfaz: AprobarPorInterfaz ? "S" : "N",
      //AprobarPorInterfaz: AprobarPorInterfaz === true || AprobarPorInterfaz === "S" ? "S" : "N",
      Orden: isNotEmpty(Orden) ? Orden : 0,
      Activo,
      IdUsuario: usuario.username,
      DatoOpcional: isNotEmpty(DatoOpcional) ? DatoOpcional : "N",
    };

    setLoading(true);
    await serviceRequisito.crear(params).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      setDataRowEditNew({});
      listarRequisitos();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  const actualizarRegistroRequisito = async (dataRow) => {
    //console.log("actualizarRegistroRequisito", dataRow);
    const {
      IdRequisito,
      Requisito,
      IdEntidad,
      TipoRequisito,
      AprobarPorInterfaz,
      Activo,
      Orden,
      DatoOpcional
    } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdRequisito: isNotEmpty(IdRequisito) ? IdRequisito.toUpperCase() : "",
      Requisito: isNotEmpty(Requisito) ? Requisito.toUpperCase() : "",
      IdEntidad,
      TipoRequisito,
      AprobarPorInterfaz: AprobarPorInterfaz ? "S" : "N",
      //AprobarPorInterfaz: AprobarPorInterfaz === true || AprobarPorInterfaz === "S" ? "S" : "N",
      Orden: isNotEmpty(Orden) ? Orden : 0,
      Activo,
      IdUsuario: usuario.username,
      DatoOpcional: isNotEmpty(DatoOpcional) ? DatoOpcional : "N",
    };

    setLoading(true);
    await serviceRequisito.actualizar(params).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      setDataRowEditNew({});
      listarRequisitos();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  const editarRegistroRequisito = async (dataRow) => {
    let { IdRequisito } = dataRow;
    let params = {
      IdCliente: perfil.IdCliente,
      IdRequisito
    };

    setLoading(true);
    await serviceRequisito.obtener(params).then(datosEvaluar => {
      datosEvaluar.AprobarPorInterfaz = datosEvaluar.AprobarPorInterfaz === 'S' ? true : false;
      //debugger;
      setDataRowEditNew({ ...datosEvaluar, FlDatoOpcional: datosEvaluar.DatoOpcional === "S", esNuevoRegistro: false });
      setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
      setModoEdicion(true);
    }).finally(() => { setLoading(false); });

  }

  const eliminarRegistroDatoEvaluar = async (dataRow) => {
    let { IdRequisito } = dataRow;

    let params = {
      IdCliente: perfil.IdCliente,
      IdRequisito,
    };

    setLoading(true);
    await serviceRequisito.eliminar(params).then(response => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      setModoEdicion(false);
      setDataRowEditNew({});
      listarRequisitos();
      setvarIdRequisito("");
      setTipoEntidad("");
      setvarRequisito("");
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const cancelarEdicionRequisito = () => {
    setModoEdicion(false);
    setDataRowEditNew({});
  }

  const load = async (lidCliente, lidRequisito) => {
    setModoEdicion(false);
    setLoading(true);
    await serviceRequisito.obtener({ IdCliente: lidCliente, IdRequisito: lidRequisito }).then(datoEvaluar => {
      datoEvaluar.AprobarPorInterfaz = (datoEvaluar.AprobarPorInterfaz === 'S');
      setDataRowEditNew({ ...datoEvaluar, FlDatoOpcional: datoEvaluar.DatoOpcional === "S", esNuevoRegistro: false });
      setvarIdRequisito(datoEvaluar.IdRequisito);
      setvarRequisito(datoEvaluar.Requisito);
    }).finally(() => {
      changeTabIndex(1);
      setLoading(false)
    });
  }

  const verRegistroDblClickRequisito = async (dataRow) => {
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    await load(perfil.IdCliente, dataRow.IdRequisito);
  }


  const cargarRegistroSeleccioandoDatoEvaluar = async () => {
    await load(perfil.IdCliente, varIdRequisito);
    //setIsTypeDisabled(datoEvaluar.Tipo != "L");
  }

  const seleccionarRegistroRequisito = (dataRow) => {
    //debugger;
    const { IdRequisito, Requisito, RowIndex, IdEntidad } = dataRow;
    setSelected(dataRow);
    //setModoEdicion(false);
    setvarIdRequisito(IdRequisito);
    setTipoEntidad(IdEntidad);
    setvarRequisito(Requisito);
    setFocusedRowKey(RowIndex);
    setDataRowEditNew({ ...dataRow, FlDatoOpcional: dataRow.DatoOpcional === "S", });

  }

  async function eliminarListRowTab(dataRow, confirm) {
    if (confirm) {
      switch (tabIndex) {
        case 0://tab listar
          eliminarRegistroDatoEvaluar(selected);
          break;
        // case 2://tab listar
        //     eliminarRegistroDatoEvaluarDetalle(selected);
        //     break;
      }
    } else {
      setIsVisible(true);
      setSelected(dataRow);
    }
  }

  const getInfo = () => {
    return [
      { text: intl.formatMessage({ id: "COMMON.CODE" }), value: varIdRequisito, colSpan: 1 },
      { text: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.MAINTENANCE" }), value: varRequisito, colSpan: 1 }
    ];
  }

  /*********************************************************** */
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    const numeroTabs = 2; //Nùmero de tab del formulario.
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    let newTabs = setDisabledTabs(dataMenu.objetos, numeroTabs);
    setAccessButton({ ...accessButton, ...buttonsPermissions, Tabs: newTabs });
  }
  /*********************************************************** */

  useEffect(() => {
    loadControlsPermission();
    listarRequisitos();
  }, []);


  //:::::::::::::::::::::::::::::::::::::::::::::-Configuración de tabs-:::::::::::::::::::::::::::::::::
  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
      "ACCREDITATION.REQUIREMENT.DATAEVALUATE.TAB"
    ];
    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }
  const tabsDisabled = () => {
    return isNotEmpty(varIdRequisito) ? false : true;
    //return true;
  }


  const tabContent_RequisitoListPage = () => {
    return <>

      {
        !modoEdicion && (
          <RequisitoListPage
            editarRegistro={editarRegistroRequisito}
            eliminarRegistro={eliminarListRowTab}
            showButton={true}
            getInfo={getInfo}
            nuevoRegistro={nuevoRegistroRequisito}
            cancelarEdicion={cancelarEdicionRequisito}
            datosEvaluar={listarTabs}
            verRegistroDblClick={verRegistroDblClickRequisito}
            seleccionarRegistro={seleccionarRegistroRequisito}
            focusedRowKey={focusedRowKey}
          />
        )
      }
      {
        modoEdicion && (
          <>
            <RequisitoEditPage

              dataRowEditNew={dataRowEditNew}
              modoEdicion={modoEdicion}
              titulo={titulo}
              cancelarEdicion={cancelarEdicion}
              setDataRowEditNew={setDataRowEditNew}
              agregar={agregarRegistroRequisito}
              actualizar={actualizarRegistroRequisito}
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


  const tabContent_RequisitoEditTabPage = () => {
    return <>
      <RequisitoEditPage

        dataRowEditNew={dataRowEditNew}
        modoEdicion={modoEdicion}
        titulo={titulo}
        cancelarEdicion={cancelarEdicion}
        setDataRowEditNew={setDataRowEditNew}
        agregar={agregarRegistroRequisito}
        actualizar={actualizarRegistroRequisito}
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

  const tabContent_DatoEvaluarListPage = () => {
    return <>

      <RequisitoDatoEvaluarIndexPage
        varIdRequisito={varIdRequisito}
        varTipoEntidad={tipoEntidad}
        cancelarEdicion={cancelarEdicion}
        getInfo={getInfo}
        accessButton={accessButton}
        settingDataField={dataMenu.datos}
      />

    </>
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
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
            icon: <FormatListNumberedIcon fontSize="large" />
          },
          {
            label: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.TAB" }),
            icon: <AssignmentTurnedInOutlinedIcon fontSize="large" />,
            onClick: (e) => {
              setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
              cargarRegistroSeleccioandoDatoEvaluar()
            }
          },
          {
            label: intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.DATAEVALUATE.TAB" }),
            icon: <BallotOutlinedIcon fontSize="large" />,
            disabled: !tabsDisabled() ? false : true
          }
        ]}
        className={classes.tabContent}
        componentTabsBody={
          [
            tabContent_RequisitoListPage(),
            tabContent_RequisitoEditTabPage(),
            tabContent_DatoEvaluarListPage()
          ]
        }
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        onConfirm={() => eliminarListRowTab({}, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />
    </>
  );
};



export default injectIntl(WithLoandingPanel(RequisitoIndexPage));

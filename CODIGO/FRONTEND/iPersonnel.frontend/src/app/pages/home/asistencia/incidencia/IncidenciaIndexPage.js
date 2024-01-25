import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import { isNotEmpty, dateFormat } from "../../../../../_metronic";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import ReportProblem from '@material-ui/icons/ReportProblem';

import {
  obtener,
   listar, 
   crear, 
   actualizar, 
   eliminar
} from "../../../../api/asistencia/incidencia.api";

import IncidenciaListPage from '../incidencia/IncidenciaListPage'
import IncidenciaEditPage from '../incidencia/IncidenciaEditPage'

import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";


const IncidenciaIndexPage = (props) => {
  const { intl, setLoading, dataMenu,settingDataField } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const classes = useStylesTab();

  const [varIdIncidencia, setVarIdIncidencia] = useState("");
  const [focusedRowKey, setFocusedRowKey] = useState(0);
  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({ IdCliente: IdCliente, IdDivision: IdDivision });
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});

  const [incidencias, setIncidencias] = useState([]);
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

  const[valueColor, setValueColor ] = useState("");



  //:::::::::::::::::::: CONFIG TABS :::::::::::::::::::::::::::::::::::

  const titleHeaderToolbar = () => {
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `;
  }

  const tabsDisabled = () => {
    return isNotEmpty(varIdIncidencia) ? false : true;
  }


  async function agregarIncidencia(datarow) {
    setLoading(true);
    const { IdIncidencia, Incidencia, IdTipoIncidencia, Color} = datarow;
    let data = {
        IdIncidencia: IdIncidencia
      , Incidencia: Incidencia
      , IdTipoIncidencia: isNotEmpty(IdTipoIncidencia) ? IdTipoIncidencia.toUpperCase() : ""
      , Color: isNotEmpty(Color) ? Color : ""
      , IdUsuario: usuario.username
    };
    await crear(data).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarIncidencia();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
    }).finally(() => { setLoading(false); });
  }

  async function actualizarIncidencia(datarow) {
    setLoading(true);
    const { IdIncidencia, Incidencia, IdTipoIncidencia, Color} = datarow;
    setValueColor(Color);
    let data = {
        IdIncidencia: IdIncidencia
      , Incidencia: Incidencia
      , IdTipoIncidencia: isNotEmpty(IdTipoIncidencia) ? IdTipoIncidencia.toUpperCase() : ""
      , Color: isNotEmpty(Color) ? Color : ""
      , IdUsuario: usuario.username
    };
    await actualizar(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarIncidencia();
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { 
      setLoading(false);
     });
  }

  async function eliminarRegistro(data, confirm) {
    setSelectedDelete(data);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const {IdIncidencia} = selectedDelete;
      await eliminar({
        IdCliente: IdIncidencia
      }).then(response => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
      listarIncidencia();
    }
  }

  async function obtenerIncidencia(datarow) {
    setValueColor("");
    const {IdIncidencia} = datarow;
    setLoading(true);
    await obtener({ 
        IdIncidencia:IdIncidencia
       }).then(data => {
        setValueColor( isNotEmpty(data.Color) ? data.Color :  "" ) ;
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function listarIncidencia() {
    setLoading(true);
    await listar(
      {
          IdIncidencia: '%'
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setIncidencias(data);
      changeTabIndex(0);
      setModoEdicion(false);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const nuevoRegistro = () => {
    let data = { Activo: "S" }; 
    setDataRowEditNew({ ...data, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistro = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerIncidencia(dataRow);

  };

  const cancelarEdicion = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };


  const seleccionarRegistro = dataRow => {
    const { IdIncidencia, RowIndex } = dataRow;
    console.log("seleccionarRegistro|IdIncidencia:",IdIncidencia);
    setModoEdicion(false);
    setSelected(dataRow);
    setVarIdIncidencia(IdIncidencia);
    setFocusedRowKey(RowIndex);
  }

  useEffect(() => {
    loadControlsPermission();
  }, []);


  /************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    setAccessButton({ ...accessButton, ...buttonsPermissions });
  }

  //::::::::::::::::::::::::::::::::::::::::::::::::: Datos Principales ::::::::::::::::::::::::::::::::::::::::::::::::::::::
  const changeTabIndex = (index) => {
    handleChange(null, index);
  }

  async function eliminarListRowTab(rowData, confirm) {
    let currentTab = tabIndex;
    switch (currentTab) {
      // pending
    }
  }

  useEffect(() => {
    listarIncidencia();
  }, []);

  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::-Configuración - Tabs::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


  const tabContent_IncidenciaListPage = () => {
    return <>
      <IncidenciaListPage
        incidencias = {incidencias}
        editarRegistro={editarRegistro}
        eliminarRegistro={eliminarRegistro}
        nuevoRegistro={nuevoRegistro}
        titulo={titulo}
        seleccionarRegistro={seleccionarRegistro}
        focusedRowKey={focusedRowKey}
        accessButton={accessButton}
        cancelarEdicion={cancelarEdicion}
      />
    </>
  }

  const tabContent_IncidenciaEditPage = () => {
    return <>
        <IncidenciaEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarIncidencia={actualizarIncidencia}
          agregarIncidencia={agregarIncidencia}
          titulo={titulo}
          accessButton={accessButton}
          settingDataField={settingDataField}
          valueColor  ={valueColor}
          // setValueColor = {setValueColor}
          cancelarEdicion={cancelarEdicion}

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

  
  //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return <>
    <input type="hidden" value={varIdIncidencia} id="hIdCompania" name="hidIdPersona" />

    <TabNavContainer
      title={intl.formatMessage({ id: "ASSISTANCE.MAIN" })} 
      submenu={intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.PARAMETRIZACION" })}
      subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
      nombrebarra={titleHeaderToolbar()}
      tabIndex={tabIndex}
      handleChange={handleChange}
      componentTabsHeaders={[
        {
          label: intl.formatMessage({ id: "ACTION.LIST" }),
          icon: <FormatListNumberedIcon fontSize="large" />,
          disabled: false,
        },
        {
          label: intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.INCIDENCE" }),
          icon: <ReportProblem fontSize="large" />,
          onClick: () => { obtenerIncidencia(selected) },
          disabled: !tabsDisabled() && accessButton.Tabs[1] ? false : true
        },

      ]}
      className={classes.tabContent}
      componentTabsBody={
        [
          tabContent_IncidenciaListPage(),
          tabContent_IncidenciaEditPage(),
        ]
      }

    />

    <Confirm
      message={intl.formatMessage({ id: "ALERT.REMOVE" })}
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      setInstance={setInstance}
      onConfirm={() => eliminarListRowTab(selectedDelete, true)}
      title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
      confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
      cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />

  </>

};

export default injectIntl(WithLoandingPanel(IncidenciaIndexPage));

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty, dateFormat } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'
import { Portlet, PortletBody } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import {
  obtener, listar, crear, actualizar, eliminar
} from "../../../../api/asistencia/bonoNocturno.api";
import BonoNocturnoListPage from "./BonoNocturnoListPage";
import BonoNocturnoEditPage from "./BonoNocturnoEditPage";
import { serviceCompania } from "../../../../api/administracion/compania.api";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

const BonoNocturnoIndexPage = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const usuario = useSelector(state => state.auth.user);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();

  const [bonoNocturno, setBonoNocturno] = useState([]);
  const [focusedRowKey, setFocusedRowKey] = useState(0);

  const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
  const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
  const [dataRowEditNew, setDataRowEditNew] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [selected, setSelected] = useState({});
  const [selectedCompany, setSelectedCompany] = useState({});

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});
  const [varIdCompania, setVarIdCompania] = useState("");
  const [varIdDivision, setVarIdDivision] = useState("");

  const [companiaData, setCompaniaData] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const handleChange = (event, newValue) => { setTabIndex(newValue); };
  const [cmbCompania, setCmbCompania] = useState(true);

  async function agregarBonoNocturno(datarow) {
    setLoading(true);
    const { IdDivision, HoraInicio, HoraFin, Activo } = datarow;
    let data = {
      IdCliente: IdCliente
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
      , IdCompania: varIdCompania
      , HoraInicio: isNotEmpty(HoraInicio) ? dateFormat(HoraInicio, "hh:mm") : ""
      , HoraFin: isNotEmpty(HoraFin) ? dateFormat(HoraFin, "hh:mm") : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await crear(data).then(response => {
      if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
      setModoEdicion(false);
      listarBonoNocturno(varIdCompania);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function actualizarBonoNocturno(datarow) {
    setLoading(true);
    const { IdDivision, HoraInicio, HoraFin, Activo } = datarow;
    let data = {
      IdCliente: IdCliente
      , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
      , IdCompania: varIdCompania
      , HoraInicio: isNotEmpty(HoraInicio) ? dateFormat(HoraInicio, "hh:mm") : ""
      , HoraFin: isNotEmpty(HoraFin) ? dateFormat(HoraFin, "hh:mm") : ""
      , Activo: Activo
      , IdUsuario: usuario.username
    };
    await actualizar(data).then(() => {
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
      setModoEdicion(false);
      listarBonoNocturno(varIdCompania);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }


  async function eliminarRegistro(data, confirm) {
    setSelectedDelete(data);
    setIsVisible(true);
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdDivision, IdCompania } = selectedDelete;
      await eliminar({
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdCompania: IdCompania,
        IdUsuario: usuario.username
      }).then(response => {
        setVarIdDivision("");
        setFocusedRowKey();
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        listarBonoNocturno(varIdCompania);
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
  }

  async function listarBonoNocturno(idCompania) {
    setLoading(true);
    await listar(
      {
         IdCliente
        , IdDivision
        , IdCompania: idCompania
        , NumPagina: 0
        , TamPagina: 0
      }
    ).then(data => {
      setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
      setBonoNocturno(data);
      changeTabIndex(0);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  async function obtenerBonoNocturno() {
    setLoading(true);
    const {IdDivision,IdCompania} = selected
    await obtener({ IdCliente, IdDivision: IdDivision, IdCompania: IdCompania }).then(data => {
      setDataRowEditNew({ ...data, esNuevoRegistro: false });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });
  }

  const nuevoRegistro = () => {
    changeTabIndex(1);
    let data = { Activo: "S", IdCompania: varIdCompania };
    setDataRowEditNew({ ...data, IdDivision:IdDivision, esNuevoRegistro: true });
    setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
    setModoEdicion(true);
  };

  const editarRegistro = async (dataRow) => {
    changeTabIndex(1);
    const { IdDivision, IdCompania } = dataRow;
    setModoEdicion(true);
    setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
    obtenerBonoNocturno();

  };

  const cancelarEdicionBonoNocturno = () => {
    changeTabIndex(0);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
    setDataRowEditNew({});
  };



  const seleccionarRegistro = dataRow => {
    const { IdCompania,IdDivision, RowIndex } = dataRow;
    setSelected(dataRow);
    setModoEdicion(false);
    setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
    setVarIdCompania(IdCompania);
    setVarIdDivision(IdDivision);
    setFocusedRowKey(RowIndex);
  }

  const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    obtenerBonoNocturno();
  };

  const changeTabIndex = (index) => {
    handleChange(null, index);
  }


  const getInfo = () => {
    const { IdCompania, Compania } = selectedCompany;
    return [

      { text: [intl.formatMessage({ id: "COMMON.CODE" })], value: IdCompania, colSpan: 2 },
      { text: [intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })], value: Compania, colSpan: 4 }

    ];
  }

  async function listarCompanias() {
    let data = await serviceCompania.obtenerTodosConfiguracion({
      IdCliente: IdCliente,
      IdModulo: dataMenu.info.IdModulo,
      IdAplicacion: dataMenu.info.IdAplicacion,
      IdConfiguracion: "ID_COMPANIA"
    }
    ).catch(err => { handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err) });
    setCompaniaData(data);
  }



  /************--Configuración de acceso de botones*************/
  const [accessButton, setAccessButton] = useState(defaultPermissions);

  const loadControlsPermission = () => {
    let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
    setAccessButton({ ...accessButton, ...buttonsPermissions });
  }
  /***********************************************************************/
  
  const changeValueCompany = (company) => {
    if(isNotEmpty(company)){
      const { IdCompania } = company;
      setSelectedCompany(company);
      setVarIdCompania(IdCompania);
      listarBonoNocturno(IdCompania);
      setVarIdDivision("");
    }else
    {
      setSelectedCompany("");
      setVarIdCompania("");
      setBonoNocturno([]);
    }
  }

  const titleHeaderToolbar = () => {
    let tabsTitles = [
      "",
      "",
    ];
    let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
    return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
  }

  const tabsDisabled = () => {
    return (isNotEmpty(varIdCompania)  && isNotEmpty(varIdDivision) )? true : false;
  }

  useEffect(() => {
    listarCompanias();
    loadControlsPermission();
  }, []);

const tabContent_PlanillaListPage = () => {
  return <>
          <BonoNocturnoListPage
            bonoNocturno={bonoNocturno}
            editarRegistro={editarRegistro}
            eliminarRegistro={eliminarRegistro}
            nuevoRegistro={nuevoRegistro}
            seleccionarRegistro={seleccionarRegistro}
            focusedRowKey={focusedRowKey}
            accessButton={accessButton}
            verRegistroDblClick={verRegistroDblClick}
            companiaData={companiaData}
            changeValueCompany={changeValueCompany}
            varIdCompania={varIdCompania}
            setVarIdCompania={setVarIdCompania}
            setFocusedRowKey = {setFocusedRowKey}
          />
        </>
}

const tabContent_PlanillaEditPage = () => {
  return <>
        <BonoNocturnoEditPage
          modoEdicion={modoEdicion}
          dataRowEditNew={dataRowEditNew}
          actualizarBonoNocturno={actualizarBonoNocturno}
          agregarBonoNocturno={agregarBonoNocturno}
          cancelarEdicion={cancelarEdicionBonoNocturno}
          titulo={titulo}

          varIdCompania={varIdCompania}
          accessButton={accessButton}
          settingDataField={dataMenu.datos}
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
}

return (
  <>
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
        },
        {
           label: intl.formatMessage({ id: "ASSISTANCE.NIGHT.BONUS.TAB" }),
           icon: <LocalAtmIcon fontSize="large" />,
           onClick: (e) => { obtenerBonoNocturno() },
           disabled: !tabsDisabled()
        },
      ]}
      className={classes.tabContent}
      componentTabsBody={
        [
          tabContent_PlanillaListPage(),
          tabContent_PlanillaEditPage(),
        ]
      }
    />

    <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarRegistro(selectedDelete, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
     />

  </>
);
};


function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <Portlet
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Portlet>
  );
}
TabPanel.propTypes =
{
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};
function tabPropsIndex(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default injectIntl(WithLoandingPanel(BonoNocturnoIndexPage));

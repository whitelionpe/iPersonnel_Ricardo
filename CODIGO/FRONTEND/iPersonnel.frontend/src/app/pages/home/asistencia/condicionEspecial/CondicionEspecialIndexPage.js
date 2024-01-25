import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'
import { Portlet, PortletBody } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import FormatIndentIncrease from '@material-ui/icons/FormatIndentIncrease';
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import {
    obtener,
    listar,
    crear,
    actualizar,
    eliminar
} from "../../../../api/asistencia/condicionEspecial.api";
import CondicionEspecialListPage from "./CondicionEspecialListPage";
import CondicionEspecialEditPage from "./CondicionEspecialEditPage";
import { serviceCompania } from "../../../../api/administracion/compania.api";
import TabNavContainer from "../../../../partials/components/Tabs/TabNavContainer";

const CondicionEspecialIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const { IdCliente } = useSelector(state => state.perfil.perfilActual);

    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [condicionEspecial, setCondicionEspecial] = useState([]);
    const [varIdCondicionEspecial, setVarIdCondicionEspecial] = useState("");
    const [varIdCompania, setVarIdCompania] = useState("");
    const [focusedRowKey, setFocusedRowKey] = useState(0);

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [selected, setSelected] = useState({});
    const [selectedCompany, setSelectedCompany] = useState({});
    const [selectedDelete, setSelectedDelete] = useState({});
    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event, newValue) => { setTabIndex(newValue); };

    const [isVisible, setIsVisible] = useState(false);
    const [instance, setInstance] = useState({});
    const [companiaData, setCompaniaData] = useState([]);


    async function agregarCondicionEspecial(datarow) {
        setLoading(true);
        const { IdCompania, IdCondicionEspecial, CondicionEspecial, DerechoLaboral, Descripcion, NombreProcedimiento, Activo } = datarow;
        let data = {
            IdCliente: IdCliente
            , IdCompania: varIdCompania
            , IdCondicionEspecial: isNotEmpty(IdCondicionEspecial) ? IdCondicionEspecial.toUpperCase() : ""
            , CondicionEspecial: isNotEmpty(CondicionEspecial) ? CondicionEspecial.toUpperCase() : ""
            , DerechoLaboral: isNotEmpty(DerechoLaboral) ? DerechoLaboral.toUpperCase() : ""
            , Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : ""
            , NombreProcedimiento: isNotEmpty(NombreProcedimiento) ? NombreProcedimiento.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(data).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarCondicionEspecial(varIdCompania);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function actualizarCondicionEspecial(datarow) {
        setLoading(true);
        const { IdCliente, IdCompania, IdCondicionEspecial, CondicionEspecial, DerechoLaboral, Descripcion, NombreProcedimiento, Activo } = datarow;
        let data = {
            IdCliente: IdCliente
            , IdCompania: varIdCompania
            , IdCondicionEspecial: isNotEmpty(IdCondicionEspecial) ? IdCondicionEspecial.toUpperCase() : ""
            , CondicionEspecial: isNotEmpty(CondicionEspecial) ? CondicionEspecial.toUpperCase() : ""
            , DerechoLaboral: isNotEmpty(DerechoLaboral) ? DerechoLaboral.toUpperCase() : ""
            , Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : ""
            , NombreProcedimiento: isNotEmpty(NombreProcedimiento) ? NombreProcedimiento.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(data).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarCondicionEspecial(varIdCompania);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function eliminarRegistro(dataRow, confirm) {
      setSelectedDelete(dataRow);
        setIsVisible(true);
        if (confirm) {
            setLoading(true);
            const { IdCliente, IdCompania, IdCondicionEspecial } = selectedDelete;
            await eliminar({ IdCliente: IdCliente, IdCompania: IdCompania, IdCondicionEspecial: IdCondicionEspecial, IdUsuario: usuario.username }).then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
                listarCondicionEspecial(varIdCompania);
                setVarIdCondicionEspecial("");
                setFocusedRowKey();
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
           
        }
    }

    async function listarCondicionEspecial(idCompania) {
        setLoading(true);
        await listar(
            {
                  IdCliente
                , IdCompania: idCompania
                , IdCondicionEspecial: '%'
                , NumPagina: 0
                , TamPagina: 0
            }
        ).then(data => {
            setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
            setCondicionEspecial(data);
            changeTabIndex(0);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function obtenerCondicionEspecial() {
        setLoading(true);
        const {IdCompania,IdCondicionEspecial,} = selected;
        await obtener({ 
           IdCliente,
           IdCompania: IdCompania,
           IdCondicionEspecial: IdCondicionEspecial
           }).then(data => {
            setDataRowEditNew({ ...data, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    const nuevoRegistro = () => {
        changeTabIndex(1);
        let data = { Activo: "S", IdCompania: varIdCompania };
        setDataRowEditNew({ ...data, Longitud: 0, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerCondicionEspecial();

    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { IdCompania, IdCondicionEspecial, RowIndex } = dataRow;
        setSelected(dataRow);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
            setVarIdCompania(IdCompania);
            setVarIdCondicionEspecial(IdCondicionEspecial);
            setFocusedRowKey(RowIndex);

    }

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        obtenerCondicionEspecial();
    };

    const changeTabIndex = (index) => {
        handleChange(null, index);
    }

    /************--Configuración de acceso de botones*************/
    const [accessButton, setAccessButton] = useState(defaultPermissions);

    const loadControlsPermission = () => {
        let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
        setAccessButton({ ...accessButton, ...buttonsPermissions });
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


    /***********************************************************************/
    const changeValueCompany = (company) => {
      if(isNotEmpty(company)){
        const { IdCompania } = company;
        setSelectedCompany(company);
        setVarIdCompania(IdCompania);
        listarCondicionEspecial(IdCompania);
        setVarIdCondicionEspecial("");
      }else
      {
        setSelectedCompany("");
        setVarIdCompania("");
        setCondicionEspecial([]);
      }
    }


    const titleHeaderToolbar = () => {
      let tabsTitles = [
        "",
        intl.formatMessage({ id: "ASSISTANCE.SPECIAL.CONDITIONS" }),
      ];
      let sufix = tabsTitles[tabIndex] !== "" ? (" - " + `${intl.formatMessage({ id: tabsTitles[tabIndex] })}`) : "";
      return `${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} ` + " " + sufix;
    }

    const tabsDisabled = () => {
      return (isNotEmpty(varIdCompania)  && isNotEmpty(varIdCondicionEspecial) )? true : false;
    }

    useEffect(() => {
        loadControlsPermission();
        listarCompanias();
    }, []);

const tabContent_PlanillaListPage = () => {
  return <>
            <CondicionEspecialListPage
                condicionEspecial={condicionEspecial}
                editarRegistro={editarRegistro}
                eliminarRegistro={eliminarRegistro}
                nuevoRegistro={nuevoRegistro}
                seleccionarRegistro={seleccionarRegistro}
                verRegistroDblClick={verRegistroDblClick}
                focusedRowKey={focusedRowKey}
                accessButton={accessButton}
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
            <CondicionEspecialEditPage
                modoEdicion={modoEdicion}
                dataRowEditNew={dataRowEditNew}
                actualizarCondicionEspecial={actualizarCondicionEspecial}
                agregarCondicionEspecial={agregarCondicionEspecial}
                cancelarEdicion={cancelarEdicion}
                titulo={titulo}
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
           label: intl.formatMessage({ id: "ASSISTANCE.SPECIAL.CONDITIONS" }),
           icon: <FormatIndentIncrease fontSize="large" />,
           onClick: (e) => { obtenerCondicionEspecial() },
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


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


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

export default injectIntl(WithLoandingPanel(CondicionEspecialIndexPage));

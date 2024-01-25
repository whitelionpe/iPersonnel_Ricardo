import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import Crop32Icon from '@material-ui/icons/Crop32';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'
import {
    obtener,
    listar,
    crear,
    actualizar,
    eliminar
} from "../../../../api/campamento/tipoModulo.api";
import TipoModuloListPage from "./TipoModuloListPage";
import TipoModuloEditPage from "./TipoModuloEditPage";


const TipoModuloIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;

    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [varIdTipoModulo, setVarIdTipoModulo] = useState("");
    const [TipoModuloData, setTipoModuloData] = useState([]);
    const [focusedRowKey, setFocusedRowKey] = useState(0);

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [selected, setSelected] = useState({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision });
    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event, newValue) => { setTabIndex(newValue); };

    const [isVisible, setIsVisible] = useState(false);
    const [instance, setInstance] = useState({});

    const [modoEdicionReporte, setModoEdicionReporte] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [expandRow, setExpandRow] = useState(0);


    async function agregarTipoModulo(tipoModulo) {
        setLoading(true);
        const { IdCliente, IdDivision, IdTipoModulo, TipoModulo, Activo } = tipoModulo;
        let params = {
            IdCliente
            , IdDivision
            , IdTipoModulo: isNotEmpty(IdTipoModulo) ? IdTipoModulo.toUpperCase() : ""
            , TipoModulo: isNotEmpty(TipoModulo) ? TipoModulo.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await crear(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarTipoModulo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function actualizarTipoModulo(dataRow) {
        //debugger;
        setLoading(true);
        const { IdCliente, IdDivision, IdTipoModulo, TipoModulo, Activo } = dataRow;
        let params = {
            IdCliente
            , IdDivision
            , IdTipoModulo: isNotEmpty(IdTipoModulo) ? IdTipoModulo.toUpperCase() : ""
            , TipoModulo: isNotEmpty(TipoModulo) ? TipoModulo.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await actualizar(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarTipoModulo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    /*     async function eliminarRegistro(dataRow) {
            setLoading(true);
    
            const { IdCliente, IdDivision, IdTipoModulo } = dataRow;
            await eliminar({
                IdCliente
                , IdDivision
                , IdTipoModulo
            }).then(() => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
            listarTipoModulo();
        } */

    async function eliminarRegistro(dataRow, confirm) {
        setSelected(dataRow);
        setIsVisible(true);
        if (confirm) {
            setLoading(true);
            const { IdCliente, IdDivision, IdTipoModulo } = dataRow;
            await eliminar({
                IdCliente
                , IdDivision
                , IdTipoModulo
            }).then(() => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
            listarTipoModulo();
        }
    }


    /*async function listarTipoModulo() {
        const { IdCliente, IdDivision } = selected;
        let TipoModulo = await listar(
            {
                IdCliente
                , IdDivision
                , NumPagina: 0
                , TamPagina: 0
            }
        );
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setTipoModuloData(TipoModulo);
        changeTabIndex(0);
        //setModoEdicion(false);
    }*/

    async function listarTipoModulo() {
        setLoading(true);
        setModoEdicion(false);
        const { IdCliente, IdDivision } = selected;
        await listar(
            {
                IdCliente
                , IdDivision
                , NumPagina: 0
                , TamPagina: 0
            }).then(TipoModulo => {
                setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
                setTipoModuloData(TipoModulo);
                changeTabIndex(0);
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
    }

    async function obtenerTipoModulo() {
      setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        setLoading(true);
        const { IdCliente, IdDivision, IdTipoModulo } = selected;
        await obtener({
            IdCliente
            , IdDivision
            , IdTipoModulo
        }).then(tipoModulo => {
            setDataRowEditNew({ ...tipoModulo, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    /* async function obtenerTipoModulo() {
         const { IdCliente, IdDivision, IdTipoModulo } = selected;
         if (isNotEmpty(IdTipoModulo)) {
             let TipoModulo = await obtener({
                 IdCliente
                 , IdDivision
                 , IdTipoModulo
             });
             setDataRowEditNew({ ...TipoModulo, esNuevoRegistro: false });
         }
     }*/


    const nuevoRegistro = () => {
        changeTabIndex(1);
        const { IdCliente, IdDivision } = selected;
        let tipoModulo = { Activo: "S", IdCliente, IdDivision };
        setDataRowEditNew({ ...tipoModulo, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = async (dataRow) => {
        changeTabIndex(1);
        const { IdTipoModulo, RowIndex } = dataRow;
        setModoEdicion(true);
        await obtenerTipoModulo(IdTipoModulo);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        setFocusedRowKey(RowIndex);
    };

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerTipoModulo(dataRow);
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        //setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        localStorage.setItem('dataRowReporte', JSON.stringify(dataRow));
        const { IdTipoModulo, RowIndex } = dataRow;
        //setModoEdicion(false);
        //setSelected(dataRow);
        //setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdTipoModulo != varIdTipoModulo) {
            setVarIdTipoModulo(IdTipoModulo);
            setFocusedRowKey(RowIndex);

            setExpandRow(RowIndex);
            setCollapsed(false);
            setSelected(dataRow);
        }
    }


    const seleccionarReporte = async (dataRow) => {
    }
    const changeTabIndex = (index) => {
        handleChange(null, index);
    }

    /**********************--Configuración de acceso de botones-************************************* */
    const [accessButton, setAccessButton] = useState(defaultPermissions);

    const loadControlsPermission = () => {
        let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
        setAccessButton({ ...accessButton, ...buttonsPermissions });
    }
    /************************************************************************************************** */


    useEffect(() => {
        listarTipoModulo();
        loadControlsPermission();
    }, []);



    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs
                        Title={intl.formatMessage({ id: "CAMP.TYPEMODULE.MENU" })}
                        SubMenu={intl.formatMessage({ id: "CAMP.TYPEMODULE.SUBMENU" })}
                        Subtitle={intl.formatMessage({ id: "CAMP.TYPEMODULE.MAINTENANCE" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "CAMP.TYPEMODULE.MAINTENANCE" })}

                                </Typography>
                            </Toolbar>
                        </AppBar>
                        <>
                            <div className={classes.root}>
                                <Tabs
                                    orientation="vertical"
                                    value={tabIndex}
                                    onChange={handleChange}
                                    aria-label="Vertical tabs"
                                    className={classes.tabs}
                                    variant="fullWidth"
                                    indicatorColor="primary"
                                    textColor="primary" >
                                    <Tab
                                        label={intl.formatMessage({ id: "ACTION.LIST" })}
                                        icon={<FormatListNumberedIcon fontSize="large" />}
                                        onClick={(e => listarTipoModulo())} 
                                        {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "CAMP.TYPEMODULE" })}
                                        icon={<Crop32Icon fontSize="large" />}
                                        onClick={(e => obtenerTipoModulo(selected))} 
                                        {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdTipoModulo) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    {!modoEdicion && !modoEdicionReporte && (
                                        <>
                                            <TipoModuloListPage
                                                TipoModuloData={TipoModuloData}
                                                titulo={titulo}
                                                editarRegistro={editarRegistro}
                                                eliminarRegistro={eliminarRegistro}
                                                nuevoRegistro={nuevoRegistro}
                                                seleccionarRegistro={seleccionarRegistro}
                                                // verRegistroDblClick={verRegistroDblClick}
                                                focusedRowKey={focusedRowKey}
                                                accessButton={accessButton}

                                                seleccionarReporte={seleccionarReporte}
                                                expandRow={{ expandRow, setExpandRow }}
                                                collapsedRow={{ collapsed, setCollapsed }}
                                            />
                                        </>
                                    )}
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                        <TipoModuloEditPage
                                            actualizarTipoModulo={actualizarTipoModulo}
                                            agregarTipoModulo={agregarTipoModulo}
                                            cancelarEdicion={cancelarEdicion}
                                            modoEdicion={modoEdicion}
                                            titulo={titulo}
                                            dataRowEditNew={dataRowEditNew}
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
                                </TabPanel>
                            </div>
                        </>
                    </Portlet>
                </div>
            </div>
            <Confirm
                message={intl.formatMessage({ id: "ALERT.REMOVE" })}
                isVisible={isVisible}
                setIsVisible={setIsVisible}
                setInstance={setInstance}
                onConfirm={() => eliminarRegistro(selected, true)}
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
export default injectIntl(WithLoandingPanel(TipoModuloIndexPage));

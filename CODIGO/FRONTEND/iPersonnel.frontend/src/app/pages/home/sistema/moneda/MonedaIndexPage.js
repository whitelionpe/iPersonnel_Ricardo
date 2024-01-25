import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'
import { Portlet } from "../../../../partials/content/Portlet";
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
import LocalAtmIcon from '@material-ui/icons/LocalAtm';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../api/sistema/moneda.api";
import MonedaListPage from "./MonedaListPage";
import MonedaEditPage from "./MonedaEditPage";

const MonedaIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [monedas, setMonedas] = useState([]);
    const [varIdMoneda, setVarIdMoneda] = useState("");
    const [focusedRowKey, setFocusedRowKey] = useState(0);

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [selected, setSelected] = useState({});
    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event, newValue) => { setTabIndex(newValue); };
    const [isVisible, setIsVisible] = useState(false);
    const [instance, setInstance] = useState({});


    async function agregarMoneda(moneda) {
        setLoading(true);
        const { IdMoneda, Moneda, Formato, Activo } = moneda;
        let params = {
            IdMoneda: isNotEmpty(IdMoneda) ? IdMoneda.toUpperCase() : ""
            , Moneda: isNotEmpty(Moneda) ? Moneda.toUpperCase() : ""
            , Formato : isNotEmpty(Formato) ? Formato: ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarMonedas();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function actualizarMoneda(moneda) {
        setLoading(true);
        const { IdMoneda, Moneda, Formato, Activo } = moneda;
        let params = {
            IdMoneda: isNotEmpty(IdMoneda) ? IdMoneda.toUpperCase() : ""
            , Moneda: isNotEmpty(Moneda) ? Moneda.toUpperCase() : ""
            , Formato : isNotEmpty(Formato) ? Formato: ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await actualizar(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarMonedas();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function eliminarRegistro(moneda, confirm) {
        setSelected(moneda);
        setIsVisible(true);
        if (confirm) {
            setLoading(true);
            const { IdMoneda } = moneda;
            await eliminar({ IdMoneda, IdUsuario: usuario.username }).then(() => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
            listarMonedas();
        }
    }

    async function listarMonedas() {
        setLoading(true);
        await listar(
            {
                IdMoneda: "%"
                , Moneda: "%"
                , NumPagina: 0
                , TamPagina: 0
            }).then(monedas => {
                setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
                setMonedas(monedas);
                changeTabIndex(0);
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
    }

    async function obtenerMoneda() {
        setLoading(true);
        const { IdMoneda } = selected;
        await obtener({
            IdMoneda
        }).then(moneda => {
            setDataRowEditNew({ ...moneda, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    const nuevoRegistro = () => {
        changeTabIndex(1)
        let moneda = { Activo: "S" };
        setDataRowEditNew({ ...moneda, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = async (dataRow) => {
        changeTabIndex(1);
        const { IdMoneda, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        await obtenerMoneda(IdMoneda);
        setFocusedRowKey(RowIndex);
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { IdMoneda, RowIndex } = dataRow;
        setModoEdicion(false);
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdMoneda != varIdMoneda) {
            setVarIdMoneda(IdMoneda);
            setFocusedRowKey(RowIndex);
        }
    }

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerMoneda(dataRow);
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
    /***********************************************************************/

    useEffect(() => {
        listarMonedas();
        loadControlsPermission();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs Title={intl.formatMessage({ id: "SYSTEM" }) + " / " + intl.formatMessage({ id: "COMMON.GENERALS" })} Subtitle={intl.formatMessage({ id: "SYSTEM.CURRENCY.MAINTENANCE" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {(intl.formatMessage({ id: "SYSTEM.CURRENCY.MAINTENANCE" })).toUpperCase()}
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
                                        //onClick={listarMonedas} 
                                        {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "SYSTEM.CURRENCY" })}
                                        icon={<LocalAtmIcon fontSize="large" />}
                                        onClick={(e => obtenerMoneda(selected))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdMoneda) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <MonedaListPage
                                        monedas={monedas}
                                        editarRegistro={editarRegistro}
                                        eliminarRegistro={eliminarRegistro}
                                        nuevoRegistro={nuevoRegistro}
                                        seleccionarRegistro={seleccionarRegistro}
                                        verRegistroDblClick={verRegistroDblClick}
                                        focusedRowKey={focusedRowKey}
                                        accessButton={accessButton}
                                    />
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                        <MonedaEditPage
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarMoneda={actualizarMoneda}
                                            agregarMoneda={agregarMoneda}
                                            cancelarEdicion={cancelarEdicion}
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
export default injectIntl(WithLoandingPanel(MonedaIndexPage));

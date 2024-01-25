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
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import ViewCompactIcon from '@material-ui/icons/ViewCompact';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../api/casino/categoriaCosto.api";
import CategoriaCostoListPage from "./CategoriaCostoListPage";
import CategoriaCostoEditPage from "./CategoriaCostoEditPage";

const CategoriaCostoIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [categoriaCosto, setCategoriaCosto] = useState([]);
    const [varIdCategoriaCosto, setVarIdCategoriaCosto] = useState("");
    const [focusedRowKey, setFocusedRowKey] = useState(0);

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);

    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [selected, setSelected] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event, newValue) => { setTabIndex(newValue); };

    const [isVisible, setIsVisible] = useState(false);
    const [instance, setInstance] = useState({});

    async function agregarCategoriaCosto(dataRow) {
        setLoading(true);
        const { IdCategoriaCosto, CategoriaCosto, Activo } = dataRow;
        console.log("agregarCategoriaCosto|dataRow",dataRow);
        let params = {
            IdCliente: perfil.IdCliente
            , IdCategoriaCosto: isNotEmpty(IdCategoriaCosto) ? IdCategoriaCosto.toUpperCase() : ""
            , CategoriaCosto: isNotEmpty(CategoriaCosto) ? CategoriaCosto.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarCategoriaCosto();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }


    async function actualizarCategoriaCosto(dataRow) {
        setLoading(true);
        const { IdCategoriaCosto, CategoriaCosto, Activo } = dataRow;
        let params = {
            IdCliente: perfil.IdCliente
            , IdCategoriaCosto: isNotEmpty(IdCategoriaCosto) ? IdCategoriaCosto.toUpperCase() : ""
            , CategoriaCosto: isNotEmpty(CategoriaCosto) ? CategoriaCosto.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarCategoriaCosto();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }


    async function eliminarRegistro(selected, confirm) {
        setSelected(selected);
        setIsVisible(true);
        if (confirm) {
            setLoading(true);
            const { IdCliente, IdCategoriaCosto } = selected;
            await eliminar({ IdCliente: IdCliente, IdCategoriaCosto: IdCategoriaCosto }).then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
            listarCategoriaCosto();
        }
    }

    async function listarCategoriaCosto() {
        setLoading(true);
        await listar({
            IdCliente: perfil.IdCliente, NumPagina: 0, TamPagina: 0
        }).then(data => {
            setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
            setCategoriaCosto(data);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });


    }

    async function obtenerCategoriaCosto() {
        setLoading(true);
        const { IdCategoriaCosto, IdCliente } = selected;
        await obtener({
            IdCliente,
            IdCategoriaCosto
        }).then(data => {
            setDataRowEditNew({ ...data, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }


    const nuevoRegistro = () => {
        let categoriaCosto = { Activo: "S" };
        setDataRowEditNew({ ...categoriaCosto, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        obtenerCategoriaCosto(dataRow);
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setVarIdCategoriaCosto("");
    };

    const seleccionarRegistro = dataRow => {
        const { IdCategoriaCosto, RowIndex } = dataRow;
        setSelected(dataRow);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdCategoriaCosto != varIdCategoriaCosto) {
            setVarIdCategoriaCosto(IdCategoriaCosto);
            setFocusedRowKey(RowIndex);
        }
    }

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerCategoriaCosto(dataRow);
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


    useEffect(() => {
        listarCategoriaCosto();
        loadControlsPermission();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <Portlet className={classesEncabezado.border}>
                        <CustomBreadcrumbs
                            Title={intl.formatMessage({ id: "CASINO.TYPE.MENU" })}
                            SubMenu={intl.formatMessage({ id: "CASINO.CATEGORY.COST.CONFIGURATION" })}
                            Subtitle={intl.formatMessage({ id: "CASINO.CATEGORY.COST.MENU" })}
                        />
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "CASINO.CATEGORY.COST.MAINTENANCE" })}
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
                                        onClick={listarCategoriaCosto} {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "CASINO.CATEGORY.COST.MENU" })}
                                        icon={<SupervisedUserCircleIcon fontSize="large" />}
                                        onClick={(e => obtenerCategoriaCosto(selected))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdCategoriaCosto) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>

                                    {!modoEdicion && (
                                        <CategoriaCostoListPage
                                            categoriaCosto={categoriaCosto}
                                            editarRegistro={editarRegistro}
                                            eliminarRegistro={eliminarRegistro}
                                            nuevoRegistro={nuevoRegistro}
                                            seleccionarRegistro={seleccionarRegistro}
                                            verRegistroDblClick={verRegistroDblClick}
                                            focusedRowKey={focusedRowKey}
                                            accessButton={accessButton}
                                        />
                                    )}
                                    {modoEdicion && (
                                        <>
                                            <CategoriaCostoEditPage
                                                titulo={titulo}
                                                modoEdicion={modoEdicion}
                                                dataRowEditNew={dataRowEditNew}
                                                actualizarCategoriaCosto={actualizarCategoriaCosto}
                                                agregarCategoriaCosto={agregarCategoriaCosto}
                                                cancelarEdicion={cancelarEdicion}
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

                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                        <CategoriaCostoEditPage
                                            titulo={intl.formatMessage({ id: "ACTION.VIEW" })}
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            cancelarEdicion={cancelarEdicion}
                                            accessButton={accessButton}
                                            
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

export default injectIntl(WithLoandingPanel(CategoriaCostoIndexPage));

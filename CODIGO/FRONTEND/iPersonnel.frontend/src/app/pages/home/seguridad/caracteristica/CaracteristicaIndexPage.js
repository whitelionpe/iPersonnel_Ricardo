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
import FolderSharedIcon from '@material-ui/icons/FolderShared';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {  serviceCaracteristica } from "../../../../api/seguridad/caracteristica.api";
import CaracteristicaListPage from "./CaracteristicaListPage";
import CaracteristicaEditPage from "./CaracteristicaEditPage";

const CaracteristicaIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [caracteristicas, setCaracteristicas] = useState([]);
    const [varIdCaracteristica, setVarIdCaracteristica] = useState("");
    const [focusedRowKey, setFocusedRowKey] = useState(0);

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [selected, setSelected] = useState({
        IdCliente: perfil.IdCliente
    });
    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event, newValue) => { setTabIndex(newValue); };

    const [isVisible, setIsVisible] = useState(false);
    const [instance, setInstance] = useState({});


    async function agregarCaracteristica(caracteristica) {
        setLoading(true);
        const { IdCliente, IdCaracteristica, Caracteristica, Activo } = caracteristica;
        let params = {
            IdCaracteristica: isNotEmpty(IdCaracteristica) ? IdCaracteristica.toUpperCase() : ""
            , Caracteristica: isNotEmpty(Caracteristica) ? Caracteristica.toUpperCase() : ""
            , IdCliente
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await serviceCaracteristica.crear(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarCaracteristica();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function actualizarCaracteristica(caracteristica) {
        setLoading(true);
        const { IdCliente, IdCaracteristica, Caracteristica, Activo } = caracteristica;
        let params = {
            IdCaracteristica: isNotEmpty(IdCaracteristica) ? IdCaracteristica.toUpperCase() : ""
            , Caracteristica: isNotEmpty(Caracteristica) ? Caracteristica.toUpperCase() : ""
            , IdCliente
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await serviceCaracteristica.actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarCaracteristica();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function eliminarRegistro(caracteristica, confirm) {
        setSelected(caracteristica);
        setIsVisible(true);
        if (confirm) {
            setLoading(true);
            const { IdCliente, IdCaracteristica } = caracteristica;
            await serviceCaracteristica.eliminar({
                IdCliente,
                IdCaracteristica,
                IdUsuario: usuario.username
            }).then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
            listarCaracteristica();
        }
    }

    async function listarCaracteristica() {
        setLoading(true);
        const { IdCliente } = selected
        await serviceCaracteristica.listar(
            IdCliente
        ).then(caracteristica => {
            setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
            setCaracteristicas(caracteristica);
            changeTabIndex(0);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }


    async function obtenerCaracteristica() {
        setLoading(true);
        const { IdCliente, IdCaracteristica } = selected;
        await serviceCaracteristica.obtener({
            IdCliente,
            IdCaracteristica
        }).then(caracteristica => { //a
            setDataRowEditNew({ ...caracteristica, esNuevoRegistro: false });//
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    const nuevoRegistro = () => {
        changeTabIndex(1);
        const { IdCliente } = selected;
        let caracteristica = { Activo: "S", IdCliente };
        setDataRowEditNew({ ...caracteristica, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = async (dataRow) => {
        changeTabIndex(1);
        const { IdCaracteristica, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerCaracteristica(IdCaracteristica);
        setFocusedRowKey(RowIndex);
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { IdCaracteristica, RowIndex } = dataRow;
        setModoEdicion(false);
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdCaracteristica != varIdCaracteristica) {
            setVarIdCaracteristica(IdCaracteristica);
            setFocusedRowKey(RowIndex);
        }
    }

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerCaracteristica(dataRow);
    };


    /************--Configuración de acceso de botones***********************/
    const [accessButton, setAccessButton] = useState(defaultPermissions);

    const loadControlsPermission = () => {
        let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
        setAccessButton({ ...accessButton, ...buttonsPermissions });
    }
    /***********************************************************************/

    const changeTabIndex = (index) => {
        handleChange(null, index);
    }

    useEffect(() => {
        listarCaracteristica();
        loadControlsPermission();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs Title={intl.formatMessage({ id: "SECURITY.CHARACTERISTIC.MENU" })} SubMenu={intl.formatMessage({ id: "SECURITY.CHARACTERISTIC.SUBMENU" })} Subtitle={intl.formatMessage({ id: "SECURITY.CHARACTERISTIC.MAINTENANCE" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "SECURITY.CHARACTERISTIC.MAINTENANCE" }).toUpperCase()}
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
                                        onClick={listarCaracteristica} {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "SECURITY.CHARACTERISTIC.CHARACTERISTIC" })}
                                        icon={<FolderSharedIcon fontSize="large" />}
                                        onClick={(e => obtenerCaracteristica(varIdCaracteristica))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdCaracteristica) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <CaracteristicaListPage
                                        titulo={titulo}
                                        caracteristicas={caracteristicas}
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
                                        <CaracteristicaEditPage
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarCaracteristica={actualizarCaracteristica}
                                            agregarCaracteristica={agregarCaracteristica}
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

export default injectIntl(WithLoandingPanel(CaracteristicaIndexPage));

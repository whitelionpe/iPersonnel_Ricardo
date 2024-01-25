import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import DriveEtaIcon from '@material-ui/icons/DriveEta';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../api/administracion/tipoVehiculo.api";
import TipoVehiculoListPage from "./TipoVehiculoListPage";
import TipoVehiculoEditPage from "./TipoVehiculoEditPage";




const TipoVehiculoIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [tipoVehiculos, setTipoVehiculos] = useState([]);
    const [varIdTipoVehiculo, setVarIdTipoVehiculo] = useState("");
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


    async function agregarTipoVehiculo(tipoVehiculo) {
        setLoading(true);
        const { IdCliente, IdTipoVehiculo, TipoVehiculo, Activo } = tipoVehiculo;
        let params = {
            IdTipoVehiculo: isNotEmpty(IdTipoVehiculo) ? IdTipoVehiculo.toUpperCase() : ""
            , TipoVehiculo: isNotEmpty(TipoVehiculo) ? TipoVehiculo.toUpperCase() : ""
            , IdCliente
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarTipoVehiculo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }

    async function actualizarTipoVehiculo(tipoVehiculo) {
        setLoading(true);
        const { IdCliente, IdTipoVehiculo, TipoVehiculo, Activo } = tipoVehiculo;
        let params = {
            IdTipoVehiculo: isNotEmpty(IdTipoVehiculo) ? IdTipoVehiculo.toUpperCase() : ""
            , TipoVehiculo: isNotEmpty(TipoVehiculo) ? TipoVehiculo.toUpperCase() : ""
            , IdCliente
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarTipoVehiculo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }

    async function eliminarRegistro(tipoVehiculo, confirm) {
        setSelected(tipoVehiculo);
        setIsVisible(true);
        if (confirm) {
        setLoading(true);
        const { IdCliente, IdTipoVehiculo } = tipoVehiculo;
        await eliminar({
            IdCliente: IdCliente,
            IdTipoVehiculo: IdTipoVehiculo,
            IdUsuario: usuario.username
        }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
        listarTipoVehiculo();
    }
    }

    async function listarTipoVehiculo() {
        setLoading(true);
        const { IdCliente } = selected;
        await listar()
            .then(tipoVehiculo => {
                setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
                setTipoVehiculos(tipoVehiculo);
                changeTabIndex(0);
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            }).finally(() => { setLoading(false); });
    }


    async function obtenerTipoVehiculo() {
        setLoading(true);
        const { IdCliente, IdTipoVehiculo } = selected;
        await obtener({
            IdCliente: IdCliente,
            IdTipoVehiculo: IdTipoVehiculo
        }).then(tipoVehiculo => {
            setDataRowEditNew({ ...tipoVehiculo, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }


    const nuevoRegistro = () => {
        changeTabIndex(1);
        const { IdCliente } = selected;
        let tipoVehiculo = { Activo: "S", IdCliente };
        setDataRowEditNew({ ...tipoVehiculo, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = async (dataRow) => {
        changeTabIndex(1);
        const { IdTipoVehiculo, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerTipoVehiculo(IdTipoVehiculo);
        setFocusedRowKey(RowIndex);
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };


    const seleccionarRegistro = dataRow => {
        const { IdTipoVehiculo, RowIndex } = dataRow;
        setModoEdicion(false);
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdTipoVehiculo != varIdTipoVehiculo) {
            setVarIdTipoVehiculo(IdTipoVehiculo);
            setFocusedRowKey(RowIndex);
        }
    }

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerTipoVehiculo(dataRow);
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
        listarTipoVehiculo();
        loadControlsPermission();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs
                        Title={intl.formatMessage({ id: "ADMINISTRATION.VEHICLETYPE.MENU" })}
                        SubMenu={intl.formatMessage({ id: "ADMINISTRATION.VEHICLETYPE.SUBMENU" })}
                        Subtitle={intl.formatMessage({ id: "ADMINISTRATION.VEHICLETYPE.MAINTENANCE" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "ADMINISTRATION.VEHICLETYPE.MAINTENANCE" }).toUpperCase()}
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
                                        onClick={listarTipoVehiculo} {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "ADMINISTRATION.VEHICLETYPE.VEHICLETYPE" })}
                                        icon={<DriveEtaIcon fontSize="large" />}
                                        onClick={(e => obtenerTipoVehiculo(varIdTipoVehiculo))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdTipoVehiculo) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <TipoVehiculoListPage
                                        titulo={titulo}
                                        tipoVehiculos={tipoVehiculos}
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
                                        <TipoVehiculoEditPage
                                            titulo={titulo}
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarTipoVehiculo={actualizarTipoVehiculo}
                                            agregarTipoVehiculo={agregarTipoVehiculo}
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

export default injectIntl(WithLoandingPanel(TipoVehiculoIndexPage));

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty } from "../../../../../_metronic";
import { Portlet } from "../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel"
import Confirm from "../../../../partials/components/Confirm";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import RestaurantIcon from '@material-ui/icons/Restaurant';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'
 
import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../api/casino/casinoTipo.api";
import CasinoTipoListPage from "./CasinoTipoListPage";
import CasinoTipoEditPage from "./CasinoTipoEditPage";


const CasinoTipoIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [varIdTipo, setVarIdTipo] = useState("");
    const [casinoTipos, setcasinoTipos] = useState([]);
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


    async function agregarCasinoTipo(comedorTipo) {
        setLoading(true);
        const { IdTipo, Tipo, Activo } = comedorTipo;
        let params = {
            IdTipo: isNotEmpty(IdTipo) ? IdTipo.toUpperCase() : ""
            , Tipo: isNotEmpty(Tipo) ? Tipo.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            //setModoEdicion(false);
            listarCasinoTipo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }


    async function actualizarCasinoTipo(casinoTipo) {
        setLoading(true);
        const { IdTipo, Tipo, Activo } = casinoTipo;
        let params = {
            IdTipo: isNotEmpty(IdTipo) ? IdTipo.toUpperCase() : ""
            , Tipo: isNotEmpty(Tipo) ? Tipo.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            //setModoEdicion(false);
            listarCasinoTipo();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }

    async function eliminarRegistro(casinoTipo, confirm) {
        setSelected(casinoTipo);
        setIsVisible(true);
        if (confirm) {
        setLoading(true);
        const { IdTipo } = casinoTipo;
        await eliminar({
            IdTipo: IdTipo,
            IdUsuario: usuario.username
        }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
        listarCasinoTipo();
    }
}

    async function listarCasinoTipo() {
        setLoading(true);
        await listar()
        .then(casinoTipo => {
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setcasinoTipos(casinoTipo);
        changeTabIndex(0);
    }).catch(err => {
        handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    }).finally(() => { setLoading(false); });
    }



    async function obtenerCasinoTipo(filtro) {
        setLoading(true); 
        await obtener({
            IdTipo: filtro
        }).then(comedor => {
            setDataRowEditNew({ ...comedor, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        })
            .finally(() => { setLoading(false); });
    }


    const nuevoRegistro = () => {
        changeTabIndex(1);
        let casinoTipo = { Activo: "S" };
        setDataRowEditNew({ ...casinoTipo, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };


    const editarRegistro = async (dataRow) => {
        changeTabIndex(1);
        const { IdTipo, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerCasinoTipo(IdTipo);
        setFocusedRowKey(RowIndex);
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };


    const seleccionarRegistro = dataRow => {
        const { IdTipo, RowIndex } = dataRow;
        setModoEdicion(false);
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdTipo != varIdTipo) {
            setVarIdTipo(IdTipo);
            setFocusedRowKey(RowIndex);
        }
    }

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerCasinoTipo(dataRow.IdTipo);
    };

 /**********************--Configuración de acceso de botones*************/
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
        listarCasinoTipo();
        loadControlsPermission();
    }, []);


    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs
                        Title={intl.formatMessage({ id: "CASINO.TYPE.MENU" })}
                        SubMenu={intl.formatMessage({ id: "CASINO.TYPE.SUBMENU" })}
                        Subtitle={intl.formatMessage({ id: "CASINO.TYPE.MAINTENANCE" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "CASINO.TYPE.MAINTENANCE" }).toUpperCase()}
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
                                        onClick={listarCasinoTipo} {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "CASINO.TYPE" })}
                                        icon={<RestaurantIcon fontSize="large" />}
                                        onClick={(e => obtenerCasinoTipo(varIdTipo))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdTipo) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <CasinoTipoListPage
                                        casinoTipos={casinoTipos}
                                        titulo={titulo}
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
                                        <CasinoTipoEditPage
                                            modoEdicion={modoEdicion}
                                            titulo={titulo}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarCasinoTipo={actualizarCasinoTipo}
                                            agregarCasinoTipo={agregarCasinoTipo}
                                            cancelarEdicion={cancelarEdicion}
                                            settingDataField={dataMenu.datos}
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


export default injectIntl(WithLoandingPanel(CasinoTipoIndexPage));

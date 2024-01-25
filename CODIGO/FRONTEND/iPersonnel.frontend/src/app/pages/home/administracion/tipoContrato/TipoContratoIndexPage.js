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
import Confirm from "../../../../partials/components/Confirm";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import InsertDriveFile from '@material-ui/icons/InsertDriveFile';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../api/administracion/tipoContrato.api";
import TipoContratoListPage from "./TipoContratoListPage";
import TipoContratoEditPage from "./TipoContratoEditPage";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";

const TipoContratoIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [tipoContrato, settipoContrato] = useState([]);
    const [varIdtipoContrato, setVarIdtipoContrato] = useState("");
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


    async function agregartipoContrato(dataRow) {
        const { IdTipoContrato, TipoContrato, Activo } = dataRow;
        let params = {
            IdCliente: perfil.IdCliente
            , IdTipoContrato: isNotEmpty(IdTipoContrato) ? IdTipoContrato.toUpperCase() : ""
            , TipoContrato: isNotEmpty(TipoContrato) ? TipoContrato.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        setLoading(true);
        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listartipoContrato();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }


    async function actualizartipoContrato(dataRow) {
        const { IdTipoContrato, TipoContrato, Activo } = dataRow;
        let params = {
            IdCliente: perfil.IdCliente
            , IdTipoContrato: isNotEmpty(IdTipoContrato) ? IdTipoContrato.toUpperCase() : ""
            , TipoContrato: isNotEmpty(TipoContrato) ? TipoContrato.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        setLoading(true);
        await actualizar(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listartipoContrato();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }


    async function eliminarRegistro(TipoContrato, confirm) {
        
    setSelected(TipoContrato);
    setIsVisible(true);
    if (confirm) {
        const { IdCliente, IdTipoContrato } = TipoContrato;
        setLoading(true);
        await eliminar({ IdCliente: IdCliente, IdTipoContrato: IdTipoContrato }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
        listartipoContrato();
    }
    }

    async function listartipoContrato() {
        setLoading(true);
        let tipoContrato = await listar({ IdCliente: perfil.IdCliente, NumPagina: 0, TamPagina: 0 }).finally(() => { setLoading(false); });
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        settipoContrato(tipoContrato);

    }

    async function obtenertipoContrato(filtro) {
        const { IdTipoContrato, IdCliente } = filtro;
        if (IdTipoContrato) {
            setLoading(true);
            let tipoContrato = await obtener({ IdCliente: IdCliente, IdTipoContrato: IdTipoContrato }).finally(() => { setLoading(false); });
            //console.log("TipoContrato:", tipoContrato);
            setDataRowEditNew({ ...tipoContrato, esNuevoRegistro: false });
        }
    }

    const nuevoRegistro = () => {
        let tipoContrato = { Activo: "S" };
        setDataRowEditNew({ ...tipoContrato, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenertipoContrato(dataRow);
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        //setDataRowEditNew({});
        setVarIdtipoContrato("");
    };

    const seleccionarRegistro = dataRow => {
        const { IdTipoContrato, RowIndex } = dataRow;

        //console.log("ver", dataRow);
        setSelected(dataRow);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdTipoContrato != varIdtipoContrato) {
            setVarIdtipoContrato(IdTipoContrato);
            setFocusedRowKey(RowIndex);
        }
        setDataRowEditNew(dataRow);
    }

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenertipoContrato(dataRow);
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
        listartipoContrato();
        loadControlsPermission();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <Portlet className={classesEncabezado.border}>
                        <CustomBreadcrumbs
                            Title={intl.formatMessage({ id: "ADMINISTRATION.CONTRACTTYPE.MENU" })}
                            SubMenu={intl.formatMessage({ id: "ADMINISTRATION.CONTRACTTYPE.SUBMENU" })}
                            Subtitle={intl.formatMessage({ id: "ADMINISTRATION.CONTRACTTYPE.MAINTENANCE" })}
                        />
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "ADMINISTRATION.CONTRACTTYPE.MAINTENANCE" })}
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
                                        onClick={listartipoContrato} {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "ADMINISTRATION.CONTRACTTYPE.MAINTENANCE" })}
                                        icon={<InsertDriveFile fontSize="large" />}
                                        onClick={(e => obtenertipoContrato(varIdtipoContrato))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdtipoContrato) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>

                                    {!modoEdicion && (
                                        <TipoContratoListPage
                                            tipoContrato={tipoContrato}
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
                                            <TipoContratoEditPage
                                                titulo={titulo}
                                                modoEdicion={modoEdicion}
                                                dataRowEditNew={dataRowEditNew}
                                                actualizartipoContrato={actualizartipoContrato}
                                                agregartipoContrato={agregartipoContrato}
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
                                        <TipoContratoEditPage
                                            titulo={intl.formatMessage({ id: "ACTION.VIEW" })}
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
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

export default injectIntl(WithLoandingPanel(TipoContratoIndexPage));

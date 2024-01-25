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
import AssignmentIcon from '@material-ui/icons/Assignment';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../api/identificacion/motivo.api";
import MotivoListPage from "./MotivoListPage";
import MotivoEditPage from "./MotivoEditPage";



const MotivoIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    //console.log("MotivoIndexPage",dataMenu );
    const usuario = useSelector(state => state.auth.user);
    const classes = useStylesTab();
    const classesEncabezado = useStylesEncabezado();

    const [motivos, setMotivos] = useState([]);
    const [varIdMotivo, setVarIdMotivo] = useState("");
    const [focusedRowKey, setFocusedRowKey] = useState(0);

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [selected, setSelected] = useState();
    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event, newValue) => { setTabIndex(newValue); };
    const perfil = useSelector((state) => state.perfil.perfilActual);

    const [isVisible, setIsVisible] = useState(false);
    const [instance, setInstance] = useState({});


    async function agregarMotivo(motivo) {
        setLoading(true);
        console.log(motivo);
        const { IdMotivo, Motivo, Activo } = motivo;
        let params = {
            IdCliente: perfil.IdCliente,
            IdMotivo: isNotEmpty(IdMotivo) ? IdMotivo.toUpperCase() : ""
            , Motivo: isNotEmpty(Motivo) ? Motivo.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        console.log(params);

        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarMotivos();
            //changeTabIndex(0);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }


    async function actualizarMotivo(motivo) {
        setLoading(true);
        console.log(motivo);
        const { IdMotivo, Motivo, Activo } = motivo;

        let params = {
            IdCliente: perfil.IdCliente,
            IdMotivo: isNotEmpty(IdMotivo) ? IdMotivo.toUpperCase() : ""
            , Motivo: isNotEmpty(Motivo) ? Motivo.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        console.log(params);

        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarMotivos();
            //changeTabIndex(0);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }


    async function eliminarRegistro(motivo, confirm) {
        setSelected(motivo);
        setIsVisible(true);
        if (confirm) {
            setLoading(true);
            const { IdCliente, IdMotivo } = selected;
            await eliminar({
                IdCliente: IdCliente,
                IdMotivo: IdMotivo,
                IdUsuario: usuario.username
            }).then(() => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
            listarMotivos();
        }
    }


    async function listarMotivos() {
        setLoading(true);
        await listar(
            {
                IdCliente: perfil.IdCliente
                , IdMotivo: "%"
                , Motivo: "%"
                , NumPagina: 0
                , TamPagina: 0
            }).then(motivos => {
                setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
                setMotivos(motivos);
                changeTabIndex(0);
                setModoEdicion(false);
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
    }



    async function obtenerMotivo(idMotivo) {
        setLoading(true);
        await obtener({
            IdCliente: perfil.IdCliente,
            IdMotivo: idMotivo
        }).then(motivo => {
            setDataRowEditNew({ ...motivo, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }


    const nuevoRegistro = () => {
        changeTabIndex(1);
        let motivo = { Activo: "S" };
        setDataRowEditNew({ ...motivo, esNuevoRegistro: true, });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        changeTabIndex(1);
        const { IdMotivo, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerMotivo(IdMotivo);
        setFocusedRowKey(RowIndex);
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { IdMotivo, RowIndex } = dataRow;
        setModoEdicion(false);
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdMotivo != varIdMotivo) {
            setVarIdMotivo(IdMotivo);
            setFocusedRowKey(RowIndex);
        }
    }

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);

        await obtenerMotivo(dataRow.IdMotivo);
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
        listarMotivos();
        loadControlsPermission();
    }, []);




    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <Portlet >
                        <CustomBreadcrumbs
                            Title={intl.formatMessage({ id: "IDENTIFICATION.REASON.MENU" })}
                            SubMenu={intl.formatMessage({ id: "CONFIG.MENU.IDENTIFICACION.CONFIGURACIÓN_DE_FOTOCH" })}
                            Subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}

                        />
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
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
                                        //onClick={listarMotivos} 
                                        {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "IDENTIFICATION.REASON" })}
                                        icon={<AssignmentIcon fontSize="large" />}
                                        onClick={(e => obtenerMotivo(varIdMotivo))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdMotivo) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <MotivoListPage
                                        motivos={motivos}
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
                                        <MotivoEditPage
                                            titulo={titulo}
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarMotivo={actualizarMotivo}
                                            agregarMotivo={agregarMotivo}
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

export default injectIntl(WithLoandingPanel(MotivoIndexPage));

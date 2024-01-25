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
import DialpadIcon from '@material-ui/icons/Dialpad';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../api/acceso/tipoPuerta.api";
import TipoPuertaListPage from "./TipoPuertaListPage";
import TipoPuertaEditPage from "./TipoPuertaEditPage";



const TipoPuertaIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [tipoPuertas, setTipoPuertas] = useState([]);
    const [varIdTipoPuerta, setVarIdTipoPuerta] = useState("");
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


    async function agregarTipoPuerta(data) {
        setLoading(true);
        const { IdCliente, IdTipoPuerta, TipoPuerta, Activo } = data;
        let param = {
            IdTipoPuerta: isNotEmpty(IdTipoPuerta) ? IdTipoPuerta.toUpperCase() : "",
            TipoPuerta: isNotEmpty(TipoPuerta) ? TipoPuerta.toUpperCase() : "",
            IdCliente,
            Activo: Activo,
            IdUsuario: usuario.username
        };
        await crear(param)
            .then(response => {
                if (response)
                    handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                setModoEdicion(false);
                listarTipoPuertas();
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
    }

    async function actualizarTipoPuerta(tipoPuerta) {
        setLoading(true);
        const { IdCliente, IdTipoPuerta, TipoPuerta, Activo } = tipoPuerta;
        let param = {
            IdTipoPuerta: isNotEmpty(IdTipoPuerta) ? IdTipoPuerta.toUpperCase() : "",
            TipoPuerta: isNotEmpty(TipoPuerta) ? TipoPuerta.toUpperCase() : "",
            IdCliente,
            Activo: Activo,
            IdUsuario: usuario.username
        };
        await actualizar(param)
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
                setModoEdicion(false);
                listarTipoPuertas();
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
    }


    async function eliminarRegistro(tipoPuerta, confirm) {

        setSelected(tipoPuerta);
        setIsVisible(true);
        if (confirm) {
            setLoading(true);
            const { IdTipoPuerta, IdCliente } = tipoPuerta;
            await eliminar({
                IdTipoPuerta,
                IdCliente,
                IdUsuario: usuario.username
            })
                .then(response => {
                    handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
                })
                .catch(err => {
                    handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
                }).finally(() => { setLoading(false); });
            listarTipoPuertas();
        }
    }


    async function listarTipoPuertas() {
        setLoading(true);
        const { IdCliente } = selected;
        let tipoPuertas = await listar({
            IdCliente,
            IdTipoPuerta: '%',
            NumPagina: 0,
            TamPagina: 0
        }).then(tipoPuertas => {
            setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
            setTipoPuertas(tipoPuertas);
            changeTabIndex(0);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function obtenerTipoPuerta() {
        setLoading(true);
        const { IdTipoPuerta, IdCliente } = selected;
        if (isNotEmpty(IdTipoPuerta)) {
            let tipoPuerta = await obtener({
                IdTipoPuerta,
                IdCliente
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
            setDataRowEditNew({ ...tipoPuerta, esNuevoRegistro: false });
        }
    }


    const nuevoRegistro = () => {
        changeTabIndex(1);
        const { IdCliente, IdDivision } = selected;
        let tipoPuerta = { Activo: "S", IdCliente, IdDivision };
        setDataRowEditNew({ ...tipoPuerta, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = async (dataRow) => {
        changeTabIndex(1);
        const { IdTipoPuerta, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerTipoPuerta(IdTipoPuerta);
        setFocusedRowKey(RowIndex);
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };


    const seleccionarRegistro = dataRow => {
        const { IdTipoPuerta, RowIndex } = dataRow;
        setModoEdicion(false);
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdTipoPuerta != varIdTipoPuerta) {
            setVarIdTipoPuerta(IdTipoPuerta);
            setFocusedRowKey(RowIndex);
        }
    }

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerTipoPuerta(dataRow);
    };

    const changeTabIndex = (index) => {
        handleChange(null, index);
    }

     /************--Configuración de acceso de botones***********************/
     const [accessButton, setAccessButton] = useState(defaultPermissions);

     const loadControlsPermission = () => {
         let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
         setAccessButton({ ...accessButton, ...buttonsPermissions });
     }
  /***********************************************************************/


    useEffect(() => {
        listarTipoPuertas();
        loadControlsPermission();
    }, []);



    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs
                        Title={intl.formatMessage({ id: "ACCESS.TYPEDOOR.MENU" })}
                        SubMenu={intl.formatMessage({ id: "ACCESS.TYPEDOOR.SUBMENU" })}
                        Subtitle={intl.formatMessage({ id: "ACCESS.TYPEDOOR.MAINTENANCE" })}
                    />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "ACCESS.TYPEDOOR.MAINTENANCE" })}
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
                                        onClick={listarTipoPuertas} {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "ACCESS.TYPEDOOR" })}
                                        icon={<DialpadIcon fontSize="large" />}
                                        onClick={(e => obtenerTipoPuerta(varIdTipoPuerta))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdTipoPuerta) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <TipoPuertaListPage
                                        tipoPuertas={tipoPuertas}
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
                                        <TipoPuertaEditPage
                                            modoEdicion={modoEdicion}
                                            titulo={titulo}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarTipoPuerta={actualizarTipoPuerta}
                                            agregarTipoPuerta={agregarTipoPuerta}
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


export default injectIntl(WithLoandingPanel(TipoPuertaIndexPage));

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
import ChromeReaderModeIcon from '@material-ui/icons/ChromeReaderMode';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../api/identificacion/tipoIdentificacion.api";
import TipoIdentificacionListPage from "../tipoIdentificacion/TipoIdentificacionListPage";
import TipoIdentificacionEditPage from "../tipoIdentificacion/TipoIdentificacionEditPage";


const TipoIdentificacionIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [varIdTipoIdentificacion, setVarIdTipoIdentificacion] = useState("");
    const [focusedRowKey, setFocusedRowKey] = useState();
    const [tipoIdentificacionData, setTipoIdentificacionData] = useState([]);

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [selected, setSelected] = useState({});
    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event, newValue) => { setTabIndex(newValue); };

    const [isVisible, setIsVisible] = useState(false);
    const [instance, setInstance] = useState({});

    async function agregarTipoIdentificacion(data) {
        setLoading(true);
        const { IdTipoIdentificacion, TipoIdentificacion, Activo } = data;
        let params = {
            IdTipoIdentificacion: IdTipoIdentificacion.toUpperCase()
            , TipoIdentificacion: TipoIdentificacion.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarTipoIdentificacion();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function actualizarTipoIdentificacion(data) {
        setLoading(true);
        const { IdTipoIdentificacion, TipoIdentificacion, Activo } = data;
        let params = {
            IdTipoIdentificacion: IdTipoIdentificacion.toUpperCase()
            , TipoIdentificacion: TipoIdentificacion.toUpperCase()
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarTipoIdentificacion();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }


    async function eliminarRegistro(TipoIdentificacion, confirm) {

        setSelected(TipoIdentificacion);
        setIsVisible(true);
        if (confirm) {
            setLoading(true);
            const { IdTipoIdentificacion } = TipoIdentificacion;
            await eliminar({ IdTipoIdentificacion, IdUsuario: usuario.username }).then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
                setVarIdTipoIdentificacion("");
                setFocusedRowKey();
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
            listarTipoIdentificacion();
        }
    }

    async function listarTipoIdentificacion() {
        setLoading(true);
        await listar()
            .then(tipoIdentificacion => {
                setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
                setTipoIdentificacionData(tipoIdentificacion);
                changeTabIndex(0);
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
    }

    async function obtenerTipoIdentificacion() {
        setLoading(true);
        const { IdTipoIdentificacion } = selected;
        await obtener({
            IdTipoIdentificacion
        }).then(tipoIdentificacion => {
            setDataRowEditNew({ ...tipoIdentificacion, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    const nuevoRegistro = () => {
        changeTabIndex(1);
        let TipoIdentificacion = { Activo: "S" };
        setDataRowEditNew({ ...TipoIdentificacion, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const seleccionarRegistro = dataRow => {
        const { IdTipoIdentificacion, RowIndex } = dataRow;
        setModoEdicion(false);
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdTipoIdentificacion != varIdTipoIdentificacion) {
            setVarIdTipoIdentificacion(IdTipoIdentificacion);
            setFocusedRowKey(RowIndex);
        }
    }

    const editarRegistro = async (dataRow) => {
        changeTabIndex(1);
        const { IdTipoIdentificacion, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        await obtenerTipoIdentificacion(IdTipoIdentificacion);
        setFocusedRowKey(RowIndex);
    };

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerTipoIdentificacion(dataRow);
    };


    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
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
        listarTipoIdentificacion();
        loadControlsPermission();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <Portlet>
                        <CustomBreadcrumbs
                            Title={intl.formatMessage({ id: "IDENTIFICATION.TYPEIDENTIFICATION.MENU" })}
                            Subtitle={intl.formatMessage({ id: "IDENTIFICATION.TYPEIDENTIFICATION.MAINTENANCE" })}
                        />
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "IDENTIFICATION.TYPEIDENTIFICATION.MAINTENANCE" })}
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
                                        //onClick={listarTipoIdentificacion} 
                                        {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "IDENTIFICATION.TYPEIDENTIFICATION" })}
                                        icon={<ChromeReaderModeIcon fontSize="large" />}
                                        onClick={(e => obtenerTipoIdentificacion(selected))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdTipoIdentificacion) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <TipoIdentificacionListPage
                                        tipoIdentificacionData={tipoIdentificacionData}
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
                                        <TipoIdentificacionEditPage
                                            titulo={titulo}
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarTipoIdentificacion={actualizarTipoIdentificacion}
                                            agregarTipoIdentificacion={agregarTipoIdentificacion}
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

export default injectIntl(WithLoandingPanel(TipoIdentificacionIndexPage));

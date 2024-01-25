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
import DoneAllIcon from '@material-ui/icons/DoneAll';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../api/acceso/requisito.api";
import RequisitoListPage from "../requisito/RequisitoListPage";
import RequisitoEditPage from "../requisito/RequisitoEditPage";


const RequisitoIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [requisitoData, setRequisitoData] = useState([]);
    const [varIdRequisito, setVarIdRequisito] = useState("");
    const [focusedRowKey, setFocusedRowKey] = useState(0);

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [selected, setSelected] = useState({
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision
    });
    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event, newValue) => { setTabIndex(newValue); };
    const [isVisible, setIsVisible] = useState(false);
    const [instance, setInstance] = useState({});


    async function agregarRequisito(data) {
        setLoading(true);
        const { IdCliente, IdEntidad, IdRequisito, Requisito, DiasNotificacion, Activo } = data;
        let params = {
              IdCliente
            , IdEntidad: isNotEmpty(IdEntidad) ? IdEntidad.toUpperCase() : ""
            , IdRequisito: isNotEmpty(IdRequisito) ? IdRequisito.toUpperCase() : ""
            , Requisito: isNotEmpty(Requisito) ? Requisito.toUpperCase() : ""
            , DiasNotificacion: isNotEmpty(DiasNotificacion) ? DiasNotificacion.toUpperCase() : 0
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarRequisito();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }


    async function actualizarRequisito(data) {
        setLoading(true);
        const { IdCliente, IdEntidad, IdRequisito, Requisito, DiasNotificacion, Activo } = data;
        let params = {
              IdCliente
            , IdEntidad: isNotEmpty(IdEntidad) ? IdEntidad.toUpperCase() : ""
            , IdRequisito: isNotEmpty(IdRequisito) ? IdRequisito.toUpperCase() : ""
            , Requisito: isNotEmpty(Requisito) ? Requisito.toUpperCase() : ""
            , DiasNotificacion: isNotEmpty(DiasNotificacion) ? DiasNotificacion : 0
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarRequisito();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }


    async function eliminarRegistro(Requisito, confirm) {
        setSelected(Requisito);
        setIsVisible(true);
        if (confirm) {
            setLoading(true);
            const { IdCliente, IdRequisito } = Requisito;
            await eliminar({ IdCliente, IdRequisito, IdUsuario: usuario.username }).then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
            listarRequisito();
        }
    }

    async function listarRequisito() {
        setLoading(true);
        const { IdCliente } = selected;
        await listar({
            IdCliente,
            NumPagina: 0,
            TamPagina: 0
        }).then(requisito => {
            setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
            setRequisitoData(requisito);
            changeTabIndex(0);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function obtenerRequisito() {
        setLoading(true);
        const { IdCliente, IdRequisito } = selected;
        await obtener({
            IdCliente, IdRequisito
        }).then(Requisito => {
            setDataRowEditNew({ ...Requisito, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }


    const nuevoRegistro = () => {
        changeTabIndex(1);
        const { IdCliente } = selected;
        let Requisito = { Activo: "S", IdCliente };
        setDataRowEditNew({ ...Requisito, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };


    const editarRegistro = async (dataRow) => {
        changeTabIndex(1);
        const { IdRequisito, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerRequisito(IdRequisito);
        setFocusedRowKey(RowIndex);
    };


    const seleccionarRegistro = dataRow => {
        const { IdRequisito, RowIndex } = dataRow;
        setModoEdicion(false);
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdRequisito != varIdRequisito) {
            setVarIdRequisito(IdRequisito);
            setFocusedRowKey(RowIndex);
        }
    }


    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerRequisito(dataRow);
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

     /****--Configuración de acceso de botones*****************************/
     const [accessButton, setAccessButton] = useState(defaultPermissions);

     const loadControlsPermission = () => {
         let buttonsPermissions = getButtonPermissions(dataMenu.objetos);
         setAccessButton({ ...accessButton, ...buttonsPermissions });
     }
  /***********************************************************************/

    useEffect(() => {
        listarRequisito();
        loadControlsPermission();
    }, []);





    return (
        <>
            <div className="row">
                <div className="col-md-12">

                    <CustomBreadcrumbs
                        Title={intl.formatMessage({ id: "ACCESS.REQUIREMENTS.MENU" })}
                        SubMenu={intl.formatMessage({ id: "ACCESS.REQUIREMENTS.SUBMENU" })}
                        Subtitle={`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
                    />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                {`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
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
                                        onClick={listarRequisito} {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "ACCESS.REQUIREMENT" })}
                                        icon={<DoneAllIcon fontSize="large" />}
                                        onClick={(e => obtenerRequisito(varIdRequisito))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdRequisito) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <RequisitoListPage
                                        requisitoData={requisitoData}
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
                                        <RequisitoEditPage
                                            modoEdicion={modoEdicion}
                                            titulo={titulo}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarRequisito={actualizarRequisito}
                                            agregarRequisito={agregarRequisito}
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


export default injectIntl(WithLoandingPanel(RequisitoIndexPage));

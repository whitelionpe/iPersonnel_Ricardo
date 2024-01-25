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
import FeaturedPlayListIcon from '@material-ui/icons/FeaturedPlayList';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../api/sistema/tipodocumento.api";
import TipoDocumentoListPage from "./TipoDocumentoListPage";
import TipoDocumentoEditPage from "./TipoDocumentoEditPage";


const TipoDocumentoIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [tipoDocumentos, setTipoDocumentos] = useState([]);
    const [varIdTipoDocumento, setVarIdTipoDocumento] = useState("");
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


    async function agregarTipoDocumento(tipoDocumento) {
        setLoading(true);
        const { IdTipoDocumento, TipoDocumento, Alias, LongitudExacta, Longitud, IdEntidad, IdPais, CodigoEquivalente,Mascara,CaracteresPermitidos, Activo } = tipoDocumento;
        let params = {
            IdTipoDocumento: isNotEmpty(IdTipoDocumento) ? IdTipoDocumento.toUpperCase() : ""
            , TipoDocumento: isNotEmpty(TipoDocumento) ? TipoDocumento.toUpperCase() : ""
            , Alias: isNotEmpty(Alias) ? Alias.toUpperCase() : ""
            , LongitudExacta: isNotEmpty(LongitudExacta) ? LongitudExacta : ""
            , Longitud: isNotEmpty(Longitud) ? Longitud : 0
            , IdEntidad: isNotEmpty(IdEntidad) ? IdEntidad : ""
            , IdPais: isNotEmpty(IdPais) ? IdPais : ""
            , CodigoEquivalente: isNotEmpty(CodigoEquivalente) ? CodigoEquivalente : ""
            , Mascara: isNotEmpty(Mascara) ? Mascara : ""
            , CaracteresPermitidos: isNotEmpty(CaracteresPermitidos) ? CaracteresPermitidos : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarTipoDocumentos();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function actualizarTipoDocumento(tipoDocumento) {
        setLoading(true);
        const { IdTipoDocumento, TipoDocumento, Alias, LongitudExacta, Longitud, IdEntidad, IdPais, CodigoEquivalente,Mascara,CaracteresPermitidos, Activo } = tipoDocumento;
        let params = {
            IdTipoDocumento: isNotEmpty(IdTipoDocumento) ? IdTipoDocumento.toUpperCase() : ""
            , TipoDocumento: isNotEmpty(TipoDocumento) ? TipoDocumento.toUpperCase() : ""
            , Alias: isNotEmpty(Alias) ? Alias.toUpperCase() : ""
            , LongitudExacta: isNotEmpty(LongitudExacta) ? LongitudExacta : ""
            , Longitud: isNotEmpty(Longitud) ? Longitud : 0
            , IdEntidad: isNotEmpty(IdEntidad) ? IdEntidad : ""
            , IdPais: isNotEmpty(IdPais) ? IdPais : ""
            , CodigoEquivalente: isNotEmpty(CodigoEquivalente) ? CodigoEquivalente : ""
            , Mascara: isNotEmpty(Mascara) ? Mascara : ""
            , CaracteresPermitidos: isNotEmpty(CaracteresPermitidos) ? CaracteresPermitidos : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await actualizar(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarTipoDocumentos();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function eliminarRegistro(tipoDocumento, confirm) {
        setSelected(tipoDocumento);
        setIsVisible(true);
        if (confirm) {
            setLoading(true);
            const { IdTipoDocumento } = tipoDocumento;
            await eliminar({ IdTipoDocumento: IdTipoDocumento, IdUsuario: usuario.username }).then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
            listarTipoDocumentos();
        }
    }

    async function listarTipoDocumentos() {
        setLoading(true);
        await listar(
            {
                IdPais: '%'
                , NumPagina: 0
                , TamPagina: 0
            }
        ).then(tipoDocumentos => {
            setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
            setTipoDocumentos(tipoDocumentos);
            changeTabIndex(0);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function obtenerTipoDocumento(idTipoDocumento) {
        setLoading(true);
        await obtener({ IdTipoDocumento: idTipoDocumento }).then(tipoDocumentos => {
            setDataRowEditNew({ ...tipoDocumentos, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }


    const nuevoRegistro = () => {
        changeTabIndex(1);
        let tipoDocumento = { Activo: "S" ,LongitudExacta:'S',Longitud:4 ,IdPais: perfil.IdPais};
        setDataRowEditNew({ ...tipoDocumento, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = async (dataRow) => {
        changeTabIndex(1);
        const { IdTipoDocumento, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerTipoDocumento(IdTipoDocumento);
        setFocusedRowKey(RowIndex);
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { IdTipoDocumento, RowIndex } = dataRow;
        setSelected(dataRow);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdTipoDocumento != varIdTipoDocumento) {
            setVarIdTipoDocumento(IdTipoDocumento);
            setFocusedRowKey(RowIndex);
        }
    }

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        obtenerTipoDocumento(dataRow.IdTipoDocumento);
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
        listarTipoDocumentos();
        loadControlsPermission();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs Title={intl.formatMessage({ id: "SYSTEM" }) + " / " + intl.formatMessage({ id: "COMMON.GENERALS" })} Subtitle={intl.formatMessage({ id: "SYSTEM.DOCUMENTOTYPE.MAINTENANCE" })} />

                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {(intl.formatMessage({ id: "SYSTEM.DOCUMENTOTYPE.MAINTENANCE" }))}
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
                                        {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "SYSTEM.DOCUMENTOTYPE" })}
                                        icon={<FeaturedPlayListIcon fontSize="large" />}
                                        onClick={(e => obtenerTipoDocumento(varIdTipoDocumento))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdTipoDocumento) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <TipoDocumentoListPage
                                        tipoDocumentos={tipoDocumentos}
                                        editarRegistro={editarRegistro}
                                        eliminarRegistro={eliminarRegistro}
                                        nuevoRegistro={nuevoRegistro}
                                        seleccionarRegistro={seleccionarRegistro}
                                        verRegistroDblClick={verRegistroDblClick}
                                        focusedRowKey={focusedRowKey} y
                                        accessButton={accessButton}
                                    />
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                        <TipoDocumentoEditPage
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarTipoDocumento={actualizarTipoDocumento}
                                            agregarTipoDocumento={agregarTipoDocumento}
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

export default injectIntl(WithLoandingPanel(TipoDocumentoIndexPage));

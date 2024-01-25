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
    serviceRepositorio //obtener, listar, crear, actualizar, eliminar
} from "../../../../api/sistema/repositorio.api";
import RepositorioListPage from "./RepositorioListPage";
import RepositorioEditPage from "./RepositorioEditPage";


const RepositorioIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;

    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [repositorios, setRepositorios] = useState([]);
    const [varIdCliente, setVarIdCliente] = useState("");
    // TODO : verificar si se requiere adicionar una nueva variable para la llave compuesta
    const [varIdRepositorio, setVarIdRepositorio] = useState("");
    const [focusedRowKey, setFocusedRowKey] = useState(0);
    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [selected, setSelected] = useState({});
    const [tabIndex, setTabIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [instance, setInstance] = useState({});

    const [permisoAcceso, setPermisoAcceso] = useState(false);

    const handleChange = (event, newValue) => { setTabIndex(newValue); };

    async function agregarRepositorio(repositorio) {
        setLoading(true);
        const { IdCliente, IdRepositorio, Repositorio, FolderSharepoint, Descripcion, Usuario, Clave, TamanoMax, UnidadMedida, Activo } = repositorio;
        let params = {
            IdCliente: perfil.IdCliente //isNotEmpty(IdCliente) ? IdCliente.toUpperCase() : ""
            , IdRepositorio: isNotEmpty(IdRepositorio) ? IdRepositorio.toUpperCase() : ""
            , Repositorio: isNotEmpty(Repositorio) ? Repositorio.toUpperCase() : ""
            , FolderSharepoint: isNotEmpty(FolderSharepoint) ? FolderSharepoint.toUpperCase() : ""
            , Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : ""
            , Usuario: isNotEmpty(Usuario) ? Usuario : ""
            , Clave: isNotEmpty(Clave) ? Clave : ""
            , TamanoMax: isNotEmpty(TamanoMax) ? TamanoMax : ""
            , UnidadMedida: isNotEmpty(UnidadMedida) ? UnidadMedida : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await serviceRepositorio.crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarRepositorios();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function actualizarRepositorio(repositorio) {
        setLoading(true);
        const { IdCliente, IdRepositorio, Repositorio, FolderSharepoint, Descripcion, Usuario, Clave, TamanoMax, UnidadMedida, Activo } = repositorio;
        let params = {
            IdCliente: isNotEmpty(IdCliente) ? IdCliente.toUpperCase() : ""
            , IdRepositorio: isNotEmpty(IdRepositorio) ? IdRepositorio.toUpperCase() : ""
            , Repositorio: isNotEmpty(Repositorio) ? Repositorio.toUpperCase() : ""
            , FolderSharepoint: isNotEmpty(FolderSharepoint) ? FolderSharepoint.toUpperCase() : ""
            , Descripcion: isNotEmpty(Descripcion) ? Descripcion.toUpperCase() : ""
            , Usuario: isNotEmpty(Usuario) ? Usuario : ""
            , Clave: isNotEmpty(Clave) ? Clave : ""
            , TamanoMax: isNotEmpty(TamanoMax) ? TamanoMax : ""
            , UnidadMedida: isNotEmpty(UnidadMedida) ? UnidadMedida : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        };
        await serviceRepositorio.actualizar(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarRepositorios();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function eliminarRegistro(dataRow, confirm) {
        setSelected(dataRow);
        setIsVisible(true);
        if (confirm) {
            setLoading(true);
            const { IdCliente, IdRepositorio } = dataRow;
            await serviceRepositorio.eliminar({ IdCliente: IdCliente, IdRepositorio: IdRepositorio, IdUsuario: usuario.username }).then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
            listarRepositorios();
        }
    }

    async function listarRepositorios() {
        //console.log("listarRepositorios");
        setLoading(true);
        await serviceRepositorio.listar(
            {
                IdCliente: '%'
                , NumPagina: 0
                , TamPagina: 0
            }
        ).then(repositorios => {
            setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
            setRepositorios(repositorios);
            changeTabIndex(0);
            setPermisoAcceso(true)
        }).catch(err => {
            let dataError = err.response;
            let { responseException } = dataError.data;
            //case 400:
            if (responseException.exceptionMessage == "Info") {
                setPermisoAcceso(false)
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "MESSAGES.INFO.ACCES" }), true);
            } else
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)

        }).finally(() => { setLoading(false); });
    }

    async function obtenerRepositorio(idCliente, idRepositorio) {
        setLoading(true);
        await serviceRepositorio.obtener({ IdCliente: idCliente, IdRepositorio: idRepositorio }).then(repositorios => {
            //console.log("obtenerTipoDocumento",tipoDocumentos);
            setDataRowEditNew({ ...repositorios, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }


    const nuevoRegistro = () => {
        changeTabIndex(1);
        let repositorio = { Activo: "S" };
        setDataRowEditNew({ ...repositorio, Longitud: 0, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = async (dataRow) => {
        //console.log("editarRegistro-recupero DataGrid- Select", dataRow);
        changeTabIndex(1);
        const { IdCliente, IdRepositorio, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerRepositorio(IdCliente, IdRepositorio);
        //setFocusedRowKey(RowIndex);
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { IdCliente, IdRepositorio, RowIndex } = dataRow;
        setSelected(dataRow);
        setModoEdicion(false);
        //console.log("seleccionarRegistro", dataRow)
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdRepositorio != varIdRepositorio) {
            setVarIdCliente(IdCliente);
            setVarIdRepositorio(IdRepositorio);
            setFocusedRowKey(RowIndex);
        }
    }

    const verRegistroDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        obtenerRepositorio(dataRow.IdCliente, dataRow.IdRepositorio);
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
        listarRepositorios();
        loadControlsPermission();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs Title={intl.formatMessage({ id: "SYSTEM" }) + " / " + intl.formatMessage({ id: "COMMON.GENERALS" })} Subtitle={intl.formatMessage({ id: "SYSTEM.REPOSITORY.MAINTENANCE" })} />

                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {(intl.formatMessage({ id: "SYSTEM.REPOSITORY.MAINTENANCE" }))}
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
                                        //onClick={listarTipoDocumentos}
                                        {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "SYSTEM.REPOSITORY" })}
                                        icon={<FeaturedPlayListIcon fontSize="large" />}
                                        onClick={(e => obtenerRepositorio(perfil.IdCliente, varIdRepositorio))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdRepositorio) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <RepositorioListPage
                                        repositorios={repositorios}
                                        editarRegistro={editarRegistro}
                                        eliminarRegistro={eliminarRegistro}
                                        nuevoRegistro={nuevoRegistro}
                                        seleccionarRegistro={seleccionarRegistro}
                                        verRegistroDblClick={verRegistroDblClick}
                                        focusedRowKey={focusedRowKey}
                                        accessButton={accessButton}
                                        permisoAcceso={permisoAcceso}
                                    />
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                        <RepositorioEditPage
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarTipoDocumento={actualizarRepositorio}
                                            agregarTipoDocumento={agregarRepositorio}
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

export default injectIntl(WithLoandingPanel(RepositorioIndexPage));

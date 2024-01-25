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
import ViewModuleIcon from '@material-ui/icons/ViewModule';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../api/administracion/categoria.api";
import CategoriaListPage from "./CategoriaListPage";
import CategoriaEditPage from "./CategoriaEditPage";


const CategoriaIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [categorias, setCategorias] = useState([]);
    const [varIdCategoria, setVarIdCategoria] = useState("");
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



    async function agregarCategoria(categoria) {    
        setLoading(true);
        const { IdCategoria, Categoria, Activo } = categoria;
        let params = {
            IdCliente: perfil.IdCliente
            , IdCategoria: isNotEmpty(IdCategoria) ? IdCategoria.toUpperCase() : ""
            , Categoria: isNotEmpty(Categoria) ? Categoria.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }

        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarCategoria();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });   
    }

    async function actualizarCategoria(categoria) {
        setLoading(true);
        const { IdCategoria, Categoria, Activo } = categoria;
        let params = {
            IdCliente: perfil.IdCliente
            , IdCategoria: isNotEmpty(IdCategoria) ? IdCategoria.toUpperCase() : ""
            , Categoria: isNotEmpty(Categoria) ? Categoria.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarCategoria();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });   
    }

    async function eliminarRegistro(categoria, confirm) {
        setSelected(categoria);
        setIsVisible(true);
        if (confirm) {

        setLoading(true);
        const {  IdCategoria } = categoria;
        await eliminar(
            { IdCliente: perfil.IdCliente, IdCategoria }
        ).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); }); 
        listarCategoria();
    }
    }

    async function listarCategoria() {
        setLoading(true);
       await listar({   IdCliente: perfil.IdCliente 
       }).then(categorias => {
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setCategorias(categorias);
        changeTabIndex(0);
    }).catch(err => {
        handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    }).finally(() => { setLoading(false); });

    }


    async function obtenerCategoria(IdCategoria) {
        setLoading(true);
            await obtener({ 
                IdCliente: perfil.IdCliente, 
                IdCategoria: IdCategoria
            }).then(categoria => {
                setDataRowEditNew({ ...categoria, esNuevoRegistro: false });
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
            }).finally(() => { setLoading(false); });
        }

    const nuevoRegistro = () => {
        changeTabIndex(1);
        const { IdCliente } = selected;
        let categoria = { Activo: "S", IdCliente };
        setDataRowEditNew({ ...categoria, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = dataRow => {
        changeTabIndex(1);
        const { IdCategoria, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerCategoria(IdCategoria);
        setFocusedRowKey(RowIndex)
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { IdCategoria, RowIndex } = dataRow;
        setSelected(dataRow);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdCategoria != varIdCategoria) {
            setVarIdCategoria(IdCategoria);
            setFocusedRowKey(RowIndex);
        }
    }

    
   const verRegistroDblClick = async (dataRow) => {
    changeTabIndex(1);
    setModoEdicion(false);
    await obtenerCategoria(dataRow.IdCategoria);
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

    useEffect(() => {
        listarCategoria();
        loadControlsPermission();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <Portlet className={classesEncabezado.border}>
                    <CustomBreadcrumbs 
                             Title={intl.formatMessage({ id: "ADMINISTRATION.CATEGORY.MENU" })} 
                             SubMenu={intl.formatMessage({ id: "ADMINISTRATION.CATEGORY.SUBMENU" })} 
                             Subtitle={intl.formatMessage({ id: "ADMINISTRATION.CATEGORY.MAINTENANCE" })}
                              />
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "ADMINISTRATION.CATEGORY.MAINTENANCE" })}

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
                                        onClick={listarCategoria} {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "ADMINISTRATION.CATEGORY.TAB" })}
                                        icon={<ViewModuleIcon fontSize="large" />}
                                        onClick={(e => obtenerCategoria(varIdCategoria))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdCategoria) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <CategoriaListPage
                                        categorias={categorias}
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
                                        <CategoriaEditPage
                                            titulo={titulo}
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarCategoria={actualizarCategoria}
                                            agregarCategoria={agregarCategoria}
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

export default injectIntl(WithLoandingPanel(CategoriaIndexPage));

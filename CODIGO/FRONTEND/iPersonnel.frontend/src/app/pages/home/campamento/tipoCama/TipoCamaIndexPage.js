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

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import LocalHotelIcon from '@material-ui/icons/LocalHotel';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";
import { getButtonPermissions, defaultPermissions } from '../../../../../_metronic/utils/securityUtils'

import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../api/campamento/tipoCama.api";
import TipoCamaListPage from "./TipoCamaListPage";
import TipoCamaEditPage from "./TipoCamaEditPage";



const TipoCamaIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [varIdTipoCama, setVarIdTipoCama] = useState("");
    const [tipoCamaData, setTipoCamaData] = useState([]);
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


    async function agregarTipoCama(dataRow) {
        setLoading(true);    
        const { IdTipoCama, TipoCama, Activo } = dataRow;
        let params = {
            IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdTipoCama: isNotEmpty(IdTipoCama) ? IdTipoCama.toUpperCase() : ""
            , TipoCama: isNotEmpty(TipoCama) ? TipoCama.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await crear(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarTipoCama();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }


    async function actualizarTipoCama(dataRow) {
        setLoading(true);    
        const { IdTipoCama, TipoCama, Activo } = dataRow;
        let params = {
            IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdTipoCama: isNotEmpty(IdTipoCama) ? IdTipoCama.toUpperCase() : ""
            , TipoCama: isNotEmpty(TipoCama) ? TipoCama.toUpperCase() : ""
            , Activo: Activo
            , IdUsuario: usuario.username
        }
        await actualizar(params).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            setModoEdicion(false);
            listarTipoCama();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }


    async function eliminarRegistro(dataRow, confirm) {
        setSelected(dataRow);
        setIsVisible(true);

        if (confirm) {
        setLoading(true);    
        const { IdTipoCama } = dataRow;
        await eliminar({
            IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdTipoCama: IdTipoCama
        }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
        listarTipoCama();
    }
}


    async function listarTipoCama() {
        setLoading(true);   
        const { IdCliente, IdDivision } = selected; 
        await listar(
            {
                IdCliente
                , IdDivision
                , NumPagina: 0
                , TamPagina: 0
            }).then(TipoCama => {
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setTipoCamaData(TipoCama);
        changeTabIndex(0);
    }).catch(err => {
        handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
    }).finally(() => { setLoading(false); });
    }

    async function obtenerTipoCama(TipoCama) {
        setLoading(true);  
        const { IdCliente, IdDivision, IdTipoCama } = TipoCama;  
        await obtener({
                IdCliente: perfil.IdCliente
                , IdDivision: perfil.IdDivision
                , IdTipoCama: IdTipoCama
            }).then(TipoCama => {
            setDataRowEditNew({ ...TipoCama, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({id:"MESSAGES.WARNING"}),err);
        }).finally(() => { setLoading(false); });
    }


    const nuevoRegistro = () => {
        changeTabIndex(1);
        const { IdCliente, IdDivision } = selected;
        let TipoCama = { Activo: "S", IdCliente, IdDivision };
        setDataRowEditNew({ ...TipoCama, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };


    const editarRegistro = dataRow => {
        changeTabIndex(1);
        const { IdTipoCama, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerTipoCama(dataRow);
        setFocusedRowKey(RowIndex);
    };


    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        //setDataRowEditNew({});
    };



    const seleccionarRegistro = dataRow => {
        const { IdTipoCama, RowIndex } = dataRow;
        setModoEdicion(false);
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        if (IdTipoCama != varIdTipoCama) {
            setVarIdTipoCama(IdTipoCama);
            setFocusedRowKey(RowIndex);
        }
    }


    const verRegistroCamaDblClick = async (dataRow) => {
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerTipoCama(dataRow);
    };

    /**--Configuración de acceso de botones******************************/
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
        listarTipoCama();
        loadControlsPermission();
    }, []);




    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs
                        Title={intl.formatMessage({ id: "CAMP.BEDTYPE.MENU" })}
                        SubMenu={intl.formatMessage({ id: "CAMP.BEDTYPE.SUBMENU" })}
                        Subtitle={intl.formatMessage({ id: "CAMP.BEDTYPE" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {intl.formatMessage({ id: "CAMP.BEDTYPE" })}
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
                                        //onClick={listarTipoCama} 
                                        {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "CAMP.BEDTYPE" })}
                                        icon={<LocalHotelIcon fontSize="large" />}
                                        onClick={(e => obtenerTipoCama(selected))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdTipoCama) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <TipoCamaListPage
                                        titulo={titulo}
                                        tipoCamaData={tipoCamaData}
                                        editarRegistro={editarRegistro}
                                        eliminarRegistro={eliminarRegistro}
                                        nuevoRegistro={nuevoRegistro}
                                        seleccionarRegistro={seleccionarRegistro}
                                        focusedRowKey={focusedRowKey}
                                        verRegistroDblClick={verRegistroCamaDblClick}
                                        accessButton={accessButton}
                                    />
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                        <TipoCamaEditPage
                                            titulo={titulo}
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarTipoCama={actualizarTipoCama}
                                            agregarTipoCama={agregarTipoCama}
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
export default injectIntl(WithLoandingPanel(TipoCamaIndexPage));

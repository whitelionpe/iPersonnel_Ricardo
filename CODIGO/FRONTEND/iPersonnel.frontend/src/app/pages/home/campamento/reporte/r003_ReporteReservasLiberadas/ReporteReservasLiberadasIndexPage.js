import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";

import PropTypes from 'prop-types';
import { isNotEmpty ,dateFormat} from "../../../../../../_metronic";
import { getButtonPermissions, defaultPermissions } from '../../../../../../_metronic/utils/securityUtils'
import { Portlet } from "../../../../../partials/content/Portlet";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Confirm from "../../../../../partials/components/Confirm";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import {
    obtener, listar, crear, actualizar, eliminar
} from "../../../../../api/acceso/requisito.api";


import { service } from "../../../../../api/campamento/reporte.api"

import ReporteReservasLiberadasListPage from "./ReporteReservasLiberadasListPage";

const ReporteReservasLiberadasIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [dataReporte, setDataReporte] = useState([]);
    const [dataEstadisticoAutorizadores, setDataEstadisticoAutorizadores] = useState([]);

    const [varIdRequisito, setVarIdRequisito] = useState("");
    const [focusedRowKey, setFocusedRowKey] = useState(0);

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({ 
       FechaInicio: new Date(new Date().getFullYear(), 0, 1),
       FechaFin : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    });
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
            listarResultadoAutorizadores();
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
            listarResultadoAutorizadores();
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
            listarResultadoAutorizadores();
        }
    }

    async function listarResultadoAutorizadores() {
        setLoading(true);
         const { FechaInicio,FechaFin,IdCampamento } = dataRowEditNew;
        
        await service.reporteReservasLiberadas({
           IdDivision : perfil.IdDivision,
           IdCampamento : isNotEmpty(IdCampamento) ?  IdCampamento : "",
           FechaInicio : isNotEmpty(FechaInicio) ?  dateFormat(FechaInicio, 'yyyyMMdd') : "20210101",
           FechaFin : isNotEmpty(FechaFin) ?  dateFormat(FechaFin, 'yyyyMMdd') : "20211230",
        }).then(data => {
            setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
            // console.log("reporteReservasLiberadas|data:",data);
            setDataReporte(data);
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
        })
            .finally(() => { setLoading(false); });
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
        listarResultadoAutorizadores();
        loadControlsPermission();
    }, []);





    return (
        <>
            <div className="row">
                <div className="col-md-12">

                    <CustomBreadcrumbs
                       Title={intl.formatMessage({ id: "CAMP.REPORT.MENU" })}
                       SubMenu={intl.formatMessage({ id: "CAMP.REPORT.SUBMENU" })}
                       Subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
                    />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                {intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        <>
                          
                          <ReporteReservasLiberadasListPage
                              dataRowEditNew ={dataRowEditNew}
                              setDataRowEditNew ={setDataRowEditNew}
                              dataReporte={dataReporte}
                              seleccionarRegistro={seleccionarRegistro}
                              focusedRowKey={focusedRowKey}
                              accessButton={accessButton}
                              listarResultadoAutorizadores = {listarResultadoAutorizadores}
                          />
                               
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


export default injectIntl(WithLoandingPanel(ReporteReservasLiberadasIndexPage));

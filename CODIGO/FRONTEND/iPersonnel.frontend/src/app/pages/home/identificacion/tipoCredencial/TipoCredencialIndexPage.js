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
import ContactsIcon from '@material-ui/icons/Contacts';

import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import {
    serviceTipoCredencial
} from "../../../../api/identificacion/tipoCredencial.api";
import TipoCredencialListPage from "./TipoCredencialListPage";
import TipoCredencialEditPage from "./TipoCredencialEditPage";

import { serviceLocal } from "../../../../api/serviceLocal.api";
import { serviceTipoCredencialArchivo } from "../../../../api/identificacion/tipoCredencialArchivo.api";


const TipoCredencialIndexPage = (props) => {
    const { intl, setLoading, dataMenu } = props;
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();

    const [varIdTipoCredencial, setVarIdTipoCredencial] = useState("");
    const [focusedRowKey, setFocusedRowKey] = useState(0);
    const [tipoCredenciales, setTipoCredenciales] = useState([]);

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



    async function agregarTipoCredencial(data) {
        setLoading(true);
        const { IdCliente, IdTipoCredencial, TipoCredencial, Activo, IdEntidad } = data;
        let param = {
            IdTipoCredencial: isNotEmpty(IdTipoCredencial) ? IdTipoCredencial.toUpperCase() : "",
            TipoCredencial: isNotEmpty(TipoCredencial) ? TipoCredencial.toUpperCase() : "",
            IdCliente,
            Activo: Activo,
            IdEntidad: IdEntidad,
            IdUsuario: usuario.username
        }

        await serviceTipoCredencial.crear(param).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            setModoEdicion(false);
            listarTipoCredenciales();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function actualizarTipoCredencial(tipoCredencial) {
        setLoading(true);
        const { IdCliente, IdTipoCredencial, TipoCredencial, Activo, IdEntidad } = tipoCredencial;
        let params = {
            IdTipoCredencial: isNotEmpty(IdTipoCredencial) ? IdTipoCredencial.toUpperCase() : "",
            TipoCredencial: isNotEmpty(TipoCredencial) ? TipoCredencial.toUpperCase() : "",
            IdCliente,
            Activo: Activo,
            IdEntidad: IdEntidad,
            IdUsuario: usuario.username
        };

        await serviceTipoCredencial.actualizar(params)
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
                setModoEdicion(false);
                listarTipoCredenciales();
            })
            .catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
    }

    async function eliminarRegistro(tipoCredencial, confirm) {
        setSelected(tipoCredencial);
        setIsVisible(true);
        if (confirm) {
            setLoading(true);
            const { IdTipoCredencial, IdCliente } = tipoCredencial;
            await serviceTipoCredencial.eliminar({
                IdTipoCredencial,
                IdCliente,
                IdUsuario: usuario.username
            })
                .then(response => {
                    handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
                })
                .catch(err => {
                    handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
                });
            listarTipoCredenciales();
        }
    }


    async function listarTipoCredenciales() {
        setLoading(true);
        const { IdCliente } = selected;
        await serviceTipoCredencial.listar({ IdCliente }).then(tipoCredenciales => {
            setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
            setTipoCredenciales(tipoCredenciales);
            changeTabIndex(0);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });

    }

    async function obtenerTipoCredencial() {
        setLoading(true);
        const { IdTipoCredencial } = selected;
        await serviceTipoCredencial.obtener({
            IdTipoCredencial,
            IdCliente: 0
        }).then(tipoCredencial => {
            setDataRowEditNew({ ...tipoCredencial, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }
    //}


    const nuevoRegistro = () => {
        changeTabIndex(1);
        const { IdCliente } = selected;
        let tipoCredencial = { Activo: "S", IdCliente };
        setDataRowEditNew({ ...tipoCredencial, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
    };

    const editarRegistro = async (dataRow) => {
        changeTabIndex(1);
        const { IdTipoHabitacion, RowIndex } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerTipoCredencial(IdTipoHabitacion);
        setFocusedRowKey(RowIndex);
    };

    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const seleccionarRegistro = dataRow => {
        const { IdTipoCredencial, RowIndex } = dataRow;
        setModoEdicion(false);
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        if (IdTipoCredencial != varIdTipoCredencial) {
            setVarIdTipoCredencial(IdTipoCredencial);
            setFocusedRowKey(RowIndex);
        }
    }


    const verRegistroDblClick = async (dataRow) => {
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        changeTabIndex(1);
        setModoEdicion(false);
        await obtenerTipoCredencial(dataRow);
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

    /************--upload File-***********************/
    const uploadFileDesign = async (tipoCredencial) => {
        //Función para subir diseño 
        //1-LocalHost: Obtener archivo .lyt codificado en base64
        //2- Almacenar archivo en base datos
        setLoading(true);
        //Get Data
        await serviceLocal.UploadDesign(tipoCredencial).then(async (filesLocal) => {
            //Print
            //console.log("GetBadgeBase64.response", filesLocal);
            // const { IdTipoCredencial } = tipoCredencial;
            // const { fileBase64, filename } = data;
            var files = [];
            filesLocal.listFiles.map(item => {
                const { idTipoCredencial, idSecuencial, archivo, nombre, tipoArchivo } = item;
                //console.log("item-->", item);
                let file = {
                    IdTipoCredencial: idTipoCredencial,
                    IdSecuencial: idSecuencial,
                    Archivo: archivo,
                    Nombre: nombre,
                    TipoArchivo: tipoArchivo
                };
                files.push(file);
            });
           
           //console.log("uploadDisenio:>",archivo );
            await serviceTipoCredencialArchivo.crear({ files }).then(response => {
                //console.log("response-localhost-printBadge-->", response);
                if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPLOAD.SUCESS" }));
                setModoEdicion(false);
                listarTipoCredenciales();

            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            });

        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });

    }

    /************--upload File-***********************/
    const downloadFileDesign = async () => {
        //Función para descargar diseño 
        //1-Servidor: Obtener archivo .lyt codificado en base64
        //2-Local: Escribir archivo en disco
        setLoading(true);
        //Get Data
        await serviceTipoCredencialArchivo.descargar({ IdCliente: perfil.IdCliente }).then(async (data) => {
            //Obtener datos del servidor            
            await serviceLocal.DownloadDesign({ data }).then(response => {
                //Escribir archivo en disco
                if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPLOAD.SUCESS" }));
                setModoEdicion(false);
                listarTipoCredenciales();
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            });

        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });

    }


    useEffect(() => {
        listarTipoCredenciales();
        loadControlsPermission();
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <Portlet >
                        <CustomBreadcrumbs
                            Title={intl.formatMessage({ id: "IDENTIFICATION.CREDENTIALTYPE.MENU" })}
                            SubMenu={intl.formatMessage({ id: "CONFIG.MENU.IDENTIFICACION.CONFIGURACIÓN_DE_FOTOCH" })}
                            Subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
                        />
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                    {`${intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })} `}
                                    {/* {intl.formatMessage({ id: "IDENTIFICATION.CREDENTIALTYPE.MAINTENANCE" })} */}
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
                                        onClick={listarTipoCredenciales} {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "IDENTIFICATION.CREDENTIALTYPE" })}
                                        icon={<ContactsIcon fontSize="large" />}
                                        onClick={(e => {
                                            setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
                                            obtenerTipoCredencial(varIdTipoCredencial)
                                        })} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdTipoCredencial) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <TipoCredencialListPage
                                        tipoCredenciales={tipoCredenciales}
                                        editarRegistro={editarRegistro}
                                        eliminarRegistro={eliminarRegistro}
                                        nuevoRegistro={nuevoRegistro}
                                        seleccionarRegistro={seleccionarRegistro}
                                        verRegistroDblClick={verRegistroDblClick}
                                        downloadFileDesign={downloadFileDesign}
                                        focusedRowKey={focusedRowKey}
                                        accessButton={accessButton}
                                    />
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                        <TipoCredencialEditPage
                                            titulo={titulo}
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarTipoCredencial={actualizarTipoCredencial}
                                            agregarTipoCredencial={agregarTipoCredencial}
                                            cancelarEdicion={cancelarEdicion}
                                            uploadFileDesign={uploadFileDesign}

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
                                        <>
                                            {/*++++++++LEYENDA DE ACCIONES+++++++++++++++++++++++++++++++++++++++++++++++++++++ */}
                                            {/* <div className="col-12">
                                            <div className="row mt-3">
                                                <div className="col-12 col-md-6">
                                                    <fieldset className="scheduler-border">
                                                        <legend className="scheduler-border" >
                                                            <h5> {intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ACTIONS" })}</h5>
                                                        </legend>
                                                        <div className="row">
                                                            <div className="col-12">
                                                                <i className="dx-icon dx-icon-rename" />: {intl.formatMessage({ id: "ACTION.DESIGN.FOTOCHECK" })}
                                                            </div>
                                                            <div className="col-12">
                                                                <i className="fas fa-upload" />: {intl.formatMessage({ id: "ACTION.UPLOAD.FOTOCHECK" })}
                                                            </div>

                                                        </div>
                                                    </fieldset>
                                                </div>
                                                <div className="col-12 col-md-6" />
                                            </div>
                                        </div> */}
                                        </>
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

export default injectIntl(WithLoandingPanel(TipoCredencialIndexPage));

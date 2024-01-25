import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; 
import { Portlet } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { handleErrorMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";

import { useSelector } from "react-redux";
import { isNotEmpty } from "../../../../../_metronic";
import AuditoriaPage from "../../../../store/ducks/seguridad/AuditoriaPage";
import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

import { eliminar, obtener, listar, crear, actualizar } from "../../../../api/campamento/campamento.api";
import CampamentoListPage from "./CampamentoListPage";
import CampamentoEditPage from "./CampamentoEditPage";

import {
    eliminar as eliminarCampModulo, obtener as obtenerCampModulo, listar as listarCampModulo, crear as crearCampModulo, actualizar as actualizarCampModulo
} from "../../../../api/campamento/modulo.api";
import ModuloListPage from "../modulo/ModuloListPage";
import ModuloEditPage from "../modulo/ModuloEditPage";

import {
    eliminar as eliminarCampHabitacion, obtener as obtenerCampHabitacion, listar as listarCampHabitacion, crear as crearCampHabitacion, actualizar as actualizarCampHabitacion
} from "../../../../api/campamento/habitacion.api";
import HabitacionListPage from "../habitacion/HabitacionListPage";
import HabitacionEditPage from "../habitacion/HabitacionEditPage";

import {
    eliminar as eliminarHabCama, obtener as obtenerHabCama, listar as listarHabCama, crear as crearHabCama, actualizar as actualizarHabCama
} from "../../../../api/campamento/habitacionCama.api";
import HabitacionCamaListPage from "../habitacionCama/HabitacionCamaListPage";
import HabitacionCamaEditPage from "../habitacionCama/HabitacionCamaEditPage";

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PropTypes from 'prop-types';

import FormatListNumberedIcon from '@material-ui/icons/FormatListNumbered';
import LocalConvenienceStoreIcon from '@material-ui/icons/LocalConvenienceStore';
import ApartmentIcon from '@material-ui/icons/Apartment';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import LocalHotelIcon from '@material-ui/icons/LocalHotel';

import HeaderInformation from "../../../../partials/components/HeaderInformation";

const CampamentoIndexPage = ({ intl }) => {
    const usuario = useSelector(state => state.auth.user);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [varIdCampamento, setVarIdCampamento] = useState("");
    const [varIdModulo, setVarIdModulo] = useState("");
    const [varIdHabitacion, setVarIdHabitacion] = useState("");
    
    const [focusedRowKey, setFocusedRowKey] = useState(0);
    const [campamentos, setCampamentos] = useState([]);

    const [modulos, setModulos] = useState([]);
    //Datos principales
    const [selected, setSelected] = useState({});

    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [modoEdicionTabs, setModoEdicionTabs] = useState(false);
    const [dataRowEditNewTabs, setDataRowEditNewTabs] = useState({});
    const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [listarTabs, setListarTabs] = useState([]);

    const classesEncabezado = useStylesEncabezado();
    const classes = useStylesTab();
    const [tabIndex, setTabIndex] = useState(0);

    const handleChange = (newValue) => {
        setTabIndex(newValue);
    };

     //Datos Principales
     const changeTabIndex = (index) => {
        handleChange(index);
    }


    //::::::::::::::::::::::::::::FUNCIONES PARA CAMPAMENTO-:::::::::::::::::::::::::::::::::::

    async function agregarCampamento(data) {
        const { IdCampamento, Campamento, Activo } = data;
        let param = {
            IdCampamento: isNotEmpty(IdCampamento) ? IdCampamento.toUpperCase() : "",
            Campamento: isNotEmpty(Campamento) ? Campamento.toUpperCase() : "",
            IdCliente: perfil.IdCliente,
            IdDivision: perfil.IdDivision,
            Activo: Activo,
            IdUsuario: usuario.username
        };
        await crear(param)
            .then(response => {
                if (response)
                    handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
                setModoEdicion(false);
                listarCampamentos();
            })
            .catch(err => {
                handleErrorMessages(err);
            });
    }


    async function actualizarCampamento(campamento) {
        const { IdCampamento, Campamento, Activo } = campamento;
        let params = {
            IdCampamento: isNotEmpty(IdCampamento) ? IdCampamento.toUpperCase() : "",
            Campamento: isNotEmpty(Campamento) ? Campamento.toUpperCase() : "",
            IdCliente: perfil.IdCliente,
            IdDivision: perfil.IdDivision,
            Activo: Activo,
            IdUsuario: usuario.username
        };
        await actualizar(params)
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
                setModoEdicion(false);
                listarCampamentos();
            })
            .catch(err => {
                handleErrorMessages(err);
            });
    }


    async function eliminarRegistro(campamento) {
        const { IdCliente, IdDivision, IdCampamento } = campamento;
        await eliminar({
            IdCliente: IdCliente,
            IdDivision: IdDivision,
            IdCampamento: IdCampamento,
            IdUsuario: usuario.username
        })
            .then(response => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            })
            .catch(err => {
                handleErrorMessages(err);
            });
        listarCampamentos();
    }


    async function listarCampamentos() {
        let campamentos = await listar({
            IdCliente: perfil.IdCliente,
            IdDivision: perfil.IdDivision,
            //IdCampamento: '%',
            NumPagina: 0,
            TamPagina: 0
        }).catch(err => {
            handleErrorMessages(err);
        });
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setCampamentos(campamentos);
        changeTabIndex(0);
    }


    async function obtenerCampamento(filtro) {
        const { IdCliente, IdDivision, IdCampamento } = filtro;
        if (isNotEmpty(IdCliente)
            && isNotEmpty(IdDivision)
            && isNotEmpty(IdCampamento)) {
            let campamento = await obtener({
                IdCliente: IdCliente,
                IdDivision: IdDivision,
                IdCampamento: IdCampamento
            }).catch(err => {
                handleErrorMessages(err);
            });
            setDataRowEditNew({ ...campamento, esNuevoRegistro: false });
        }
    }


    const nuevoRegistro = () => {
        changeTabIndex(1);
        let campamento = {
            Activo: "S",
            FechaRegistro: new Date().toJSON().slice(0, 10)
        };
        setDataRowEditNew({ ...campamento, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);
        setVarIdCampamento("");

    };


    const editarRegistro = dataRow => {
        changeTabIndex(1);
        const { IdCampamento } = dataRow;
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        //setVarIdCampamento(IdCampamento);
        obtenerCampamento(dataRow);
    };


    const cancelarEdicion = () => {
        changeTabIndex(0);
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
        setDataRowEditNewTabs({});
        setVarIdCampamento("");
    };


    const seleccionarRegistro = dataRow => {
        //console.log("seleccionarRegistro", dataRow);
        const { IdCampamento, Campamento, RowIndex } = dataRow;
        setModoEdicion(false);
        //Datos Principales
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        if (IdCampamento != varIdCampamento) {
            setVarIdCampamento(IdCampamento);
            obtenerCampamento(dataRow);
            setFocusedRowKey(RowIndex);
        }
    }

    useEffect(() => {
        listarCampamentos();
    }, []);

    //::::::::::::::::::::::FUNCION CAMPAMENTO MÓDULO:::::::::::::::::::::::::::::::::::::::::::::::::

    async function agregarCampamentoModulo(dataCampamentoModulo) {
        //console.log("agregarComedorServicio", dataComedorServicio);
        const { IdCampamento, IdModulo, Modulo, IdTipoModulo, Activo } = dataCampamentoModulo;
        let params = {
            IdCampamento: varIdCampamento
            , IdModulo: isNotEmpty(IdModulo) ? IdModulo.toUpperCase() : ""
            , Modulo: isNotEmpty(Modulo) ? Modulo.toUpperCase() : ""
            , IdTipoModulo: isNotEmpty(IdTipoModulo) ? IdTipoModulo.toUpperCase() : ""
            , Activo
            , IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdUsuario: usuario.username
        };
        await crearCampModulo(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            listarCampamentoModulo();
        }).catch(err => {
            handleErrorMessages(err);
        });
    }


    async function actualizarCampamentoModulo(campamentoModulo) {
        //console.log("actualizarComedorServicio", comedorServicio);
        const { IdCampamento, IdModulo, Modulo, IdTipoModulo, Activo } = campamentoModulo;
        let params = {
            IdCampamento: varIdCampamento
            , IdModulo: isNotEmpty(IdModulo) ? IdModulo.toUpperCase() : ""
            , Modulo: isNotEmpty(Modulo) ? Modulo.toUpperCase() : ""
            , IdTipoModulo: isNotEmpty(IdTipoModulo) ? IdTipoModulo.toUpperCase() : ""
            , Activo
            , IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdUsuario: usuario.username
        };
        await actualizarCampModulo(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            listarCampamentoModulo();
        }).catch(err => {
            handleErrorMessages(err);
        });
    }


    async function eliminarRegistroCampamentoModulo(campamentoModulo) {
        const { IdCampamento, IdModulo, IdCliente, IdDivision } = campamentoModulo;
        await eliminarCampModulo({
            IdCampamento: IdCampamento,
            IdModulo: IdModulo,
            IdCliente: IdCliente,
            IdDivision: IdDivision,
            IdUsuario: usuario.username
        }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(err);
        });
        listarCampamentoModulo();
    }

    async function listarCampamentoModulo() {
        setModoEdicionTabs(false);
        let campamentosModulo = await listarCampModulo({
            IdCampamento: varIdCampamento,
            IdCliente: perfil.IdCliente,
            IdDivision: perfil.IdDivision,
            NumPagina: 0, TamPagina: 0
        })
        .catch(err => {
            handleErrorMessages(err);
        });
        setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
        setListarTabs(campamentosModulo);
}


    async function obtenerCampamentoModulo(filtro) {
        const { IdCampamento, IdModulo, IdCliente, IdDivision } = filtro;
        if (IdCampamento) {
            let campamentoModulo = await obtenerCampModulo({
                IdCampamento: IdCampamento,
                IdModulo: IdModulo,
                IdCliente: IdCliente,
                IdDivision: IdDivision
            }).catch(err => {
                handleErrorMessages(err);
            });
            setDataRowEditNewTabs({ ...campamentoModulo, esNuevoRegistro: false });
        }
    }


    const editarRegistroCampamentoModulo = dataRow => {
        setModoEdicionTabs(true);
        setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerCampamentoModulo(dataRow);
    };


    const nuevoCampamentoModulo = () => {
        let nuevo = { Activo: "S", HoraInicio:"00:00", HoraFin:"00:00" };
        setDataRowEditNewTabs({ ...nuevo, esNuevoRegistro: true });
        setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicionTabs(true);
    };

    
    const seleccionarRegistroModulo = dataRow => {
        //console.log("seleccionarRegistroModulo", dataRow);
        const { IdModulo, RowIndex } = dataRow;
        setModoEdicion(false);
        //Datos Principales
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        if (IdModulo != varIdModulo) {
            setVarIdModulo(IdModulo);
           // obtenerCampamentoModulo(dataRow);
            setFocusedRowKey(RowIndex);
        }
    }



    /*const cancelarEdicionTabsModulo = () => {
        setModoEdicionTabs(false);
        setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNewTabs({});
    };*/

    const getInfo = () => {
        const { IdCampamento, Campamento } = selected;
        return {
            [intl.formatMessage({ id: "COMMON.CODE" })]: IdCampamento,
            [intl.formatMessage({ id: "CAMP.CAMP" })] : Campamento,
        };
    }


    //::::::::::::::::::::::FUNCION HABITACION:::::::::::::::::::::::::::::::::::::::::::::::::

    async function agregarCampamentoHabitacion(dataCampamentoHabitacion) {
        const { IdCliente, IdDivision, IdCampamento, IdModulo, IdHabitacion, Habitacion, IdTipoHabitacion, Activo } = dataCampamentoHabitacion;
        let params = {
            IdCampamento: varIdCampamento
            , IdModulo: varIdModulo
            , IdHabitacion: isNotEmpty(IdHabitacion) ? IdHabitacion.toUpperCase() : ""
            , Habitacion: isNotEmpty(Habitacion) ? Habitacion.toUpperCase() : ""
            , IdTipoHabitacion: isNotEmpty(IdTipoHabitacion) ? IdTipoHabitacion.toUpperCase() : ""
            , Activo
            , IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdUsuario: usuario.username
        };
        await crearCampHabitacion(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            listarCampamentoHabitacion();
        }).catch(err => {
            handleErrorMessages(err);
        });
    }


    async function actualizarCampamentoHabitacion(campamentoHabitacion) {
        const { IdCliente, IdDivision, IdCampamento, IdModulo, IdHabitacion,Habitacion, IdTipoHabitacion, Activo } = campamentoHabitacion;
        let params = {
            IdCampamento: varIdCampamento
            , IdModulo: isNotEmpty(IdModulo) ? IdModulo.toUpperCase() : ""//varIdModulo
            , IdHabitacion: isNotEmpty(IdHabitacion) ? IdHabitacion.toUpperCase() : ""
            , Habitacion: isNotEmpty(Habitacion) ? Habitacion.toUpperCase() : ""
            , IdTipoHabitacion: isNotEmpty(IdTipoHabitacion) ? IdTipoHabitacion.toUpperCase() : ""
            , Activo
            , IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdUsuario: usuario.username
        };
        await actualizarCampHabitacion(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            listarCampamentoHabitacion();
        }).catch(err => {
            handleErrorMessages(err);
        });
    }


    async function eliminarRegistroCampamentoHabitacion(campamentoHabitacion) {
        const { IdCampamento, IdModulo, IdHabitacion, IdCliente, IdDivision } = campamentoHabitacion;
        await eliminarCampHabitacion({
            IdCampamento: IdCampamento,
            IdModulo: IdModulo,
            IdHabitacion: IdHabitacion,
            IdCliente: IdCliente,
            IdDivision: IdDivision,
            IdUsuario: usuario.username
        }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(err);
        });
        listarCampamentoHabitacion();
    }

    async function listarCampamentoHabitacion() {
        setModoEdicionTabs(false);
        let campamentosHabitacion = await listarCampHabitacion({
            IdCampamento: varIdCampamento,
            IdCliente: perfil.IdCliente,
            IdDivision: perfil.IdDivision,
            IdModulo: varIdModulo,
            IdHabitacion: '%',
            NumPagina: 0, TamPagina: 0
        }).catch(err => {
            handleErrorMessages(err);
        });
        setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
        setListarTabs(campamentosHabitacion);
    }


    async function obtenerCampamentoHabitacion(filtro) {
        const { IdCampamento, IdModulo, IdHabitacion, IdCliente, IdDivision } = filtro;
        if (IdCliente && IdDivision && IdCampamento && IdModulo && IdHabitacion) {
            let campamentoHabitacion = await obtenerCampHabitacion({
                IdCampamento: IdCampamento,
                IdModulo: IdModulo,
                IdHabitacion: IdHabitacion,
                IdCliente: IdCliente,
                IdDivision: IdDivision
            }).catch(err => {
                handleErrorMessages(err);
            });
            setDataRowEditNewTabs({ ...campamentoHabitacion, esNuevoRegistro: false });
        }
    }


    const editarRegistroCampamentoHabitacion = dataRow => {
        const { IdCliente, IdDivision, IdCampamento, IdModulo, IdHabitacion } = dataRow;
        let filtro = {
            IdCliente: IdCliente,
            IdDivision: IdDivision,
            IdCampamento: IdCampamento,
            IdModulo: IdModulo,
            IdHabitacion: IdHabitacion
        };
        setModoEdicionTabs(true);
        setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerCampamentoHabitacion(dataRow);
    };


    const nuevoRegistroTabsHabitacion = () => {
        let nuevo = { Activo: "S" };
        setDataRowEditNewTabs({ ...nuevo, esNuevoRegistro: true });
        setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicionTabs(true);
    };


    const seleccionarRegistroHabitacion = dataRow => {
        //console.log("seleccionarRegistroHabitacion", dataRow);
        const { IdHabitacion, RowIndex } = dataRow;
        setModoEdicion(true);
        setSelected(dataRow);
        setTitulo(intl.formatMessage({ id: "ACTION.EDIT" }));
        if (IdHabitacion != varIdHabitacion) {
            setVarIdHabitacion(IdHabitacion);
            setFocusedRowKey(RowIndex);
        }
    }


    const cancelarEdicionTabsHabitacion = () => {
        setModoEdicionTabs(false);
        setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNewTabs({});
    };



       //::::::::::::::::::::::FUNCION HABITACIÓN CAMA:::::::::::::::::::::::::::::::::::::::::::::::::

       async function agregarHabitacionCama(dataHabitacionCama) {
        const { IdCliente, IdDivision, IdCampamento, IdModulo, IdHabitacion, IdCama, Cama, IdTipoCama, Activo } = dataHabitacionCama;
        let params = {
            IdCampamento: varIdCampamento
            , IdModulo: varIdModulo
            , IdHabitacion: varIdHabitacion
            , IdCama: isNotEmpty(IdCama) ? IdCama.toUpperCase() : ""
            , Cama: isNotEmpty(Cama) ? Cama.toUpperCase() : ""
            , IdTipoCama: isNotEmpty(IdTipoCama) ? IdTipoCama.toUpperCase() : ""
            , Activo
            , IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdUsuario: usuario.username
        };
        await crearHabCama(params).then(response => {
            if (response)
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            listarHabitacionCama();
        }).catch(err => {
            handleErrorMessages(err);
        });
    }


    async function actualizarHabitacionCama(habitacionCama) {
        const { IdCliente, IdDivision, IdCampamento, IdModulo, IdHabitacion, IdCama, Cama, IdTipoCama, Activo } = habitacionCama;
        let params = {
            IdCampamento: varIdCampamento
            , IdModulo: varIdModulo
            , IdHabitacion: varIdHabitacion
            , IdCama: isNotEmpty(IdCama) ? IdCama.toUpperCase() : ""
            , Cama: isNotEmpty(Cama) ? Cama.toUpperCase() : ""
            , IdTipoCama: isNotEmpty(IdTipoCama) ? IdTipoCama.toUpperCase() : ""
            , Activo
            , IdCliente: perfil.IdCliente
            , IdDivision: perfil.IdDivision
            , IdUsuario: usuario.username
        };
        await actualizarHabCama(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            listarHabitacionCama();
        }).catch(err => {
            handleErrorMessages(err);
        });
    }


    async function eliminarRegistroHabitacionCama(habitacionCama) {
        const {IdCampamento, IdModulo, IdHabitacion, IdCama, IdCliente, IdDivision } = habitacionCama;
        await eliminarHabCama({
            IdCampamento: IdCampamento,
            IdModulo: IdModulo,
            IdHabitacion: IdHabitacion,
            IdCama: IdCama,
            IdCliente: IdCliente,
            IdDivision: IdDivision,
            IdUsuario: usuario.username
        }).then(response => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
        }).catch(err => {
            handleErrorMessages(err);
        });
        listarHabitacionCama();
    }

    async function listarHabitacionCama() {
        setModoEdicionTabs(false);
        let habitacionesCama = await listarHabCama({
            IdCampamento: varIdCampamento,
            IdCliente: perfil.IdCliente,
            IdDivision: perfil.IdDivision,
            IdModulo: varIdModulo,
            IdHabitacion: varIdHabitacion,
            IdCama: '%',
            NumPagina: 0, TamPagina: 0
        }).catch(err => {
            handleErrorMessages(err);
        });
        setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
        setListarTabs(habitacionesCama);
    }


    async function obtenerHabitacionCama(filtro) {
        const { IdCampamento, IdModulo, IdHabitacion, IdCama, IdCliente, IdDivision } = filtro;
        if (IdCliente && IdDivision && IdCampamento && IdModulo && IdHabitacion && IdCama) {
            let habitacionCama = await obtenerHabCama({
                IdCampamento: IdCampamento,
                IdModulo: IdModulo,
                IdHabitacion: IdHabitacion,
                IdCama: IdCama,
                IdCliente: IdCliente,
                IdDivision: IdDivision
            }).catch(err => {
                handleErrorMessages(err);
            });
            setDataRowEditNewTabs({ ...habitacionCama, esNuevoRegistro: false });
        }
    }


    const editarRegistroHabitacionCama = dataRow => {
        const { IdCliente, IdDivision, IdCampamento, IdModulo, IdHabitacion, IdCama } = dataRow;
        let filtro = {
            IdCliente: IdCliente,
            IdDivision: IdDivision,
            IdCampamento: IdCampamento,
            IdModulo: IdModulo,
            IdHabitacion: IdHabitacion,
            IdCama: IdCama
        };
        setModoEdicionTabs(true);
        setTituloTabs(intl.formatMessage({ id: "ACTION.EDIT" }));
        obtenerHabitacionCama(dataRow);
    };


    const nuevoRegistroTabsHabitacionCama = () => {
        let nuevo = { Activo: "S" };
        setDataRowEditNewTabs({ ...nuevo, esNuevoRegistro: true });
        setTituloTabs(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicionTabs(true);
    };


    const cancelarEdicionTabsHabitacionCama = () => {
        setModoEdicionTabs(false);
        setTituloTabs(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNewTabs({});
    };

   

    //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    return (
        <>
            <div className="row">
                <div className="col-md-12">
                    <CustomBreadcrumbs Title={intl.formatMessage({ id: "CAMP.PROFILE.MENU" })} Subtitle={intl.formatMessage({ id: "CAMP.CAMP.MANAGEMENT" })} />
                    <Portlet className={classesEncabezado.border}>
                        <AppBar position="static" className={classesEncabezado.principal}>
                            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                   {intl.formatMessage({ id: "CAMP.CAMP.MANAGEMENT" }).toUpperCase()}
                                </Typography>
                            </Toolbar>
                        </AppBar>
                        <HeaderInformation data={getInfo()} visible={[2,3,4].includes(tabIndex)} />
                        <>
                            <div className={classes.root}>
                                <Tabs
                                    orientation="vertical"
                                    value={tabIndex}
                                    onChange={(event, newValue) => handleChange(newValue)}
                                    aria-label="Vertical tabs"
                                    className={classes.tabs}
                                    variant="fullWidth"
                                    indicatorColor="primary"
                                    textColor="primary" >
                                    <Tab
                                        label= {intl.formatMessage({ id: "ACTION.LIST" }).toUpperCase()}
                                        icon={<FormatListNumberedIcon fontSize="large" />}
                                        onClick={listarCampamentos} {...tabPropsIndex(0)}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "CAMP.CAMP" }).toUpperCase()}
                                        icon={<LocalConvenienceStoreIcon fontSize="large" />}
                                        onClick={(e => obtenerCampamento(varIdCampamento))} {...tabPropsIndex(1)}
                                        disabled={isNotEmpty(varIdCampamento) ? false : true}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label= {intl.formatMessage({ id: "CAMP.MODULE" }).toUpperCase()}
                                        icon={<ApartmentIcon fontSize="large" />}
                                        onClick={listarCampamentoModulo} {...tabPropsIndex(2)}
                                        disabled={isNotEmpty(varIdCampamento) ? false : true}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "CAMP.ROOM" }).toUpperCase()}
                                        icon={<LocalOfferIcon fontSize="large" />}
                                        onClick={listarCampamentoHabitacion} {...tabPropsIndex(3)}
                                        disabled={isNotEmpty(varIdModulo) ? false : true}
                                        className={classes.tabContent}
                                    />
                                    <Tab
                                        label={intl.formatMessage({ id: "CAMP.ROOM.BED" }).toUpperCase()}
                                        icon={<LocalHotelIcon fontSize="large" />}
                                        onClick={listarHabitacionCama} {...tabPropsIndex(4)}
                                        disabled={isNotEmpty(varIdHabitacion) ? false : true}
                                        className={classes.tabContent}
                                    />
                                </Tabs>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={0}>
                                    <CampamentoListPage
                                        campamentos={campamentos}
                                        titulo={titulo}
                                        editarRegistro={editarRegistro}
                                        eliminarRegistro={eliminarRegistro}
                                        nuevoRegistro={nuevoRegistro}
                                        seleccionarRegistro={seleccionarRegistro}
                                        focusedRowKey={focusedRowKey}
                                    />
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={1}>
                                    <>
                                        <CampamentoEditPage
                                            titulo={titulo}
                                            idCampamento={varIdCampamento}
                                            modoEdicion={modoEdicion}
                                            dataRowEditNew={dataRowEditNew}
                                            actualizarCampamento={actualizarCampamento}
                                            agregarCampamento={agregarCampamento}
                                            cancelarEdicion={cancelarEdicion}
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
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={2}>
                                    <>
                                        {modoEdicionTabs && (
                                            <>
                                                <ModuloEditPage
                                                    dataRowEditNew={dataRowEditNewTabs}
                                                    actualizarCampamentoModulo={actualizarCampamentoModulo}
                                                    agregarCampamentoModulo={agregarCampamentoModulo}
                                                    cancelarEdicion={cancelarEdicionTabsHabitacion}
                                                    titulo={tituloTabs}
                                                />
                                                <div className="container_only">
                                                    <div className="float-right">
                                                        <ControlSwitch checked={auditoriaSwitch}
                                                            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                                        /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                                                    </div>
                                                </div>
                                                {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
                                            </>
                                        )}
                                        {!modoEdicionTabs && (
                                            <>
                                                <ModuloListPage
                                                    campamentosModulo={listarTabs}
                                                    editarRegistro={editarRegistroCampamentoModulo}
                                                    eliminarRegistro={eliminarRegistroCampamentoModulo}
                                                    nuevoRegistro={nuevoCampamentoModulo}
                                                    seleccionarRegistro={seleccionarRegistroModulo}
                                                    cancelarEdicion={cancelarEdicion}
                                                />
                                            </>
                                        )}
                                    </>
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={3}>
                                    <>
                                        {modoEdicionTabs && (
                                            <>
                                                <HabitacionEditPage
                                                    dataRowEditNew={dataRowEditNewTabs}
                                                    actualizarCampamentoHabitacion={actualizarCampamentoHabitacion}
                                                    agregarCampamentoHabitacion={agregarCampamentoHabitacion}
                                                    cancelarEdicion={cancelarEdicionTabsHabitacion}
                                                    titulo={tituloTabs}
                                                />
                                                <div className="container_only">
                                                    <div className="float-right">
                                                        <ControlSwitch checked={auditoriaSwitch}
                                                            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                                        /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                                                    </div>
                                                </div>
                                                {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
                                            </>
                                        )}
                                        {!modoEdicionTabs && (
                                            <>
                                                <HabitacionListPage
                                                    campamentosHabitacion={listarTabs}
                                                    editarRegistro={editarRegistroCampamentoHabitacion}
                                                    eliminarRegistro={eliminarRegistroCampamentoHabitacion}
                                                    nuevoRegistro={nuevoRegistroTabsHabitacion}
                                                    seleccionarRegistro={seleccionarRegistroHabitacion}
                                                    cancelarEdicion={cancelarEdicion}
                                                />
                                            </>
                                        )}
                                         </>
                                </TabPanel>
                                <TabPanel value={tabIndex} className={classes.TabPanel} index={4}>
                                    <>
                                        {modoEdicionTabs && (
                                            <>
                                                <HabitacionCamaEditPage
                                                    dataRowEditNew={dataRowEditNewTabs}
                                                    actualizarHabitacionCama={actualizarHabitacionCama}
                                                    agregarHabitacionCama={agregarHabitacionCama}
                                                    cancelarEdicion={cancelarEdicionTabsHabitacion}
                                                    titulo={tituloTabs}
                                                />
                                                <div className="container_only">
                                                    <div className="float-right">
                                                        <ControlSwitch checked={auditoriaSwitch}
                                                            onChange={e => { setAuditoriaSwitch(e.target.checked) }}
                                                        /><b> {intl.formatMessage({ id: "AUDIT.DATA" })}</b>
                                                    </div>
                                                </div>
                                                {auditoriaSwitch && (<AuditoriaPage dataRowEditNew={dataRowEditNewTabs} />)}
                                            </>
                                        )}
                                        {!modoEdicionTabs && (
                                            <>
                                                <HabitacionCamaListPage
                                                    habitacionesCama={listarTabs}
                                                    editarRegistro={editarRegistroHabitacionCama}
                                                    eliminarRegistro={eliminarRegistroHabitacionCama}
                                                    nuevoRegistro={nuevoRegistroTabsHabitacionCama}
                                                    cancelarEdicion={cancelarEdicion}
                                                />
                                            </>
                                        )}
                                         </>
                                </TabPanel>
                            </div>
                        </>
                    </Portlet>
                </div>
            </div>
        </>
    );
};

//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

//Configuración inicial de tabs.

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

export default injectIntl(CampamentoIndexPage);

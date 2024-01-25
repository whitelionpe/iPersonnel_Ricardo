import React, { useEffect, useState } from "react";
import {
    handleErrorMessages,
    handleInfoMessages,
    handleSuccessMessages
} from "../../../../../store/ducks/notify-messages";
import { useSelector } from "react-redux";
import { isNotEmpty, dateFormat } from "../../../../../../_metronic";

import {
    servicePersonaContrato
} from "../../../../../api/administracion/personaContrato.api";
import { obtener as obtenerConfig } from "../../../../../api/sistema/configuracion.api"
import { obtenerTodos as obtenerMotivosCese } from "../../../../../api/administracion/motivoCese.api";

const usePersonaContrato = ({
    intl,
    setLoading,
    varIdPersona,
    selectedIndex
}) => {

    const usuario = useSelector(state => state.auth.user);
    const { IdCliente } = useSelector(state => state.perfil.perfilActual);

    const [listarTabs, setListarTabs] = useState([]);
    const [focusedRowKey, setFocusedRowKey] = useState(0);

    const [titulo, setTitulo] = useState(intl.formatMessage({ id: "ACTION.LIST" }));
    const [auditoriaSwitch, setAuditoriaSwitch] = useState(false);
    const [dataRowEditNew, setDataRowEditNew] = useState({});
    const [modoEdicion, setModoEdicion] = useState(false);
    const [selected, setSelected] = useState({});

    const [isVisible, setIsVisible] = useState(false);
    const [instance, setInstance] = useState({});
    const [selectedDelete, setSelectedDelete] = useState({});
    const [tituloTabs, setTituloTabs] = useState(intl.formatMessage({ id: "ACTION.EDIT" }));
    const [showConfirm, setShowConfirm] = useState(false);
    const [showMotivoCese, setShowMotivoCese] = useState(false);
    const [oldContract, setOldContract] = useState({});
    const [motivosCese, setMotivoCese] = useState([]);
    const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });

    const [posicionDefault, setPosicionDefault] = useState({
        activo: false,
        IdPosicionMandante: '',
        IdPosicionContratista: '',
        PosicionMandante: '',
        PosicionContratista: ''
    });

    //:::::::::::::::::::::::::::::::::::::::::::::-funciones-persona- Contrato:::::::::::::::::::::::::::::::::  

    async function listarPersonaContrato() {
        setLoading(true);
        const { IdCliente, IdPersona } = selectedIndex;
        setModoEdicion(false);
        await servicePersonaContrato.listarposicion({
            IdCliente,
            IdPersona,
            NumPagina: 0,
            TamPagina: 0
        }).then(contratos => {
            setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
            setListarTabs(contratos);
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });

    }

    async function agregarRegistro(dataForm) {
        setLoading(true);
        //console.log("agregarRegistro>..", dataForm);
        const { FechaInicio, FechaFin } = dataRowEditNew;
        const {
            IdPersona
            , IdSecuencial
            , IdCompaniaMandante
            , IdContrato
            , IdCompaniaContratista
            , IdDivision
            // , FechaInicio
            // , FechaFin
            , IdUnidadOrganizativa
            , IdCompaniaSubContratista
            , IdCentroCosto
            , Activo
            , IdPosicion
            , FechaCese
            , IdMotivoCese
            , CodigoPlanilla
            , IdSecuencialPosicion
        } = dataForm;
        let params = {
            IdCliente
            , IdPersona: varIdPersona
            , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
            , IdCompaniaMandante: isNotEmpty(IdCompaniaMandante) ? IdCompaniaMandante.toUpperCase() : ""
            , IdContrato: isNotEmpty(IdContrato) ? IdContrato.toUpperCase() : ""
            , IdCompaniaContratista: isNotEmpty(IdCompaniaContratista) ? IdCompaniaContratista.toUpperCase() : ""
            , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
            , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : ""
            , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
            , IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : ""
            , IdCompaniaSubContratista: isNotEmpty(IdCompaniaSubContratista) ? IdCompaniaSubContratista.toUpperCase() : ""
            , IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto.toUpperCase() : ""
            , IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : ""
            , IdSecuencialPosicion: isNotEmpty(IdSecuencialPosicion) ? IdSecuencialPosicion : 0
            , FechaCese: isNotEmpty(FechaCese) ? dateFormat(FechaCese, 'yyyyMMdd') : ""
            , IdMotivoCese: isNotEmpty(IdMotivoCese) ? IdMotivoCese : ""
            , CodigoPlanilla: isNotEmpty(CodigoPlanilla) ? CodigoPlanilla.toUpperCase() : ""
            , Activo
            , IdUsuario: usuario.username
        };
        //console.log("params-->", params);
        await servicePersonaContrato.crearposicion(params).then(response => {
            if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.SUCESS" }));
            listarPersonaContrato();
        }).catch(err => {
            // console.log("err", { err });
            let { confirm, mensajeValidacion } = err.response.data.responseException.exceptionMessage;

            if (!!confirm) {
                setSelected(params);
                setShowConfirm(true);
            } else {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), mensajeValidacion, true);
            }
        }).finally(() => { setLoading(false); });
    }

    async function actualizarRegistro(dataForm) {
        //console.log("actualizarRegistro|dataForm:", dataForm);
        setLoading(true);
        const { FechaInicio, FechaFin } = dataRowEditNew;
        const {
            IdPersona
            , IdSecuencial
            , IdCompaniaMandante
            , IdContrato
            , IdCompaniaContratista
            , IdDivision
            // , FechaInicio
            // , FechaFin
            , IdUnidadOrganizativa
            , IdCompaniaSubContratista
            , IdCentroCosto
            , Activo
            , IdPosicion
            , FechaCese
            , IdMotivoCese
            , CodigoPlanilla
            , IdSecuencialPosicion
        } = dataForm;
        let params = {
            IdCliente
            , IdPersona: varIdPersona
            , IdSecuencial: isNotEmpty(IdSecuencial) ? IdSecuencial : 0
            , IdCompaniaMandante: isNotEmpty(IdCompaniaMandante) ? IdCompaniaMandante.toUpperCase() : ""
            , IdContrato: isNotEmpty(IdContrato) ? IdContrato.toUpperCase() : ""
            , IdCompaniaContratista: isNotEmpty(IdCompaniaContratista) ? IdCompaniaContratista.toUpperCase() : ""
            , IdDivision: isNotEmpty(IdDivision) ? IdDivision.toUpperCase() : ""
            , FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyyMMdd') : ""
            , FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyyMMdd') : ""
            , IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : ""
            , IdCompaniaSubContratista: isNotEmpty(IdCompaniaSubContratista) ? IdCompaniaSubContratista.toUpperCase() : ""
            , IdCentroCosto: isNotEmpty(IdCentroCosto) ? IdCentroCosto.toUpperCase() : ""
            , IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : ""
            , IdSecuencialPosicion: isNotEmpty(IdSecuencialPosicion) ? IdSecuencialPosicion : 0
            , FechaCese: isNotEmpty(FechaCese) ? dateFormat(FechaCese, 'yyyyMMdd') : ""
            , IdMotivoCese: isNotEmpty(IdMotivoCese) ? IdMotivoCese : ""
            , CodigoPlanilla: isNotEmpty(CodigoPlanilla) ? CodigoPlanilla.toUpperCase() : ""
            , Activo
            , IdUsuario: usuario.username
        };
        //console.log("params-->", params);
        await servicePersonaContrato.actualizarposicion(params).then(() => {
            handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
            listarPersonaContrato();
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false); });
    }

    async function eliminarRegistro(contrato, confirm) {
        setSelectedDelete(contrato);
        setIsVisible(true);
        if (confirm) {
            setLoading(true);
            const {
                IdCliente,
                IdPersona,
                IdSecuencial,
                IdSecuencialPosicion
            } = contrato;
            await servicePersonaContrato.eliminarposicion({
                IdCliente,
                IdPersona,
                IdSecuencial,
                IdSecuencialPosicion,
                IdUsuario: usuario.username
            }).then(() => {
                handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
            }).catch(err => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            }).finally(() => { setLoading(false); });
            listarPersonaContrato();
        }
    }

    async function obtenerPersonaContrato(filtro) {
        setLoading(true);
        const { IdCliente, IdPersona, IdSecuencial, IdSecuencialPosicion } = filtro;
        await servicePersonaContrato.obtenerposicion({
            IdCliente, IdPersona, IdSecuencial, IdSecuencialPosicion
        }).then(contrato => {
            //console.log("obtenerPersonaContrato|filtro:",filtro);
            setFechasContrato({ FechaInicioContrato: contrato.FechaInicioContrato, FechaFinContrato: contrato.FechaFinContrato });
            setDataRowEditNew({ ...contrato, esNuevoRegistro: false });
        }).catch(err => {
            handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => { setLoading(false) });
    }

    const editarRegistro = async (dataRow, flEditar) => {
        setDataRowEditNew({});
        //console.log("editarRegistro->", )
        await obtenerPersonaContrato(dataRow);
        setTituloTabs((flEditar) ? intl.formatMessage({ id: "ACTION.EDIT" }) : intl.formatMessage({ id: "ACTION.VIEW" }));
        setModoEdicion(true);

    };


    const verRegistro = async (dataRow) => {
        // console.log("Ingreso al editarRegistro");
        // setModoEdicion(false);
        setModoEdicion(true);
        setTitulo(intl.formatMessage({ id: "ACTION.VIEW" }));
        setTituloTabs(intl.formatMessage({ id: "ACTION.VIEW" }));
        obtenerPersonaContrato(dataRow);
    };

    const seleccionarRegistro = (dataRow) => {
        const { RowIndex } = dataRow;
        setFocusedRowKey(RowIndex);
    };

    const nuevoRegistro = () => {
        var date = new Date();
        let contrato = { Activo: "S", ...setSelected, FechaInicio: new Date(), FechaFin: date.setMonth(date.getMonth() + 3) };
        setDataRowEditNew({});
        setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
        setDataRowEditNew({ ...contrato, esNuevoRegistro: true });
        setTitulo(intl.formatMessage({ id: "ACTION.NEW" }));
        setModoEdicion(true);

    };

    const cancelarContrato = () => {
        setModoEdicion(false);
        setTitulo(intl.formatMessage({ id: "ACTION.LIST" }));
        setDataRowEditNew({});
    };

    const ObterConfiguracionPosicionDefault = async () => {

        let promesas = [];
        promesas.push(obtenerConfig({ IdCliente, IdConfiguracion: 'DEFAULT_POSITION_FL' }));
        promesas.push(obtenerConfig({ IdCliente, IdConfiguracion: 'DEFAULT_POSITION_P' }));//Mandante
        promesas.push(obtenerConfig({ IdCliente, IdConfiguracion: 'DEFAULT_POSITION_C' }));//Contratista

        await Promise.all(promesas)
            .then(resp => {

                let flag = resp[0].Valor1;

                if (flag === "S") {

                    setPosicionDefault({
                        activo: true,
                        IdPosicionMandante: resp[1].Valor1,
                        PosicionMandante: resp[1].Valor2,

                        IdPosicionContratista: resp[2].Valor1,
                        PosicionContratista: resp[2].Valor2
                    });

                }


            })

    }

    const eventConfirm = async () => {

        // console.log("eventConfirm", { selected });

        //Se oculta el confirm:
        setShowConfirm(false);
        let { IdPersona } = selected;

        //Se obtiene contrato actual:
        setLoading(true);
        await servicePersonaContrato.obtenerposicion({
            IdCliente,
            IdPersona,
            IdSecuencial: 0,
            IdSecuencialPosicion: 0
        })
            .then(async resp => {
                // console.log("resp", { resp });

                if (!!resp) {
                    // console.log("Ok se carga popup");
                    await obtenerMotivosCese({ IdCliente })
                        .then(resp => { setMotivoCese(resp); });

                    setOldContract(resp);

                    setLoading(false);
                    setShowMotivoCese(true);
                }

            })
            .catch(err => {
                // console.log("Error", { err });
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
                setLoading(false);
            });


        //Carga los datos del contrato anteior para iniciar su baja: 


    }

    const saveEventOldContract = async (data) => {
        setLoading(true);
        // console.log("saveEventOldContract", { data, selected });
        let { IdPersona, IdSecuencial, IdSecuencialPosicion, IdMotivoCese } = data;
        let { FechaInicio } = selected;
        await servicePersonaContrato.bajacontratoanterior({
            IdPersona,
            IdSecuencial,
            IdSecuencialPosicion,
            IdMotivoCese,
            FechaNuevoContrato: FechaInicio
        })
            .then(async resp => {
                //Si esta ok se graba el nuevo contrato: 
                agregarRegistro(selected);
            })
            .catch(err => {
                setLoading(false);
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
            })
    }


    useEffect(() => {
        listarPersonaContrato();
        ObterConfiguracionPosicionDefault();
    }, []);



    return {
        //Propiedades
        selected,
        tituloTabs,
        posicionDefault,
        auditoriaSwitch,
        listarTabs,
        isVisible,
        selectedDelete,
        modoEdicion,
        dataRowEditNew,
        showConfirm,
        showMotivoCese,
        oldContract,
        motivosCese,
        fechasContrato,

        //Metodos:
        setFechasContrato,
        setDataRowEditNew,
        editarRegistro,
        actualizarRegistro,
        agregarRegistro,
        cancelarContrato,
        setAuditoriaSwitch,

        eliminarRegistro,
        nuevoRegistro,
        seleccionarRegistro,
        focusedRowKey,
        verRegistro,

        setIsVisible,
        setInstance,
        setShowConfirm,
        eventConfirm,
        setShowMotivoCese,
        setOldContract,
        saveEventOldContract,

    };
};

export default usePersonaContrato;

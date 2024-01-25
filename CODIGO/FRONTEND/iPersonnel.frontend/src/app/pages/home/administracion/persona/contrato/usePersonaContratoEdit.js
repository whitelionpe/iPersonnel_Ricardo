import { useEffect, useState } from "react";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { obtenerTodos as obtenerCmbDivision } from "../../../../../api/administracion/contratoDivision.api";
import { obtenerTodos as obtenerCmbSubContratista } from "../../../../../api/administracion/contratoSubcontratista.api";
import { obtenerTodos as obtenerCmbCentroCosto } from "../../../../../api/administracion/contratoCentroCosto.api";

import { obtenerTodos as obtenerMotivosCese } from "../../../../../api/administracion/motivoCese.api";
//import { obtenerTodos as listarFuncion } from "../../../../../api/administracion/funcion.api";
import { obtener as obtenerPosicion } from "../../../../../api/administracion/posicion.api";
import { isNotEmpty, listarEstadoSimple, listarTipoPosicion } from "../../../../../../_metronic/utils/utils";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { ContactsOutlined } from "@material-ui/icons";

const usePersonaContratoEdit = ({
    intl,
    posicionDefault,
    dataRowEditNew,
    setLoading,
    setDataRowEditNew,
    agregarRegistro,
    actualizarRegistro,
    modoEdicion,
    fechasContrato,
    setFechasContrato,
    motivoCeseSwitch
}) => {

    //const { intl, setLoading, modoEdicion, settingDataField, accessButton, dataRowEditNew, ocultarEdit } = props;
    const { IdCliente } = useSelector(state => state.perfil.perfilActual);
    const classesEncabezado = useStylesEncabezado();
    const [popupVisibleContrato, setPopupVisibleContrato] = useState(false);
    const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
    const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);

    const [cmbFuncion, setCmbFuncion] = useState([]);
    const [cmbTipoPosicion, setCmbTipoPosicion] = useState([]);
    const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
    const [motivoCese, setMotivoCese] = useState([]);

    const [cmbDivision, setCmbDivision] = useState([]);
    const [cmbSubContratista, setCmbSubContratista] = useState([]);
    const [cmbCentroCosto, setCmbCentroCosto] = useState([]);
    const [estadoSimple, setEstadoSimple] = useState([]);

    const [esBloqueado, setEsBloqueado] = useState(dataRowEditNew.esNuevoRegistro ? false : true);

    const [filtroLocal, setFiltroLocal] = useState({
        IdCliente, IdCompaniaMandante: "", IdCompaniaContratista: "", IdContrato: "", IdUnidadOrganizativa: "", Contratista: "", Activo: "S"
    });


    async function onObtenerCentroCosto(value) {
        setLoading(true);
        //Obtener centro de costo cambio.
        await obtenerCmbCentroCosto({
            IdCliente: IdCliente,
            IdCompaniaMandante: dataRowEditNew.IdCompaniaMandante,
            IdCompaniaContratista: dataRowEditNew.IdCompaniaContratista,
            IdContrato: dataRowEditNew.IdContrato,
            IdUnidadOrganizativa: value,
            IdCentroCosto: '',
        }).then(resonse => {
            setCmbCentroCosto(resonse);
        }).finally(() => { setLoading(false); });

        if (dataRowEditNew.esNuevoRegistro) dataRowEditNew.IdCentroCosto = '';

    }

    async function cargarCombos(filtro) {

        //console.log("cargarCombos.filtros>", filtro);

        const { IdContrato, IdCompaniaMandante, IdCompaniaContratista, IdUnidadOrganizativa, FlgContratista } = filtro;

        let estadoSimple = listarEstadoSimple();
        setEstadoSimple(estadoSimple);

        if (!isNotEmpty(IdContrato)) return;

        setLoading(true);

        let param = { IdCliente, IdContrato, IdCompaniaMandante, IdCompaniaContratista };
        let promesas = [];

        promesas.push(obtenerCmbDivision({ ...param, IdDivision: '%' }));
        promesas.push(obtenerCmbSubContratista({ ...param }));

        promesas.push(listarTipoPosicion({ IdCliente,Activo:'S' }));
        //JDL->2022-07-15-> Lista de funciones superar los 100 registros, no debería ser un combo.
        //promesas.push(listarFuncion({ IdCliente, Contratista: isNotEmpty(FlgContratista) ? FlgContratista : "" }));
        promesas.push(obtenerMotivosCese({ IdCliente }));

        if (IdUnidadOrganizativa) {
            promesas.push(obtenerCmbCentroCosto({ ...param, IdUnidadOrganizativa, IdCentroCosto: '' }));
        }
        if (posicionDefault.activo) {
            promesas.push(obtenerPosicion({ IdCliente, IdPosicion: posicionDefault.IdPosicionContratista }))
        }

        await Promise.all(promesas)
            .then(resp => {
                //>console.log("cargarCombos|promesas|resp:",resp);
                setCmbDivision(resp[0]);
                setCmbSubContratista(resp[1]);
                setCmbTipoPosicion(resp[2]);
                //JDL->[2022-07-15]-setCmbFuncion(resp[3]);
                setMotivoCese(resp[3]);//4->3

                if (IdUnidadOrganizativa) {
                    setCmbCentroCosto(resp[4]);//5->4
                }

                if (posicionDefault.activo) {
                    //Se obtienen los datos de la posicion default: 
                    let tmp_posicion = IdUnidadOrganizativa ? resp[5] : resp[4];//6->5; 5->4

                    let {
                        IdFuncion, IdTipoPosicion,
                        Contratista, Fiscalizable, Confianza, PosicionPadre,
                        PersonaPosicionPadre

                    } = tmp_posicion;
                    setDataRowEditNew(prev => ({
                        ...prev,
                        IdPosicion: posicionDefault.IdPosicionContratista,
                        Posicion: posicionDefault.PosicionContratista,
                        IdFuncion, IdTipoPosicion,
                        Contratista, Fiscalizable, Confianza, PosicionPadre,
                        PersonaPosicionPadre
                    }));
                }

            }).finally(resp => {
                setLoading(false);
                setFiltroLocal({ ...filtro });
            });
    }

    const grabar = (e) => {

        //console.log("evento->grabar",e);
        let result = e.validationGroup.validate();
        // console.log("result", {result});
        console.log("result.validators", result.validators);
        console.log("result.brokenRules", result.brokenRules);
        if (result.brokenRules.length > 0) return;
        // console.log("result.isValid,", result.isValid);
        // //JDL.>2022-08-12:> Se activa motivoCeseSwitch para refrescar seccion de motivo cese..
        // console.log("motivoCeseSwitch->",motivoCeseSwitch);

        if (result.isValid) {
            if (dataRowEditNew.esNuevoRegistro) {
                agregarRegistro(dataRowEditNew);
            } else {
                actualizarRegistro(dataRowEditNew);
            }
        }
    }

    /*POPUP CONTRATO*********************************************************/
    const agregarContrato = (contrato) => {
        const { IdContrato,
            Contrato,
            FechaInicio,
            FechaFin,
            IdCompaniaMandante,
            CompaniaMandante,
            IdCompaniaContratista,
            CompaniaContratista } = contrato[0];

        setFechasContrato({ FechaInicioContrato: FechaInicio, FechaFinContrato: FechaFin })

        if (!dataRowEditNew.esNuevoRegistro) {
            if (IdContrato != dataRowEditNew.IdContrato) setEsBloqueado(false);
        }

        // console.log("agregarContrato|contrato[0]:",contrato[0]);
        let NuevaFechaInicio = dataRowEditNew.FechaInicio;


        if (Date.parse(new Date(FechaInicio)) > Date.parse(new Date())) {
            NuevaFechaInicio = FechaInicio;
        } else {
            NuevaFechaInicio = new Date();
        }

        setDataRowEditNew(prev => ({
            ...prev
            , IdContrato
            , Contrato
            , FechaInicio: NuevaFechaInicio
            , FechaFin
            , IdCompaniaMandante
            , CompaniaMandante
            , IdCompaniaContratista
            , CompaniaContratista
            , IdDivision: ''
            , IdUnidadOrganizativa: ''
            , UnidadOrganizativa: ''
        }));


        //Cargar combo dependen de contrato.
        if (dataRowEditNew.esNuevoRegistro) {
            cargarCombos(contrato[0]);
        }

        setFiltroLocal({ ...dataRowEditNew });
    };

    /*POPUP UNIDAD ORGANIZATIVA**********************************************/
    const selectUnidadOrganizativa = (dataPopup) => {
        const { IdUnidadOrganizativa, UnidadOrganizativa } = dataPopup[0];
        dataRowEditNew.IdUnidadOrganizativa = IdUnidadOrganizativa;
        dataRowEditNew.UnidadOrganizativa = UnidadOrganizativa;
        dataRowEditNew.IdCentroCosto = '';
        onObtenerCentroCosto(IdUnidadOrganizativa);
        setPopupVisibleUnidad(false);
    };

    const cargarCombosReadOnly = async () => {
        // console.log("cargarCombosReadOnly-call->", dataRowEditNew);

        if (!dataRowEditNew.esNuevoRegistro) {

            //console.log("cargarCombosReadOnly-condition->:::", dataRowEditNew.esNuevoRegistro);

            let estadoSimple = listarEstadoSimple();
            setEstadoSimple(estadoSimple);

            let { IdDivision, Division,
                IdCompaniaSubContratista, CompaniaSubContratista,
                IdPosicion, Posicion,
                IdTipoPosicion, TipoPosicion,
                IdFuncion, Funcion,
                IdMotivoCese, MotivoCese,
                IdCentroCosto, CentroCosto,
                IdUnidadOrganizativa
            } = dataRowEditNew;

            //console.log("cargarCombosReadOnly-dataRowEditNew.>",dataRowEditNew );

            setCmbDivision([{ IdDivision, Division }]);
            setCmbSubContratista([{ IdCompaniaSubContratista, CompaniaSubContratista }]);
            setCmbTipoPosicion([{ IdTipoPosicion, TipoPosicion }]);
            setCmbFuncion([{ IdFuncion, Funcion }]);//Función->
            setMotivoCese([{ IdMotivoCese, MotivoCese }]);
            if (IdUnidadOrganizativa) {
                setCmbCentroCosto([{ IdCentroCosto, CentroCosto }]);
            }

            if (modoEdicion) {
                //Si es editar se carga la lista de motivos de cese: 
                await obtenerMotivosCese({ IdCliente })
                    .then(resp => { setMotivoCese(resp) });
            }

        }
    }


    useEffect(() => {
        cargarCombosReadOnly();
    }, [])


    /*POPPUP COMPAÑIA CONTRATISTA**********************************************/

    const eventClickSearchContract = (e) => {
        // console.log("eventClickSearchContract|e:",e);
        //Necesito Compania Mandante y Contratista.
        const { IdCompaniaContratista } = dataRowEditNew;
        // Deben existir
        if (!isNotEmpty(IdCompaniaContratista)) {

            handleInfoMessages(intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONTRACT.COMPANY.MSGERROR" }));

            /*notify(
              intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONTRACT.COMPANY.MSGERROR" })
              , 'error', 3000);*/
        } else {
            //Se limpia compañia mandante: 
            setFiltroLocal(prev => ({
                ...prev,
                IdCompaniaMandante: '',
                CompaniaMandante: '',
                Activo: "S"
            }));
            setPopupVisibleContrato(true);
        }
    }

    const selectCompaniaContratista = dataPopup => {
        const { IdCompania, Compania } = dataPopup[0];
        if (isNotEmpty(IdCompania)) {
            setDataRowEditNew(prev => ({
                ...prev,
                IdCompaniaContratista: IdCompania,
                CompaniaContratista: Compania
            }))

            //La busqueda de contrato solo es por compañia contratista, no mandante
            setFiltroLocal(prev => ({
                ...prev,
                IdCompaniaContratista: IdCompania,
                CompaniaContratista: Compania,
                IdCompaniaMandante: '',
                CompaniaMandante: ''
            }));
            //props.dataRowEditNew.IdCompaniaContratista = IdCompania;
            //props.dataRowEditNew.CompaniaContratista = Compania;
        }
        setPopupVisibleCompania(false);
    }

    /*POPPUP POSICION **********************************************/

    const agregarPopupPosicion = (posiciones) => {
        const {
            IdDivision, IdPosicion,
            Posicion, IdFuncion, IdTipoPosicion,
            Contratista, Fiscalizable, Confianza, PosicionPadre,
            PersonaPosicionPadre } = posiciones[0];

        setDataRowEditNew(prev => ({
            ...prev
            , IdPosicion
            , Posicion
            , IdFuncion
            , IdTipoPosicion
            , Contratista
            , Fiscalizable
            , Confianza
            , PosicionPadre
            , PersonaPosicionPadre
        }));
    }

    return {
        classesEncabezado,
        cmbDivision,
        cmbCentroCosto,
        cmbSubContratista,
        cmbFuncion,
        cmbTipoPosicion,
        estadoSimple,
        motivoCese,
        filtroLocal,
        popupVisibleCompania,
        popupVisiblePosicion,
        fechasContrato,
        setFechasContrato,
        grabar,
        setPopupVisibleCompania,
        eventClickSearchContract,
        setPopupVisibleUnidad,
        setPopupVisiblePosicion,
        setFiltroLocal,
        agregarContrato,
        popupVisibleContrato,
        setPopupVisibleContrato,
        popupVisibleUnidad,
        selectUnidadOrganizativa,
        selectCompaniaContratista,
        agregarPopupPosicion,
    };
};

export default usePersonaContratoEdit;

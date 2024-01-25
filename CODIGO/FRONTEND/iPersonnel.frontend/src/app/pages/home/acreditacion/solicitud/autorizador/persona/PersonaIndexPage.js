import React, { Fragment, useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { Portlet } from "../../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado, useStylesTab } from "../../../../../../store/config/Styles";

import PersonaEditPage from './PersonaEditPage';
import { storeListar as loadUrl, obtenerbyautorizador as obtenerSolicitud, eliminar as eliminarSolicitud } from "../../../../../../api/acreditacion/solicitud.api"
import { obtener as obtenerDetalle, downloadFile as downloadFileDetalle, obtenerbyautorizadorTodos } from "../../../../../../api/acreditacion/solicitudDetalle.api"
import { obtenerTodos as obtenerTodosPais } from "../../../../../../api/sistema/pais.api"
import { listarSexoSimple, listarTipoDocumento, listarTipoSangre, listarEstadoCivil, isNotEmpty, convertyyyyMMddToDate, isDate } from "../../../../../../../_metronic";

import "./styles.css";

const PersonaIndexPage = (props) => {

    const { intl, setLoading, dataMenu, viewTextoUbigeo } = props;
    const classesEncabezado = useStylesEncabezado();
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classes = useStylesTab();
    const [modoEdicion, setModoEdicion] = useState(false);
    const [verEdit, setVerEdit] = useState(false);
    //-------------------------
    const initParameters = {
        IdDivision: perfil.IdDivision,
        Division: perfil.Division,
        IdCompania: '',
        Asunto: ''
    };


    const [dataRowEditNew, setDataRowEditNew] = useState({
        esNuevoRegistro: true,
        ...initParameters
    });

    const [permisosDatosPersona, setPermisoDatosPersona] = useState({
        IDTIPODOCUMENTO: false,
        DOCUMENTO: false,
        APELLIDO: false,
        NOMBRE: false,
        DIRECCION: false,
        IDUBIGEONACIMIENTO: false,
        IDUBIGEORESIDENCIA: false,
        FECHANACIMIENTO: false,
        SEXO: false,
        IDESTADOCIVIL: false,
        TELEFONOMOVIL: false,
        TELEFONOFIJO: false,
        EMAIL: false,
        IDTIPOSANGRE: false,
        ALERGIA: false,
        DISCAPACIDAD: false,
        EMERGENCIANOMBRE: false,
        EMERGENCIATELEFONO: false,
        IDPAISLICENCIACONDUCIR: false,
        IDLICENCIACONDUCIR: false,
        NUMEROLICENCIACONDUCIR: false,
        UBIGEONACIMIENTO: false,
        UBIGEORESIDENCIA: false,
    });

    ///------------------------------------------------
    //Combos :: -----------------------------------------------------------------
    const [tipoDocumentos, setTipoDocumentos] = useState([]);
    const [tipoSangres, setTipoSangres] = useState([]);
    const [estadoCiviles, setEstadoCiviles] = useState([]);
    const [sexoSimple, setSexoSimple] = useState([]);
    const [paises, setPaises] = useState([]);
    const [ubigeos, setUbigeos] = useState([]);

    //Perfil y Datos de editar:
    const [requisitos, setRequisitos] = useState([]);
    //---------------------------------------------------------------------------

    const [personalDataRules, setPersonalDataRules] = useState([]);
    const [optRequisito, setOptRequisito] = useState([]);
    const [flLoadPersonalDataRules, setFlLoadPersonalDataRules] = useState(false);


    useEffect(() => {

        cargarCombos();
        setTimeout(() => {
            seleccionarRegistro(props.selected);
        }, 1000);

    }, []);

    const seleccionarRegistro = async (data) => {

        setLoading(true);

        let tempDataRow = {};

        await Promise.all([
            obtenerSolicitud({ IdDivision: perfil.IdDivision, IdSolicitud: data.IdSolicitud }),
            obtenerbyautorizadorTodos({ IdSolicitud: data.IdSolicitud })
        ]).then(resp => {

            tempDataRow = resp[0];
            tempDataRow.esNuevoRegistro = false;
            tempDataRow.IdDivision = perfil.IdDivision;
            tempDataRow.Division = perfil.Division;

            let [requisitos, datosEvaluar, detalleDatosEvaluar, datosEntidad] = resp[1];
            //============================================================
            //CARGANDO REQUISITOS Y DATOS A EVALUAR:
            let arrayItems = [];
            let tmpDatosEvaluar = {};
            let contItems = 0;

            ////console.log("requisitos|requisitos",requisitos);

            for (let i = 0; i < requisitos.length; i++) {
                arrayItems.push({
                    Value: requisitos[i].IdRequisito,
                    Text: requisitos[i].Requisito,
                    AdjuntarArchivo: 'N',
                    Tipo: 'G',
                    ValorDefecto: "",
                    IdRequisito: '',
                    NombreArchivo: '',
                    Index: `R|${requisitos[i].IdRequisito}|${requisitos[i].IdRequisito}`
                });

                //Agregando datos evaluar:
                contItems = 0;
                for (let j = 0; j < datosEvaluar.length; j++) {
                    //console.log("datosEvaluar[j]", datosEvaluar[j]);
                    if (requisitos[i].IdRequisito === datosEvaluar[j].IdRequisito) {

                        let item = {
                            Value: datosEvaluar[j].IdDatoEvaluar,
                            Text: datosEvaluar[j].DatoEvaluar,
                            AdjuntarArchivo: datosEvaluar[j].DatoEvaluar, //'N',//Autorizador no adjunta.
                            Tipo: datosEvaluar[j].Tipo,
                            ValorDefecto: datosEvaluar[j].ValorDefecto,
                            IdRequisito: datosEvaluar[j].IdRequisito,
                            NombreArchivo: datosEvaluar[j].NombreArchivo,
                            Index: `D|${datosEvaluar[j].IdRequisito}|${datosEvaluar[j].IdDatoEvaluar}`,

                            Observacion: datosEvaluar[j].Observacion,
                            EstadoAprobacion: datosEvaluar[j].EstadoAprobacion.replace(' ', ''),
                            Aprobar: datosEvaluar[j].Aprobar,
                            TipoRequisito: datosEvaluar[j].TipoRequisito,

                            IdDatoEvaluar: datosEvaluar[j].IdDatoEvaluar,
                            UsuarioAprobacion: datosEvaluar[j].UsuarioAprobacion,
                            FechaAprobacion: datosEvaluar[j].FechaAprobacion,
                            HoraAprobacion: datosEvaluar[j].HoraAprobacion,
                            DatoOpcional: datosEvaluar[j].DatoOpcional,
                            CheckDatoOpcional: datosEvaluar[j].CheckDatoOpcional
                        };

                        item.CheckDatoOpcional = isNotEmpty(item.CheckDatoOpcional) ? item.CheckDatoOpcional.trim() : "N";

                        if (item.Tipo === 'F' && isNotEmpty(item.ValorDefecto)) {
                            // //console.log("=================================  ES FECHA ");

                            // //console.log("");
                            let fec = convertyyyyMMddToDate(item.ValorDefecto);
                            if (isDate(fec)) {
                                ////console.log("=================================  ES FECHA VALIDA ");
                                item.ValorDefecto = fec;
                            } else {
                                item.ValorDefecto = "";
                            }
                        }

                        if (item.Tipo === "A") {
                            item.ValorDefecto = `[ARCHIVO][${item.NombreArchivo}]`;
                        }

                        ////console.log("=================================  FIN ");
                        //Agregando value:
                        tmpDatosEvaluar[item.Index] = item.ValorDefecto;
                        tmpDatosEvaluar[`${item.Index}|OBS`] = item.Observacion;//Agregando Observacion
                        tmpDatosEvaluar[`${item.Index}|CHECK`] = item.EstadoAprobacion;//Agregando EstadoAprobacion
                        tmpDatosEvaluar[`${item.Index}_Check`] = item.CheckDatoOpcional === "S";

                        if (item.Tipo === 'L') {
                            //Agregando detalle: 
                            let arrayDetalle = detalleDatosEvaluar
                                .filter(l => l.IdDatoEvaluar === item.Value)
                                .map(m => ({ Dato: m.Dato, IdDato: m.IdDato }));

                            item.Lista = arrayDetalle;
                        }
                        arrayItems.push(item);
                        contItems++;
                    }
                }

                // if (contItems % 2 !== 0) {
                //     arrayItems.push({
                //         Value: '',
                //         Text: '',
                //         AdjuntarArchivo: 'N',//Autorizador no adjunta.
                //         Tipo: 'B',
                //         ValorDefecto: '',
                //         IdRequisito: '',
                //         NombreArchivo: '',
                //         Index: `R|${requisitos[i].IdRequisito}|${contItems}|${"VACIO"}`
                //     });
                // }

            }
            //============================================================
            //Entidades: 
            let permisos = permisosDatosPersona;

            for (let i = 0; i < datosEntidad.length; i++) {
                let propiedad = datosEntidad[i].IdDato.toUpperCase();
                let propiedadId = `ID${datosEntidad[i].IdDato.toUpperCase()}`;
                if (permisos.hasOwnProperty(propiedad)) {
                    permisos[propiedad] = true;
                }
                if (permisos.hasOwnProperty(propiedadId)) {
                    permisos[propiedadId] = true;
                }
            }

            // //console.log("seleccionarRegistroºtempDataRow:", tempDataRow);
            // //console.log("seleccionarRegistroºtmpDatosEvaluar:", tmpDatosEvaluar);

            //========================================
            setDataRowEditNew({ ...tempDataRow, ...tmpDatosEvaluar });
            setPermisoDatosPersona(permisos);
            //console.log("arrayItems:", arrayItems);
            setOptRequisito(arrayItems);
        }).catch(err => {

        }).finally(resp => {
            setVerEdit(true);
            setLoading(false);
            setModoEdicion(true);
        });

    }

    async function cargarCombos() {
        setLoading(true);
        let promesas = [];
        promesas.push(listarTipoDocumento({ IdPais: perfil.IdPais }));
        promesas.push(listarTipoSangre());
        promesas.push(listarEstadoCivil());
        promesas.push(listarSexoSimple());
        promesas.push(obtenerTodosPais());

        let cargaCorrecta = false;
        await Promise.all(promesas)
            .then(datos => {
                setTipoDocumentos(datos[0]);
                setTipoSangres(datos[1]);
                setEstadoCiviles(datos[2]);
                setSexoSimple(datos[3]);
                setPaises(datos[4]);
                setUbigeos([]);

            })
            .catch(err => {

            })
            .finally(x => {
                setLoading(false);
            });
    }

    return (

        <Fragment>

            <div className="row">
                <div className="col-md-12">
                    <Portlet className={classesEncabezado.border}>
                        <div className={classes.root}>
                            {verEdit ? (
                                < PersonaEditPage
                                    dataRowEditNew={dataRowEditNew}
                                    permisosDatosPersona={permisosDatosPersona}
                                    optRequisito={optRequisito}
                                    setOptRequisito={setOptRequisito}
                                    modoEdicion={modoEdicion}
                                    personalDataRules={personalDataRules}
                                    setFlLoadPersonalDataRules={setFlLoadPersonalDataRules}
                                    flLoadPersonalDataRules={flLoadPersonalDataRules}
                                    ubigeos={ubigeos}
                                    tipoDocumentos={tipoDocumentos}
                                    tipoSangres={tipoSangres}
                                    estadoCiviles={estadoCiviles}
                                    sexoSimple={sexoSimple}
                                    paises={paises}
                                    cancelarEdicion={props.cancelarEdicion}
                                    cargarDatos={verEdit}
                                    colorRojo={props.colorRojo}
                                    colorVerde={props.colorVerde}
                                    viewTextoUbigeo={viewTextoUbigeo}
                                />

                            ) : null}
                        </div>

                    </Portlet>
                </div>
            </div>

        </Fragment>

    );
};

export default injectIntl(WithLoandingPanel(PersonaIndexPage));

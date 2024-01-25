import React, { Fragment, useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { Portlet } from "../../../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado, useStylesTab } from "../../../../../../../store/config/Styles";

import DetalleEditPage from './DetalleEditPage';
//import VisitaEditPage from './VisitaEditPage';
import { obtener as obtenerVisita } from "../../../../../../../api/acreditacion/visita.api"
//import { downloadFile } from "../../../../../../../api/acreditacion/requisitoSolicitud.api"
import "./styles.css";
import PdfViewer from '../../../../../../../partials/content/Acreditacion/PdfViewer/PdfViewer';
import { convertyyyyMMddToDate, listarSexoSimple, listarTipoDocumento, PANTALLAS_ACREDITACION as VER, } from "../../../../../../../../_metronic";
import { downloadFile } from '../../../../../../../api/acreditacion/visitaPersonaDetalle.api';
//import AppBar from "@material-ui/core/AppBar";
//import Toolbar from "@material-ui/core/Toolbar";
//import Typography from "@material-ui/core/Typography";
import notify from "devextreme/ui/notify";



const DetalleIndexPage = (props) => {

    const { intl, setLoading, dataMenu } = props;
    const classesEncabezado = useStylesEncabezado();
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classes = useStylesTab();
    const [modoEdicion, setModoEdicion] = useState(false);
    const [verEdit, setVerEdit] = useState(true);

    //Popup view pdf file  --------------------------------------
    const estructuraArchivo = { IdSolicitud: 0, fileType: '', fileBase64: '', fileName: '', Titulo: '', Index: '' };
    const [popupVisible, setPopupVisible] = useState(false);
    const [fileView, setFileView] = useState(estructuraArchivo);
    const [verComponente, setVerComponente] = useState(VER.TARJETA);
    const [visitas, setVisitas] = useState([]);

    const initParameters = {
        IdDivision: perfil.IdDivision,
        Division: perfil.Division,
        IdCompaniaContratista: perfil.IdCompania,
        DatoEvaluar: '',
        Requisito: '',
        AdjuntarArchivo: '',
    };


    const [dataRowEditNew, setDataRowEditNew] = useState({
        esNuevoRegistro: false, IdSolicitud: 1, Observacion: "", EstadoAprobacion: "P", RechazoIndisciplina: "", DescripcionRechazo: "",
        ...initParameters
    });


    const [personalDataRules, setPersonalDataRules] = useState([]);
    const [optRequisito, setOptRequisito] = useState([]);
    //const [flLoadPersonalDataRules, setFlLoadPersonalDataRules] = useState(false);
    const [personasRequisitos, setpersonasRequisitos] = useState([]);

    const [centrosCostos, setCentrosCostos] = useState([]);
    const [unidadesOrganizativas, setUnidadesOrganizativas] = useState([]);
    const [perfilesAcreditacion, setPerfilesAcreditacion] = useState([]);
    const [companias, setCompanias] = useState([]);
    const [sexoSimple, setSexoSimple] = useState([]);
    const [tipoDocumentos, setTipoDocumentos] = useState([]);

    useEffect(() => {
        cargarCombo();
        setTimeout(() => {
            // console.log("step 3-Index Visita->", props.selected);
            seleccionarRegistro(props.selected);
        }, 500);

    }, []);

    const cargarCombo = () => {
        //TipoDocumento
        let tipoDocu = [];
        listarTipoDocumento({ IdPais: perfil.IdPais }).then(result => {
            result.map(d => {
                tipoDocu.push({ IdTipoDocumento: d.IdTipoDocumento, TipoDocumento: d.Alias });
            });
            setTipoDocumentos(tipoDocu);
        });

    }

    const seleccionarRegistro = async (data) => {
        //console.log("seleccionarRegistro", { data });
        setLoading(true);    

        let datos = await obtenerVisita({ IdSolcitud: data.IdSolicitud, idSolicitud: data.IdSolicitud, })
            .then(resp => (resp))
            .catch(err => ([]));

            //console.log("datos>>>>>", datos);
        if (!!datos && datos.length > 0) {

            let datosVisita = datos[0][0];
            let datosPersonas = datos[1];
            let datosRequisitos = datos[2];
            let datosDatosEvaluar = datos[3];
            let datosPersonaDatosEvaluar = datos[4];

            // console.log("datosVisita", datosVisita);
            // console.log("datosPersonas", datosPersonas);

            setCentrosCostos([{ IdCentroCosto: datosVisita.IdCentroCosto, CentroCosto: datosVisita.CentroCosto }]);
            setUnidadesOrganizativas([{ UnidadOrganizativa: datosVisita.UnidadOrganizativa, IdUnidadOrganizativa: datosVisita.IdUnidadOrganizativa }]);
            setPerfilesAcreditacion([{ IdPerfil: datosVisita.IdPerfil, Perfil: datosVisita.Perfil }]);
            setCompanias([{ IdCompania: datosVisita.IdCompaniaMandante, Compania: datosVisita.CompaniaMandante }]);
            setSexoSimple(listarSexoSimple());
            //setTipoDocumentos([{ IdTipoDocumento: datosPersonas[0].IdTipoDocumento, TipoDocumento: datosPersonas[0].TipoDocumento }]);
            setDataRowEditNew(prev => ({ ...prev, ...datosVisita, IdCompania: datosVisita.IdCompaniaMandante, NombreCompleto: datosVisita.PersonaVisitada, esNuevoRegistro: false }));
            setVisitas(datosPersonas);

            let tmpRequisitos = [];
            let tmpRequisitosPersona = [];

            for (let i = 0; i < datosRequisitos.length; i++) {
                tmpRequisitos.push({
                    Value: datosRequisitos[i].IdRequisito,
                    Text: datosRequisitos[i].Requisito,
                    AdjuntarArchivo: 'N',
                    Tipo: 'G',
                    ValorDefecto: "",
                    IdRequisito: '',
                    NombreArchivo: '',
                    Index: `R|${datosRequisitos[i].IdRequisito}|${datosRequisitos[i].IdRequisito}`,
                    Automatico: false,
                    ViewAcreditacion: false
                });
            }

            for (let i = 0; i < datosDatosEvaluar.length; i++) {
                tmpRequisitos.push({
                    Value: datosDatosEvaluar[i].IdDatoEvaluar,
                    Text: datosDatosEvaluar[i].DatoEvaluar,
                    AdjuntarArchivo: datosDatosEvaluar[i].AdjuntarArchivo,
                    Tipo: datosDatosEvaluar[i].Tipo,
                    ValorDefecto: "",
                    IdRequisito: datosDatosEvaluar[i].IdRequisito,
                    NombreArchivo: '',
                    Index: `R|${datosDatosEvaluar[i].IdRequisito}|${datosDatosEvaluar[i].IdDatoEvaluar}`,
                    Automatico: false,
                    ViewAcreditacion: false
                });
            }



            for (let i = 0; i < datosPersonas.length; i++) {
                let reqPersonas = datosPersonaDatosEvaluar.filter(x => x.IdSecuencial === datosPersonas[i].IdSecuencial);

                if (reqPersonas.length > 0) {
                    tmpRequisitosPersona.push({
                        Documento: datosPersonas[i].Documento,
                        TipoDocumento: datosPersonas[i].TipoDocumento,
                        Requisitos: reqPersonas.map(x => ({
                            IdSolicitud: x.IdSolicitud,
                            IdSecuencial: x.IdSecuencial,
                            Value: x.IdDatoEvaluar,
                            Text: x.DatoEvaluar,
                            AdjuntarArchivo: x.AdjuntarArchivo,
                            Tipo: x.Tipo,
                            [`D|${x.IdRequisito}|${x.IdDatoEvaluar}|${datosPersonas[i].Documento}`]: (x.Tipo === "F" ? (convertyyyyMMddToDate(x.Valor)) :
                                (x.Tipo === "L") ? (x.ValorDescrip) : x.Valor),
                            ValorDefecto: "",
                            IdRequisito: x.IdRequisito,
                            NombreArchivo: x.NombreArchivo,
                            Index: `D|${x.IdRequisito}|${x.IdDatoEvaluar}|${datosPersonas[i].Documento}`,
                            EstadoAprobacion: x.EstadoAprobacion,
                            Observacion: x.Observacion,
                            Automatico: false,
                            ViewAcreditacion: false,
                            UsuarioAprobacion: x.UsuarioAprobacion,
                            FechaAprobacion: x.FechaAprobacion,
                            HoraAprobacion: x.HoraAprobacion
                        })),
                    });
                }
            }

            //  console.log("Personas.format>>>", tmpRequisitosPersona);
            //console.log({ tmpRequisitos, tmpRequisitosPersona });

            setOptRequisito(tmpRequisitos);
            setpersonasRequisitos(tmpRequisitosPersona);
            //console.log({ tmpRequisitosPersona });
        }

        //console.log({ datos });
        setLoading(false);

        setVerComponente(VER.EDITAR);
        setModoEdicion(false);
    }

    const eventViewPdf = async (item) => {
        //console.log("implementacion")
        setLoading(true);
        await downloadFile({
            IdSolicitud: item.IdSolicitud,
            IdSecuencial: item.IdSecuencial,
            IdDatoEvaluar: item.Value
        })
            .then(res => {
                setFileView({
                    fileType: "",
                    fileBase64: res.file,
                    fileName: res.name,
                    Titulo: item.Text,
                    Index: item.Index
                });

                setTimeout(() => {
                    setLoading(false);
                    setPopupVisible(true);
                }, 200);
            })
            .catch(err => {
                let error = err.response.data.responseException.exceptionMessage || "";
                if (error !== "") {
                    const type = "error";
                    notify(error, type, 3000);
                }
                setLoading(false);
            })
            .finally(resp => {
                //setLoading(false);
            });

    }

    const descargarArchivo = (id, file, name) => {
        if (id !== "") {
            let a = document.createElement("a");
            a.href = file;
            a.download = name;
            a.click();
        }
    }

    return (

        <Fragment>
            <div className="row">
                <div className="col-md-12">
                    <Portlet className={classesEncabezado.border}>
                        <div className={classes.root}>
                            {/*  {verComponente  == VER.TARJETA ? ( */}
                            <DetalleEditPage
                                dataRowEditNew={dataRowEditNew}
                                setDataRowEditNew={setDataRowEditNew}
                                modoEdicion={modoEdicion}
                                //setLoading={setLoading}
                                //intl={intl}

                                centrosCostos={centrosCostos}
                                unidadesOrganizativas={unidadesOrganizativas}
                                perfilesAcreditacion={perfilesAcreditacion}
                                companias={companias}
                                tipoDocumentos={tipoDocumentos}
                                sexoSimple={sexoSimple}
                                personDataValidationRules={personalDataRules}

                                configuracion={{ Valor1: 18 }}
                                configuracionPeso={{ Valor1: 8 }}
                                visitas={visitas}
                                setVisitas={setVisitas}
                                requisitos={optRequisito}
                                personasRequisitos={personasRequisitos}
                                setpersonasRequisitos={setpersonasRequisitos}
                                cargarDatos={verEdit}
                                eventRetornar={props.cancelarEdicion}
                                eventViewPdf={eventViewPdf}

                            /* grabarSolicitudAvance={grabarSolicitudAvance}
                      cancelarEdicion={cancelarEdicion}
                      eventRetornar={cancelarEdicion} */
                            /* loadDataByPerfil={loadDataByPerfil}
                                loadCentroCostoByUnidadOrganizativa={loadCentroCostoByUnidadOrganizativa}
                                loadTipoDocumentoByCompany={loadTipoDocumentoByCompany}
                                */

                            />

                            {/*   ) : null} */}
                        </div>

                    </Portlet>
                </div>
            </div>

            <PdfViewer
                showPopup={{ isVisiblePopUp: popupVisible, setisVisiblePopUp: setPopupVisible }}
                fileType={fileView.fileType}
                fileBase64={fileView.fileBase64}
                fileName={fileView.fileName}
                Titulo={fileView.Titulo}
                Index={fileView.Index}
                eventoDescarga={descargarArchivo}
            />

        </Fragment>



    );
};

export default injectIntl(WithLoandingPanel(DetalleIndexPage));

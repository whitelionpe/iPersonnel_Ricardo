import React, { Fragment, useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { Portlet } from "../../../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../../../partials/content/withLoandingPanel";
import { useStylesEncabezado, useStylesTab } from "../../../../../../../store/config/Styles";

import DetalleEditPage from './DetalleEditPage';
import { obtenerSolicitudActualizacionPersona } from "../../../../../../../api/acreditacion/solicitud.api"
import { downloadFile } from "../../../../../../../api/acreditacion/requisitoSolicitudVehiculo.api"
import "./styles.css";
import PdfViewer from '../../../../../../../partials/content/Acreditacion/PdfViewer/PdfViewer';

// import {
//     obtener
// } from "../../../../../../../api/administracion/contrato.api";
// import {
//     servicePersona
// } from "../../../../../../../api/administracion/persona.api";
// import {
//     obtener as obtenerDatosEvaluar
// } from "../../../../../../../api/acreditacion/datosEvaluar.api";

const DetalleIndexPage = (props) => {

    const { intl, setLoading, dataMenu } = props;
    const classesEncabezado = useStylesEncabezado();
    const perfil = useSelector(state => state.perfil.perfilActual);
    const classes = useStylesTab();
    const [modoEdicion, setModoEdicion] = useState(false);
    const [verEdit, setVerEdit] = useState(false);
    //Popup view pdf file  --------------------------------------
    const estructuraArchivo = { IdSolicitud: 0, fileType: '', fileBase64: '', fileName: '', Titulo: '', Index: '' };
    const [popupVisible, setPopupVisible] = useState(false);
    const [fileView, setFileView] = useState(estructuraArchivo);

    //-------------------------
    const initParameters = {
        IdDivision: perfil.IdDivision,
        Division: perfil.Division,
        IdCompaniaContratista: perfil.IdCompania,
        DatoEvaluar: '',
        Requisito: '',
        AdjuntarArchivo: '',
    };


    const [dataRowEditNew, setDataRowEditNew] = useState({
        esNuevoRegistro: true,
        ...initParameters
    });


    const [personalDataRules, setPersonalDataRules] = useState([]);
    const [optRequisito, setOptRequisito] = useState([]);
    const [flLoadPersonalDataRules, setFlLoadPersonalDataRules] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            seleccionarRegistro(props.selected);
        }, 1000);

    }, []);


    const seleccionarRegistro = async (data) => {

        setLoading(true);

        let tempDataRow = {};

        await Promise.all([
            obtenerSolicitudActualizacionPersona({ IdSolicitud: data.IdSolicitud })
        ]).then(resp => {

            let firstRegister = resp[0];
            tempDataRow = firstRegister;
            tempDataRow.esNuevoRegistro = false;
            tempDataRow.Division = perfil.Division;
            setDataRowEditNew({ ...tempDataRow });

        }).catch(err => {

        }).finally(resp => {
            setVerEdit(true);
            setLoading(false);
            setModoEdicion(true);
        });
    }


    const eventViewPdf = async (data) => {
        console.log("eventViewPdf|data:", data);
        let { IdSolicitud, DatoEvaluar } = data;

        if (IdSolicitud > 0 && fileView.IdSolicitud != IdSolicitud) {
            setLoading(true);
            await downloadFile({ IdSolicitud })
                .then(resp => {
                    console.log("eventViewPdf|resp:", resp);
                    setFileView({
                        fileType: '',
                        fileBase64: resp.file,
                        fileName: resp.name,
                        Titulo: DatoEvaluar,
                        Index: resp.IdDatoEvaluar,
                        IdSolicitud
                    });
                    setPopupVisible(true);
                })
                .finally(resp => {
                    setLoading(false);
                });
        } else {
            setPopupVisible(true);
        }
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
                            {/* verEdit */}
                            {verEdit ? (
                                < DetalleEditPage
                                    dataRowEditNew={dataRowEditNew}
                                    optRequisito={optRequisito}
                                    setOptRequisito={setOptRequisito}
                                    modoEdicion={modoEdicion}
                                    personalDataRules={personalDataRules}
                                    setFlLoadPersonalDataRules={setFlLoadPersonalDataRules}
                                    flLoadPersonalDataRules={flLoadPersonalDataRules}
                                    cancelarEdicion={props.cancelarEdicion}
                                    cargarDatos={verEdit}
                                    colorRojo={props.colorRojo}
                                    colorVerde={props.colorVerde}
                                    eventViewPdf={eventViewPdf}
                                />

                            ) : null}
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

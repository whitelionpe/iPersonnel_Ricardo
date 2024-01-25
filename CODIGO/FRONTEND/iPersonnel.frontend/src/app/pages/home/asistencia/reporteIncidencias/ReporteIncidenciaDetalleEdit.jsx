import React, { useState } from 'react';
import { Button, Form, Popup } from 'devextreme-react';
import { GroupItem, Item } from 'devextreme-react/form';
import { listarEstado } from "../../../../../_metronic";
import FileUploader from '../../../../partials/content/FileUploader';
import { obtener as obtenerJusti } from "../../../../api/asistencia/justificacion.api";
import { useSelector } from "react-redux";

const ReporteIncidenciaDetalleEdit = ({
    showPopup,
    intl,
    dataRowEditNew, 
    modoEdicion = true,
    incidentList = [],
    justificationList = [],
    height = "450px",
    width = "750px",
    setLoading, 
    saveJustificationsByPeople,
    maxSizeFile,
}) => {

    const [justificationData, setJustificationData] = useState({ IdPersona: 0, Fecha: '', NombreCompleto: '', Posicion: '' });
    const perfil = useSelector(state => state.perfil.perfilActual);
    const [dayCompleteReadOnly, setDayCompleteReadOnly] = useState(false);
    const [isObservationRequired, setIsObservationRequired] = useState(false);
    const [isCHE, setIsCHE] = useState(true);
    const estado = listarEstado();

    const aceptar = (e) => {

        let result = e.validationGroup.validate();

        if (!result.isValid) {
            return;
        }
        document.getElementById("btnUploadFile").click();

        let { CompensarHEPorPagar, CompensarHorasExtras,
            DiaCompleto, IdJustificacion, Observacion,
            FileBase64, RequiereAutorizacion } = justificationData;

        let { IdCompania } = dataRowEditNew; 

        let datosPersonaIncidencia = incidentList.reduce((aPersonas, item) => { 
            let { IdPersona, FechaAsistencia, IdIncidencia } = item;
            let itemPersona = aPersonas.find(x => x.IdPersona === IdPersona);

            if (!itemPersona) {
                aPersonas.push({ IdPersona, Fechas: FechaAsistencia, IdIncidencia })
            } else {
                itemPersona.Fechas = `${itemPersona.Fechas},${FechaAsistencia}`;
            }
            return aPersonas;
        }, []);

        let parametros = {
            IdCompania,
            CompensarHEPorPagar,
            CompensarHorasExtras,
            DiaCompleto,
            RequiereAutorizacion,
            IdJustificacion,
            Observacion,
            FileBase64,
            Personas: JSON.stringify(datosPersonaIncidencia)
        }

        //console.log("Se envia : ", { parametros });

        saveJustificationsByPeople(parametros);
        //agregarPersonaJustificacion(dataRowEditNew);
        /*
        IdJustificacion
        CompensarHorasExtras
        CompensarHEPorPagar
        DiaCompleto
        ***********************************
        CompensarHEPorPagar: "S"
        CompensarHorasExtras: "S"
        DiaCompleto: "S"
        FechaFin: Tue Jul 26 2022 00:00:00 GMT-0500 (hora estándar de Perú) {}
        FechaInicio: Fri Jul 01 2022 00:00:00 GMT-0500 (hora estándar de Perú) {}
        IdCompania: "20256307007"
        IdCompanias: ""
        IdJustificacion: "JS01"
        Observacion: "aaaaaaaaaaaaaaaa"
        RequiereAutorizacion: "S"
        esNuevoRegistro: true
        
        */


    }

    const onFileUploader = (data) => {
        const { file, fileName, fileDate } = data;
        //console.log("onFileUploader", { data });
        /* setJustificationData(prev => ({
             ...prev,
             FileBase64: file,
             NombreArchivo: fileName,
             FechaArchivo: fileDate
         }));*/
        justificationData.FileBase64 = file;
        justificationData.NombreArchivo = fileName;
        justificationData.FechaArchivo = fileDate;
    }


    const obtenerAsistenciaJustificacion = async (data) => {
        //console.log("obtenerAsistenciaJustificacion", { data });

        setLoading(true);
        await obtenerJusti({
            IdCliente: perfil.IdCliente,
            IdCompania: dataRowEditNew.IdCompania,
            IdJustificacion: data,
        }).then(data => {
            //console.log("obtenerAsistenciaJustificacion:::.data", data);
            const {
                AplicaPorDia,
                AplicaPorHora,
                RequiereObservacion,
                RequiereAutorizacion } = data;

            /*setJustificationData(prev => ({
                ...prev,
                DiaCompleto: AplicaPorDia,
                RequiereAutorizacion: RequiereAutorizacion
            }));*/

            justificationData.DiaCompleto = AplicaPorDia;
            justificationData.RequiereAutorizacion = RequiereAutorizacion;
            setDayCompleteReadOnly(AplicaPorDia === 'S' && AplicaPorHora === 'S' ? false : true);
            setIsObservationRequired(RequiereObservacion === 'S' ? true : false);

        }).finally(() => { setLoading(false) });


    }


    return (
        <Popup
            visible={showPopup.isVisiblePopUp}
            dragEnabled={false}
            closeOnOutsideClick={false}
            showTitle={true}
            height={height}
            width={width}
            title={(intl.formatMessage({ id: "ASISTENCIA.REPORT.INCIDENCIAS.JUSTIFICATION.TITLE" }).toUpperCase())}
            onHiding={() => showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp)}
        >


            <div className="row" >
                <div className='col-12' style={{ textAlign: "right" }}>
                    <Button
                        icon="fa fa-save"
                        type="default"
                        hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                        useSubmitBehavior={true}
                        validationGroup="FormJustificacion"
                        onClick={aceptar}
                    />
                </div>
            </div>

            <div className="row" >
                <div className='col-12'>
                    {'\u00A0'}
                </div>
            </div>

            <Form validationGroup="FormJustificacion" formData={justificationData} >
                <GroupItem itemType="group" colCount={2} >
                    <Item
                        dataField="IdJustificacion"
                        label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION" }) }}
                        editorType="dxSelectBox"
                        isRequired={modoEdicion}
                        editorOptions={{
                            items: justificationList,
                            valueExpr: "IdJustificacion",
                            displayExpr: "Justificacion",
                            onValueChanged: (e) => {
                                //console.log({ e, justificationList });
                                obtenerAsistenciaJustificacion(e.value)
                            }
                        }}
                    />
                    <Item
                        dataField="CompensarHorasExtras"
                        label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.CHE" }) }}
                        editorType="dxSelectBox"
                        isRequired={modoEdicion}
                        editorOptions={{
                            items: estado,
                            valueExpr: "Valor",
                            displayExpr: "Descripcion",
                            onValueChanged: (e) => {
                                let isActivateCHE = e.value === 'S';

                                //console.log("onValueChanged", { isActivateCHE });

                                setIsCHE(!isActivateCHE);
                                setJustificationData(prev => ({
                                    ...prev,
                                    CompensarHEPorPagar: (isActivateCHE ? '' : 'N')
                                }));
                                //dataRowEditNew.CompensarHEPorPagar = isActivateCHE ? '' : 'N'; 
                            }
                        }}
                    />

                    <Item
                        dataField="CompensarHEPorPagar"
                        label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.HE" }) }}
                        editorType="dxSelectBox"
                        isRequired={modoEdicion}
                        editorOptions={{
                            items: estado,
                            valueExpr: "Valor",
                            displayExpr: "Descripcion",
                            readOnly: isCHE
                        }}
                    />

                    <Item
                        dataField="DiaCompleto"
                        label={{ text: intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.DAY" }) }}
                        editorType="dxSelectBox"
                        isRequired={modoEdicion}
                        editorOptions={{
                            items: estado,
                            valueExpr: "Valor",
                            displayExpr: "Descripcion",
                            readOnly: dayCompleteReadOnly,
                        }}
                    />
                </GroupItem>

                <GroupItem colCount={2} >
                    <Item
                        dataField="Observacion"
                        label={{ text: intl.formatMessage({ id: "COMMON.OBSERVATION" }), }}
                        isRequired={isObservationRequired}
                        colSpan={2}
                        editorType="dxTextArea"
                        editorOptions={{
                            maxLength: 500,
                            inputAttr: { style: "text-transform: uppercase" },
                            width: "100%",
                            height: 76,
                            //disabled: dataRowEditNew.DisabledControl
                        }}
                    />
                </GroupItem>
                <GroupItem colSpan={2} >
                    {/* Componente-> Cargar un documento .PDF*/}
                    <FileUploader
                        agregarFotoBd={(data) => onFileUploader(data)}
                        fileNameX={justificationData.NombreArchivo}
                        fileDateX={justificationData.FechaArchivo}
                        MaxFileSize={maxSizeFile}
                    />
                </GroupItem>
            </Form>
        </Popup>
    );
};

export default ReporteIncidenciaDetalleEdit;
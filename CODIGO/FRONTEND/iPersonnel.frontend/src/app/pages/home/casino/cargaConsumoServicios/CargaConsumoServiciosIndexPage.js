import React, { useState } from "react";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import { Button } from "@material-ui/core";
import { DataGrid } from "devextreme-react";
import { Column } from "devextreme-react/data-grid";
import { Tooltip } from "devextreme-react/tooltip";
import notify from "devextreme/ui/notify";


import { isNotEmpty, colsSpanDefault } from "../../../../../_metronic";
import { Portlet, PortletBody } from "../../../../partials/content/Portlet";
import WithLoandingPanel from "../../../../partials/content/withLoandingPanel";
import CustomBreadcrumbs from "../../../../partials/layout/CustomBreadcrumbs";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import StepHeader from "../../../../partials/content/Acreditacion/Wizard/StepHeader";
import MarcaMasivoDatos from "./MarcaMasivoDatos";
import CustomTabNav from "../../../../partials/components/Tabs/CustomTabNav";
import { handleErrorMessages, handleInfoMessages, handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { cargamasiva, procesarmasivo } from "../../../../api/casino/marcacion.api";
import { DivStepFooter } from "../../../../partials/content/Acreditacion/Wizard/StepWizardUtils";
import "./CargaConsumoServicios.css";

const CargaConsumoServiciosIndexPage = (props) => {

    const { intl, setLoading, dataMenu } = props;
    const perfil = useSelector(state => state.perfil.perfilActual);
    const { IdDivision } = perfil
    const classesEncabezado = useStylesEncabezado();

    const steps = [
        { id: "marcas", title: intl.formatMessage({ id: "CASINO.MASIVO.TAB1" }) },
        { id: "marcascargadas", title: intl.formatMessage({ id: "CASINO.MASIVO.TAB2" }) },
        { id: "marcasProceso", title: intl.formatMessage({ id: "CASINO.MASIVO.TAB3" }) }
    ];

    const [parametrosGenerales] = useState({
        activateNextStep: [false, false, false],//Por cada elemento del array "steps"
        isChange: false,
        enableSave: false,//Para habilitar el boton guardar
        flChangeButton: false//Para indicar que se debe actualizar el estado del boton guardar
    });

    const [currentStep, setCurrentStep] = useState(0);
    const [marcasValidadas, setMarcasValidadas] = useState([]);
    const [marcasProcesadas, setMarcasProcesadas] = useState([]);
    const [IdProcesoMasivo, setIdProcesoMasivo] = useState(-1);

    const elementos = [
        {
            id: "idProcesadosOK",
            nombre: intl.formatMessage({ id: "CASINO.MASIVO.RECORD.PROCESADOS" }),
            icon: <i class="icon dx-icon-check" />,
            bodyRender: (e) => { return renderGrillaCorrecta("PROCESO") }
        },
        {
            id: "idProcesadosError",
            nombre: intl.formatMessage({ id: "CASINO.MASIVO.RECORD.ERROR" }),
            icon: <i class="icon dx-icon-close" />,
            bodyRender: (e) => { return renderGrillaIncorrecta("PROCESO") }
        }
    ];

    const elementosCargados = [
        {
            id: "idCargadosOK",
            nombre: intl.formatMessage({ id: "CASINO.MASIVO.RECORD.CORRECT" }),
            icon: <i class="icon dx-icon-check" />,
            bodyRender: (e) => { return renderGrillaCorrecta("CARGA") }
        },
        {
            id: "idCargadosError",
            nombre: intl.formatMessage({ id: "CASINO.MASIVO.RECORD.ERROR" }),
            icon: <i class="icon dx-icon-close" />,
            bodyRender: (e) => { return renderGrillaIncorrecta("CARGA") }
        }
    ];

    const handleBackEvent = (event) => {
        let btnback = document.getElementById("btn-step-back");

        if (currentStep <= 0) {
            return;
        }

        //Paso siguiente:
        let id = document.getElementById(`step_body${currentStep}`);
        let newId = document.getElementById(`step_body${(currentStep - 1)}`);

        id.classList.add("panel-hidden");
        newId.classList.add("panel-visiblen");

        id.classList.remove("panel-visible");
        newId.classList.remove("panel-hidden");

        if ((currentStep - 1) === 0) {
            //Al Inicio:
            btnback.classList.add('Mui-disabled');
            btnback.disabled = true;
        }

        let newCurrentStep = currentStep - 1;
        setCurrentStep(newCurrentStep);
        updateSelectedStep(newCurrentStep);
    };

    const handleNextEvent = () => {
        let temp = parametrosGenerales.activateNextStep;
        temp[currentStep] = true;

        let isValidate = false;
        let message = "";
        //let files = [];

        if (currentStep === 0) {
            let inputFile = document.getElementById(`btn_Excel_0001`);
            //Aca se valida que tenga datos subidos:

            if (inputFile.files.length > 0) {
                isValidate = true;
            } else {
                message = (intl.formatMessage({ id: "CASINO.MASIVO.MENSAJE.FILE" }));
                isValidate = false;
            }
        } else if (currentStep === 1) {
            if (IdProcesoMasivo <= 0) {
                isValidate = false;
                message = (intl.formatMessage({ id: "CASINO.MASIVO.VALIDAREXCEL.MENSAJE" }));
            } else {
                isValidate = true;
            }

        }

        if (isValidate) {
            if ((currentStep + 1) === 1) {
                eventLoadData();
            } else if ((currentStep + 1) === 2) {
                eventToEndStepWizard();
            }
        } else {
            const type = 'error'; //e.value ? 'success' : 'error';
            const text = message;// "Solicitud enviada, no se puede editar."; //props.product.Name + (e.value ? ' is available' : ' is not available');
            notify(text, type, 3000);
        }
    };

    const eventToEndStepWizard = async () => {
        if (marcasValidadas.filter(x => x.Procesado === 'F' || x.Procesado === 'P').length === 0) {
            handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "No hay personas por procesar" }));
            return;
        }
        setLoading(true);

        await procesarmasivo({ IdDivision, IdProceso: IdProcesoMasivo })
            .then(res => {
                setMarcasProcesadas(res.data);
                if (res.data.length > 0) {
                    if (res.data.filter(x => x.Procesado === 'I').length > 0) {
                        handleSuccessMessages(
                            intl.formatMessage({ id: "MESSAGES.SUCESS" }),
                            "Carga masiva procesada, no todos los registros se procesaron correctamente"
                        )
                    } else {
                        handleSuccessMessages(
                            intl.formatMessage({ id: "MESSAGES.SUCESS" }),
                            intl.formatMessage({ id: "CASINO.MASIVO.MESSAGES.SUCCESS" }));
                    }
                } else {
                    //Error
                    handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), {
                        response: {
                            data: "No se retornaron registros al procesar la solicitud",
                            status: 400
                        }
                    });
                }

                eventNextStep();

                setTimeout(() => {

                    let nombreElemento = `idProcesadosOK-tab`;
                    if (!!document.getElementById(nombreElemento)) {
                        document.getElementById(nombreElemento).click()
                    }
                }, 200);
            })
            .catch(res => {
                handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), res);
            })
            .finally(res => {
                setLoading(false);
            })
    };

    const eventLoadData = async (e) => {
        let inputFile
        //setLoading(true);
        inputFile = document.getElementById(`btn_Excel_0001`);

        let verMensajeError = false;
        if (inputFile.files.length > 0) {
            let x = inputFile.files[0];
            if (x !== "" && x !== undefined) {

                let fileRequisito = await fileToBase64(x);
                let archivo = isNotEmpty(fileRequisito[0]) ? fileRequisito[0] : "";
                if (archivo !== "") {

                    setLoading(true);
                    await cargamasiva({
                        IdDivision,
                        File: archivo
                    }).then(async res => {
                        //setVerGrillaCarga(true);
                        setMarcasValidadas(res.data);
                        setIdProcesoMasivo(res.idCarga);
                        eventNextStep();
                        setTimeout(() => {
                            let nombreElemento = `idCargadosOK-tab`;
                            if (!!document.getElementById(nombreElemento)) {
                                document.getElementById(nombreElemento).click()
                            }
                        }, 200);
                    }).catch(res => {
                        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.ERROR" }), res);
                    }).finally(res => {
                        setLoading(false);
                    });

                } else {
                    //Seleccion un archivo
                    verMensajeError = true;
                }
            } else {
                //Seleccione un archivo
                verMensajeError = true;
            }
        } else {
            //Seleccione un archivo
            verMensajeError = true;
        }

        if (verMensajeError) {
            notify(intl.formatMessage({ id: "CASINO.MASIVO.MENSAJE.FILE" }), "error", 3000);
        }

        document.getElementById('btn_Excel_0001').value = null;
    };

    const eventNextStep = () => {

        let btnback = document.getElementById("btn-step-back");
        btnback.classList.remove('Mui-disabled');
        btnback.disabled = false;

        //Paso siguiente:
        let id = document.getElementById(`step_body${currentStep}`);
        let newId = document.getElementById(`step_body${(currentStep + 1)}`);

        id.classList.add("panel-hidden");
        newId.classList.add("panel-visiblen");

        id.classList.remove("panel-visible");
        newId.classList.remove("panel-hidden");

        let newCurrentStep = currentStep + 1;

        setCurrentStep(newCurrentStep);
        updateSelectedStep(newCurrentStep);
    };

    const updateSelectedStep = (stepIndex) => {

        for (let i = 0; i < steps.length; i++) {

            if (i <= stepIndex) {
                document.getElementById(`step_icon${i}`).classList.add("MuiStepIcon-active");
                document.getElementById(`step_text${i}`).classList.remove("Mui-disabled");
                document.getElementById(`step_text${i}`).classList.add("MuiStepLabel-active");


            } else {
                document.getElementById(`step_icon${i}`).classList.remove("MuiStepIcon-active");
                document.getElementById(`step_text${i}`).classList.add("Mui-disabled");
                document.getElementById(`step_text${i}`).classList.remove("MuiStepLabel-active");
            }

            //Quitar clase seleccionado:
            document.getElementById(`step_icon${i}`).classList.remove("step_icon_selected");
            document.getElementById(`step_text${i}`).classList.remove("step_icon_selected");
            if (i === stepIndex) {
                //Agregar clase seleccionado    step_text
                document.getElementById(`step_text${i}`).classList.add("step_icon_selected");
                document.getElementById(`step_icon${i}`).classList.add("step_icon_selected");
            }

        }
        //setLoading(false);
    }


    const renderGrillaCorrecta = (tipo) => {
        let datos = tipo === "CARGA" ? marcasValidadas : marcasProcesadas;
        return (
            <DataGrid
                dataSource={datos.filter(x => x.Procesado === 'F' || x.Procesado === 'P')}
                showBorders={true}
                focusedRowEnabled={true}
                keyExpr="RowIndex"
                remoteOperations={true}
            >
                <Column dataField="RowIndex" caption="#" width={"5%"} alignment={"center"} />
                <Column dataField="Documento" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.DOC" })} width={"5%"} alignment={"center"} />
                <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.NOMBRECOMPLETO" })} width={"15%"} alignment={"left"} />
                <Column dataField="IdComedor" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.IDCOMEDOR" })} width={"5%"} alignment={"left"} />
                <Column dataField="Comedor" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.COMEDOR" })} width={"10%"} alignment={"left"} />
                <Column dataField="IdServicio" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.IDSERVICIO" })} width={"5%"} alignment={"left"} />
                <Column dataField="Servicio" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.SERVICIO" })} width={"10%"} alignment={"left"} />
                <Column dataField="Cantidad" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.CANTIDAD" })} width={"10%"} alignment={"left"} />
                <Column dataType="date" format="dd/MM/yyyy" dataField="Fecha" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.FECHA" })} width={"5%"} alignment={"left"} />
                <Column dataField="Hora" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.HORA" })} width={"5%"} alignment={"left"} />
                <Column dataField="Mensaje" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.MENSAJE" })} width={"25%"} alignment={"left"} />
            </DataGrid>
        );
    };

    const renderGrillaIncorrecta = (tipo) => {
        let datos = tipo === "CARGA" ? marcasValidadas : marcasProcesadas;
        return (
            <DataGrid
                dataSource={datos.filter(x => x.Procesado === 'E' || x.Procesado === 'I')}
                showBorders={true}
                focusedRowEnabled={true}
                keyExpr="RowIndex"
                onCellPrepared={ColorRojo}
                remoteOperations={true}
            >
                <Column dataField="RowIndex" caption="#" width={"5%"} alignment={"center"} />
                <Column dataField="Documento" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.DOC" })} width={"5%"} alignment={"center"} />
                <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.NOMBRECOMPLETO" })} width={"15%"} alignment={"left"} />
                <Column dataField="IdComedor" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.IDCOMEDOR" })} width={"5%"} alignment={"left"} />
                <Column dataField="Comedor" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.COMEDOR" })} width={"10%"} alignment={"left"} />
                <Column dataField="IdServicio" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.IDSERVICIO" })} width={"5%"} alignment={"left"} />
                <Column dataField="Servicio" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.SERVICIO" })} width={"10%"} alignment={"left"} />
                <Column dataField="Cantidad" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.CANTIDAD" })} width={"10%"} alignment={"left"} />
                <Column dataType="date" format="dd/MM/yyyy" dataField="Fecha" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.FECHA" })} width={"5%"} alignment={"left"} />
                <Column dataField="Hora" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.HORA" })} width={"5%"} alignment={"left"} />
                <Column dataField="Mensaje" caption={intl.formatMessage({ id: "CASINO.MASIVO.GRID.MENSAJE" })} width={"25%"} alignment={"left"} cellRender={cellRenderMensaje} />
            </DataGrid>
        );
    };

    function ColorRojo(e) {
        e.cellElement.style.color = 'red';
    }

    const cellRenderMensaje = (param) => {
        // console.log("cellRenderMensaje|param:",param);
        if (param && param.data) {
            if (param.column.dataField === 'Mensaje') {
                return <>
                    <div>
                        <div id={`id_${param.data.Documento}`}>
                            {param.data.Mensaje}
                        </div>
                        <Tooltip
                            target={`#id_${param.data.Documento}`}
                            showEvent="dxhoverstart"
                            hideEvent="dxhoverend"
                            position="top"
                        >
                            <div style={{ textAlign: "left" }}>
                                <strong>{param.data.Mensaje}</strong>

                            </div>
                        </Tooltip>
                    </div>
                </>

            }
        }
    };

    async function fileToBase64(file) {

        // create function which return resolved promise
        // with data:base64 string
        function getBase64(file) {
            const reader = new FileReader()
            return new Promise(resolve => {
                reader.onload = ev => {
                    resolve(ev.target.result)
                }
                reader.readAsDataURL(file)
            })
        }
        // here will be array of promisified functions
        const promises = []
        // loop through fileList with for loop

        promises.push(getBase64(file))

        // file.target.value = null;
        // array with base64 strings
        return await Promise.all(promises);
    }

    return (
        <>
            <CustomBreadcrumbs
                Title={intl.formatMessage({ id: "CASINO.TYPE.MENU" })}
                Subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
            />

            <Portlet>
                <AppBar position="static" className={classesEncabezado.principal}>
                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                            {intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
                        </Typography>
                    </Toolbar>
                </AppBar>

                <PortletBody>
                    <div className="row">
                        <div className="col-12">
                            <div className="MuiPaper-root MuiStepper-root MuiStepper-horizontal MuiPaper-elevation0">
                                {steps.map((x, i) => {
                                    return (
                                        <StepHeader
                                            key={`sh_${i}`}
                                            index={i}
                                            currentStep={currentStep}
                                            title={x.title}
                                        />
                                    );
                                })}

                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            <div key={`step_body0`} id={`step_body0`} className={`${currentStep === 0 ? "panel-visible" : "panel-hidden"}`} >
                                <MarcaMasivoDatos
                                    IdDivision={IdDivision}
                                />
                            </div>
                            <div key={`step_body1`} id={`step_body1`} className={`${currentStep === 1 ? "panel-visible" : "panel-hidden"}`} >
                                <div className="row">
                                    <div className="col-12">
                                        <div className="barra-titulo"
                                            style={{
                                                paddingTop: "5px",
                                                paddingBottom: "5px",
                                                marginBottom: "10px"
                                            }}
                                        >
                                            Datos a procesar
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <CustomTabNav
                                            id={"tabNavCargados"}
                                            elementos={elementosCargados}
                                            tabActivo={0}
                                            validateRequerid={false}
                                            evaluateRequerid={false}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div key={`step_body2`} id={`step_body2`} className={`${currentStep === 2 ? "panel-visible" : "panel-hidden"}`} >
                                <div className="row">
                                    <div className="col-12">
                                        <div className="barra-titulo"
                                            style={{
                                                paddingTop: "5px",
                                                paddingBottom: "5px",
                                                marginBottom: "10px"
                                            }}
                                        >
                                            {intl.formatMessage({ id: "CASINO.MASIVO.TITLE.PROCESADOS" })}
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <CustomTabNav
                                            id={"tabNavProcesados"}
                                            elementos={elementos}
                                            tabActivo={0}
                                            validateRequerid={false}
                                            evaluateRequerid={false}
                                        />
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>
                    <div className="row">
                        <DivStepFooter
                            className={`${colsSpanDefault(6)}`}
                            style={{ display: "inline-flex" }}
                        >


                            {currentStep === 2 ? null : (
                                <Button
                                    disabled={currentStep === 0}
                                    onClick={handleBackEvent}
                                    id="btn-step-back"
                                    type="default"
                                    className={currentStep === 0 ? "classBackDisable" : "classBack"}
                                >
                                    <i className="dx-icon dx-icon-back clsStepBackIcon"></i>
                                    <span className="dx-button-text">
                                        {intl.formatMessage({ id: "AUTH.GENERAL.BACK_BUTTON" })}
                                    </span>
                                </Button>
                            )}
                            {currentStep !== 2 && (
                                <Button
                                    id="btn-step-next"
                                    variant="contained"
                                    type="default"
                                    onClick={handleNextEvent}
                                    className="classNext"
                                >
                                    <span className="dx-button-text">
                                        {(currentStep) === 0 ? intl.formatMessage({ id: "CASINO.MASIVO.BUTTON.LOAD" })
                                            : (currentStep) === 1 ? intl.formatMessage({ id: "CASINO.MASIVO.BUTTON.PROCESAR" })
                                                : intl.formatMessage({ id: "COMMON.NEXT" })}
                                    </span>
                                    <i className="dx-icon dx-icon-chevronnext clsStepNextIcon"></i>
                                </Button>

                            )}
                        </DivStepFooter>
                        <DivStepFooter className={`${colsSpanDefault(6)}`}></DivStepFooter>
                    </div>
                </PortletBody>
            </Portlet>
        </>

    );
};

export default injectIntl(WithLoandingPanel(CargaConsumoServiciosIndexPage));
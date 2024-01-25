import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem, PatternRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useSelector } from "react-redux";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { listarEstadoSimple, listarEstado, listarFrecuencia, listarUnidadTiempo, isNotEmpty, } from "../../../../../../_metronic";
import { isRequired } from "../../../../../../_metronic/utils/securityUtils";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import FieldsetAcreditacion from '../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const ProgramacionEditPage = props => {

    const { intl, modoEdicion, settingDataField, accessButton } = props;
    const perfil = useSelector(state => state.perfil.perfilActual);
    const [estado, setEstado] = useState([]);
    const classesEncabezado = useStylesEncabezado();

    const [fechaFinValue, setFechaFinValue] = useState();
    const [terminaEjecutarseValue, setTerminaEjecutarseValue] = useState(false);
    //const [terminaEjecutarseValue, setTerminaEjecutarseValue] = useState([]);;
    const [esNuevoRegistro, setEsNuevoRegistro] = useState(false);
    const [unaEjecucionValue, setUnaEjecucionValue] = useState([]);
    const [frecuenciaValue, setFrecuenciaValue] = useState([]);


    async function cargarCombos() {

        let estado = listarEstado();
        setEstado(estado);
    }

    async function onValueChangedFrecuencia(value) {
        if (value === "S") {
            setFrecuenciaValue("S")

        } else {
            setFrecuenciaValue("N")
        }

    }

    async function onValueChangedUnaEjecucion(value) {
        if (value === "S") {
            setUnaEjecucionValue("S")

        } else {
            setUnaEjecucionValue("N")
        }
    }

    async function onValueChangedTerminaEjecutarse(value) {

        if (value === "S") {
            setUnaEjecucionValue("S")
            setTerminaEjecutarseValue(true)
            /* let hoy = new Date();
            let fecFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
            setFechaFinValue(fecFin); */

        } else {
            setUnaEjecucionValue("N")
            setTerminaEjecutarseValue(false)
            /*let fechaFin;
                       await obtenerFechaFinMaximo({ IdCliente: perfil.IdCliente, IdConfiguracion: "FECHAMINMAX" })
                           .then(result => {
                               fechaFin = convertyyyyMMddToFormatDate(result.Valor2);
                               setFechaFinValue(fechaFin);
                           }).finally(x => {
                               if (!isNotEmpty(fechaFin)) handleWarningMessages("Aviso", "No tiene configurado fecha máximo.");
                           }); */

        }

    }


    function fechaInicioEsMayorQueFechaFin() {
        let terminaEfecutarse = props.dataRowEditNew.TerminaEjecutarse;
        let fechaInicio = new Date(props.dataRowEditNew.FechaInicio);
        let fechaFin = new Date(props.dataRowEditNew.FechaFin);
        if (terminaEfecutarse === "S") {
            return fechaInicio.getTime() > fechaFin.getTime();
        } else {
            return false;
        }
    }


    function grabar(e) {
        let result = e.validationGroup.validate();

        if (result.isValid) {

            if (fechaInicioEsMayorQueFechaFin()) {
                handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.VALIDATION.MESSAGE" }));
                return;
            }

            if (props.dataRowEditNew.esNuevoRegistro) {
                props.agregarProcesoProgramacion(props.dataRowEditNew);
            } else {
                props.actualizarProcesoProgramacion(props.dataRowEditNew);
            }
        }
    }

    const isRequiredRule = (id) => {
        return modoEdicion ? false : isRequired(id, settingDataField);
    }


    useEffect(() => {
        cargarCombos();
    }, []);



    const programacionDescripcion = (e) => {
        return (
            <>

                <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
                    <GroupItem itemType="group" colCount={2} >


                        <Item dataField="Programacion"
                            label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.PROGRAMMING" }) }}
                            isRequired={modoEdicion}
                            colSpan={2}
                            editorOptions={{
                                maxLength: 100,
                                inputAttr: { 'style': 'text-transform: uppercase' },
                            }}
                        >
                            {/* {(isRequiredRule("Programacion")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                            <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} /> */}
                        </Item>

                    </GroupItem>
                </Form>
            </>
        );
    }

    const frecuencia = (e) => {
        return (
            <>

                <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">

                    <GroupItem itemType="group" colCount={2} >

                        <Item dataField="IdCliente" visible={false} />
                        <Item dataField="IdProceso" visible={false} />


                        <Item
                            colSpan={1}
                            dataField="Frecuencia"
                            isRequired={modoEdicion}
                            label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.TYPE.FRCUENCY" }) }}
                            editorType="dxSelectBox"
                            editorOptions={{
                                value: isNotEmpty(props.dataRowEditNew.Frecuencia) ? props.dataRowEditNew.Frecuencia : frecuenciaValue,
                                items: listarFrecuencia(),
                                valueExpr: "Valor",
                                displayExpr: "Descripcion",
                                onValueChanged: (e) => onValueChangedFrecuencia(e.value)
                            }}
                        />

                        <Item
                            dataField="FrecuenciaEjecucion"
                            label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.FRECUENCY.EXECUTION" }) }}
                            isRequired={modoEdicion}
                            colSpan={1}
                            editorType="dxNumberBox"
                            dataType="number"
                            editorOptions={{
                                inputAttr: { style: "text-transform: uppercase; text-align: right" },
                                showSpinButtons: true,
                                showClearButton: true,
                                min: 1,
                                max: 100
                            }}
                        >
                            <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
                        </Item>



                    </GroupItem>

                    <GroupItem itemType="group" colCount={7} >

                        <Item dataField="Lunes"
                            label={{ text: "Check", visible: false }}
                            editorType="dxCheckBox"
                            visible={props.dataRowEditNew.Frecuencia === "S" === true}
                            editorOptions={{
                                text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.MONDAY" }),
                                width: "100%"
                            }}
                        />

                        <Item dataField="Martes"
                            label={{ text: "Check", visible: false }}
                            editorType="dxCheckBox"
                            visible={props.dataRowEditNew.Frecuencia === "S" === true}
                            editorOptions={{
                                text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.TUESDAY" }),
                                width: "100%"
                            }}
                        />
                        <Item dataField="Miercoles"
                            label={{ text: "Check", visible: false }}
                            editorType="dxCheckBox"
                            visible={props.dataRowEditNew.Frecuencia === "S" === true}
                            editorOptions={{
                                text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.WEDNESDAY" }),
                                width: "100%"
                            }}
                        />
                        <Item dataField="Jueves"
                            label={{ text: "Check", visible: false }}
                            editorType="dxCheckBox"
                            visible={props.dataRowEditNew.Frecuencia === "S" === true}
                            editorOptions={{
                                text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.THURSDAY" }),
                                width: "100%"
                            }}
                        />


                        <Item dataField="Viernes"
                            label={{ text: "Check", visible: false }}
                            editorType="dxCheckBox"
                            visible={props.dataRowEditNew.Frecuencia === "S" === true}
                            editorOptions={{
                                text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.FRIDAY" }),
                                width: "100%"
                            }}
                        />
                        <Item dataField="Sabado"
                            label={{ text: "Check", visible: false }}
                            editorType="dxCheckBox"
                            visible={props.dataRowEditNew.Frecuencia === "S" === true}
                            editorOptions={{
                                text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.SATURDAY" }),
                                width: "100%"
                            }}
                        />

                        <Item dataField="Domingo" colSpan={2}
                            label={{ text: "Check", visible: false }}
                            editorType="dxCheckBox"
                            visible={props.dataRowEditNew.Frecuencia === "S" === true}
                            editorOptions={{
                                text: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.SUNDAY" }),
                                width: "100%"
                            }}
                        />
                    </GroupItem>

                </Form>
            </>
        );
    }

    const detalle = (e) => {
        return (
            <>

                <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
                    <GroupItem itemType="group" colCount={2} >

                        <Item
                            dataField="UnaEjecucion"
                            label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.PERFORMANCE" }) }}
                            editorType="dxSelectBox"
                            isRequired={modoEdicion}
                            editorOptions={{
                                value: isNotEmpty(props.dataRowEditNew.UnaEjecucion) ? props.dataRowEditNew.UnaEjecucion : unaEjecucionValue,
                                items: estado,
                                valueExpr: "Valor",
                                displayExpr: "Descripcion",
                                onValueChanged: (e) => onValueChangedUnaEjecucion(e.value)
                            }}
                        />

                        <Item
                            dataField="HoraEjecucion"
                            label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.HOUR" }) }}
                            isRequired={modoEdicion}
                            editorType="dxDateBox"
                            visible={props.dataRowEditNew.UnaEjecucion === "S" === true}
                            editorOptions={{
                                showClearButton: true,
                                useMaskBehavior: true,
                                maxLength: 5,
                                displayFormat: "HH:mm",
                                type: "time"
                            }}
                        />

                        <Item visible={props.dataRowEditNew.UnaEjecucion === "S" === false} />

                        <Item
                            colSpan={1}
                            dataField="UnidadTiempo"
                            label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.UT" }) }}
                            isRequired={modoEdicion}
                            editorType="dxSelectBox"
                            visible={props.dataRowEditNew.UnaEjecucion === "N" === true}
                            editorOptions={{
                                items: listarUnidadTiempo(),
                                valueExpr: "Valor",
                                displayExpr: "Descripcion"
                                //readOnly: props.dataRowEditNew.UnaEjecucion === "S",
                            }}
                        />
                        <Item
                            dataField="RepetirCadaTiempo"
                            label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.REPEAT" }) }}
                            //isRequired={modoEdicion}
                            editorType="dxNumberBox"
                            dataType="number"
                            visible={props.dataRowEditNew.UnaEjecucion === "N" === true}
                            editorOptions={{
                                inputAttr: { style: "text-transform: uppercase; text-align: right" },
                                showSpinButtons: true,
                                showClearButton: true,
                                min: 1,
                                max: 100
                                //readOnly: props.dataRowEditNew.UnaEjecucion === "S"

                            }}
                        >
                            <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
                        </Item>
                        <Item
                            dataField="HoraInicio"
                            label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.GRUPO.STARTTIME" }) }}
                            isRequired={modoEdicion}
                            editorType="dxDateBox"
                            visible={props.dataRowEditNew.UnaEjecucion === "N" === true}
                            editorOptions={{
                                showClearButton: true,
                                useMaskBehavior: true,
                                maxLength: 5,
                                displayFormat: "HH:mm",
                                type: "time"
                                //readOnly: props.dataRowEditNew.UnaEjecucion === "S"
                            }}
                        />

                        <Item
                            dataField="HoraFin"
                            label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.ENDTIME" }) }}
                            isRequired={modoEdicion}
                            editorType="dxDateBox"
                            visible={props.dataRowEditNew.UnaEjecucion === "N" === true}
                            editorOptions={{
                                showClearButton: true,
                                useMaskBehavior: true,
                                //maxLength: 5,
                                displayFormat: "HH:mm",
                                type: "time"
                                //readOnly: props.dataRowEditNew.UnaEjecucion === "S"
                            }}
                        />
                    </GroupItem>
                </Form>
            </>
        );
    }

    const duracion = (e) => {
        return (
            <>
                <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
                    <GroupItem itemType="group" colCount={2} >

                        <Item
                            dataField="FechaInicio"
                            label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }) }}
                            isRequired={true}
                            editorType="dxDateBox"
                            dataType="date"
                            //visible={props.dataRowEditNew.TerminaEjecutarse === "S" === true}
                            editorOptions={{
                                displayFormat: "dd/MM/yyyy"
                            }}
                        />

                        <Item />

                        <Item
                            dataField="TerminaEjecutarse"
                            label={{ text: intl.formatMessage({ id: "SYSTEM.PROCESS.EXECUTING" }) }}
                            editorType="dxSelectBox"
                            isRequired={modoEdicion}
                            editorOptions={{
                                value: isNotEmpty(props.dataRowEditNew.TerminaEjecutarse) ? props.dataRowEditNew.TerminaEjecutarse : terminaEjecutarseValue,
                                items: estado,
                                valueExpr: "Valor",
                                displayExpr: "Descripcion",
                                onValueChanged: (e) => onValueChangedTerminaEjecutarse(e.value)
                            }}
                        />

                        <Item
                            dataField="FechaFin"
                            label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }) }}
                            isRequired={true}
                            editorType="dxDateBox"
                            dataType="date"
                            visible={props.dataRowEditNew.TerminaEjecutarse === "S" === true}
                            editorOptions={{
                                displayFormat: "dd/MM/yyyy",
                                value: fechaFinValue ? fechaFinValue : props.dataRowEditNew.FechaFin,
                                readOnly: terminaEjecutarseValue ? false : (modoEdicion && !esNuevoRegistro) ? true : false
                            }}
                        />
                    </GroupItem>
                </Form>
            </>
        );
    }

    const activo = (e) => {
        return (
            <>
                <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
                    <GroupItem itemType="group" colCount={2} >
                        <Item />
                        <Item
                            dataField="Activo"
                            label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                            editorType="dxSelectBox"
                            isRequired={modoEdicion}
                            editorOptions={{
                                items: listarEstadoSimple(),
                                valueExpr: "Valor",
                                displayExpr: "Descripcion",
                                readOnly: props.dataRowEditNew.esNuevoRegistro ? true : false,
                                //readOnly: !(modoEdicion ? isModified("Activo", settingDataField) : false)
                            }}
                        />

                    </GroupItem>
                </Form>
            </>
        );
    }

    return (
        <>
            <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>

                                <Button
                                    icon="fa fa-save"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                                    onClick={grabar}
                                    useSubmitBehavior={true}
                                    validationGroup="FormEdicion"
                                />
                                &nbsp;
                                <Button
                                    icon="fa fa-times-circle"
                                    type="normal"
                                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                                    onClick={props.cancelarEdicion}
                                />

                            </PortletHeaderToolbar>
                        }
                    />

                }
            />

            <PortletBody >
                <React.Fragment>
                  
                        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                            <GroupItem itemType="group" colCount={2} colSpan={2}>

                            <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                    {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

                                <Item colSpan={2}>
                                    <AppBar position="static" className={classesEncabezado.secundario}>
                                        <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                            <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                                {intl.formatMessage({ id: "COMMON.DETAIL" })}
                                            </Typography>
                                        </Toolbar>
                                    </AppBar>
                                </Item>
                                <br />

                                <div className="row">

                                    <div className="col-md-12">
                                        {programacionDescripcion()}
                                    </div>

                                    <div className="col-md-12">
                                        <fieldset className="scheduler-border" >
                                            <legend className="scheduler-border" >
                                                <h5>{intl.formatMessage({ id: "SYSTEM.PROCESS.FRECUENCY" })} </h5></legend>
                                            {frecuencia()}
                                        </fieldset>
                                    </div>

                                    <div className="col-md-12">
                                        <fieldset className="scheduler-border" >
                                            <legend className="scheduler-border" >
                                                <h5>{intl.formatMessage({ id: "COMMON.DETAIL" })} </h5>
                                            </legend>
                                            {detalle()}
                                        </fieldset>

                                        <fieldset className="scheduler-border" >
                                            <legend className="scheduler-border" >
                                                <h5>{intl.formatMessage({ id: "SYSTEM.PROCESS.DURATION" })} </h5>
                                            </legend>
                                            {duracion()}
                                        </fieldset>
                                    </div>


                                    <div className="col-md-12">
                                        {activo()}
                                    </div>

                                </div>


                            </GroupItem>
                        </Form>
                   
                </React.Fragment>
            </PortletBody>
        </>
    );
};

export default injectIntl(ProgramacionEditPage);

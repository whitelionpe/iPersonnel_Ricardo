
import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import Form, { Item, GroupItem, ButtonItem } from "devextreme-react/form";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { obtenerTodos as obtenerTodosRegimen } from "../../../../../api/administracion/regimen.api";
import { obtenerTodos as obtenerTodosGuardia } from "../../../../../api/administracion/regimenGuardia.api";
import { isNotEmpty, listarEstadoSimple } from "../../../../../../_metronic";

const PersonaGuardiaEditPage = (props) => {

    const { intl, modoEdicion, settingDataField,fechasContrato } = props;
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [estadoSimple, setEstadoSimple] = useState([]);
    const [guardia, setGuardia] = useState([]);
    const [regimen, setRegimen] = useState([]);

    const classesEncabezado = useStylesEncabezado();

    const [isVisiblePopUpPersona, setisVisiblePopUpPersona] = useState(false);
    const [Filtros, setFiltros] = useState({ Filtro: "1" });
    const { IdCliente } = useSelector(state => state.perfil.perfilActual);

    const [primeraCarga,setPrimeraCarga]=useState(false);


    async function cargarCombos() {
        if (perfil.IdCliente) {
            let regimen = await obtenerTodosRegimen({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdRegimen: '' });
            let estadoSimple = listarEstadoSimple();

            setRegimen(regimen);
            setEstadoSimple(estadoSimple);
        }
    }

    async function cargarGuardia(regimen) {
        let guardia = await obtenerTodosGuardia({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdRegimen: regimen });
        // props.dataRowEditNew.IdGuardia=null;
        setGuardia(guardia);
    }

    async function onValueRegimen(regimen) {
        // console.log("**onValueRegimen** regimen :> ", regimen);
        // console.log("**props.dataRowEditNew.IdRegimen** :> ", props.dataRowEditNew.IdRegimen);
        // console.log("**props.dataRowEditNew.IdGuardia** :> ", props.dataRowEditNew.IdGuardia);
        if (isNotEmpty(regimen)) {
            cargarGuardia(regimen);
            //LSF: Se valida primer acceso del loading
            if(primeraCarga==false){
                setPrimeraCarga(true); 
            }
            else{
                props.dataRowEditNew.IdGuardia=null;
            }
        }

    }

    function grabar(e) {
        let result = e.validationGroup.validate();

        if (fechaInicioEsMayorQueFechaFin()) {
            //alert("La fecha de inicio no puede ser mayor que la fecha fin");
            handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.VALIDATION.MESSAGE" }));
            return;
        }

        if (result.isValid) {
            if (props.dataRowEditNew.esNuevoRegistro) {
                props.agregarPersonaGuardia(props.dataRowEditNew);
            } else {
                props.actualizarPersonaGuardia(props.dataRowEditNew);
            }
        }

    }

    function fechaInicioEsMayorQueFechaFin() {
        let fechaInicio = new Date(props.dataRowEditNew.FechaInicio);
        let fechaFin = new Date(props.dataRowEditNew.FechaFin);

        return fechaInicio.getTime() > fechaFin.getTime();
    }

    useEffect(() => {
        cargarCombos();
    }, []);
 
    return (
        <>
            <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                &nbsp;
                                <Button
                                    icon="fa fa-save"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                                    useSubmitBehavior={true}
                                    validationGroup="FormEdicion"
                                    onClick={grabar}
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
                } />


            <PortletBody>
                <React.Fragment>
                    <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                        <GroupItem itemType="group" colCount={2} colSpan={2}>
                            <Item colSpan={2}>
                                <AppBar position="static" className={classesEncabezado.secundario}>
                                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                            {
                                                props.dataRowEditNew.esNuevoRegistro ? intl.formatMessage({ id: "ADMINISTRATION.PERSON.GUARD.ADD" }) :
                                                    intl.formatMessage({ id: "ADMINISTRATION.PERSON.GUARD.EDIT" })
                                            }

                                        </Typography>
                                    </Toolbar>
                                </AppBar>
                            </Item>
                            <Item dataField="IdSecuencial" visible={false} />

                            <Item
                                dataField="IdRegimen"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.REGIME" }) }}
                                editorType="dxSelectBox"
                                isRequired={true}
                                editorOptions={{
                                    onValueChanged: (e) => onValueRegimen(e.value),
                                    items: regimen,
                                    valueExpr: "IdRegimen",
                                    displayExpr: "Regimen",
                                    //searchEnabled: true
                                }}
                            >
                            </Item>
                            <Item
                                dataField="IdGuardia"
                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.GUARD" }) }}
                                editorType="dxSelectBox"
                                isRequired={true}
                                editorOptions={{
                                    items: guardia,
                                    valueExpr: "IdGuardia",
                                    displayExpr: "Guardia",
                                    //searchEnabled: true
                                }}
                            >
                            </Item> 
                            <Item
                                dataField="FechaInicio"
                                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" }) }}
                                editorType="dxDateBox"
                                dataType="date"
                                isRequired={true}
                                editorOptions={{
                                    displayFormat: "dd/MM/yyyy",
                                    min: fechasContrato.FechaInicioContrato,
                                    max: fechasContrato.FechaFinContrato
                                }}
                            />
                            <Item
                                dataField="FechaFin"
                                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.ENDDATE" }) }}
                                editorType="dxDateBox"
                                isRequired={true}
                                dataType="date"
                                editorOptions={{
                                    displayFormat: "dd/MM/yyyy",
                                    min: fechasContrato.FechaInicioContrato,
                                    max: fechasContrato.FechaFinContrato
                                }}
                            />

                            <Item
                                dataField="Activo"
                                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                                editorType="dxSelectBox"
                                colSpan={1}
                                isRequired={true}
                                visible={!props.dataRowEditNew.esNuevoRegistro}
                                editorOptions={{
                                    items: estadoSimple,
                                    valueExpr: "Valor",
                                    displayExpr: "Descripcion"
                                }}
                            />

                            <Item dataField="IdPersona" visible={false}
                                colSpan={2} />

                            <Item />
                        </GroupItem>
                    </Form>


                </React.Fragment>
            </PortletBody>
        </>
    );
};

export default injectIntl(WithLoandingPanel(PersonaGuardiaEditPage));
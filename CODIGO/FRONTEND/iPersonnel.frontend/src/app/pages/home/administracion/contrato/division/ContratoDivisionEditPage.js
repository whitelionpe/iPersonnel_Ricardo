import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem, SimpleItem, ButtonItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { listarEstadoSimple } from "../../../../../../_metronic/utils/utils";
import { injectIntl } from "react-intl";
import PropTypes from 'prop-types'
import AdministracionDivisionBuscar from "../../../../../partials/components/AdministracionDivisionBuscar";
//import AdministracionPersonaBuscar from "../../../../partials/components/AdministracionPersonaBuscar";
// import { obtener as obtenerPersona, storeBuscar as storePersonaBuscar } from "../../../../api/administracion/persona.api";
//import { obtenerTodos as buscarPersona, obtener as obtenerEmpleado } from "../../../../api/administracion/persona.api";
//import { obtenerTodos as obtenerTodosDivision } from "../../../../api/sistema/division.api";

//import { listar as listarTipoContrato } from "../../../../api/administracion/tipoContrato.api";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { servicioPersonaPosicion } from "../../../../../api/administracion/personaPosicion.api";

import { isNotEmpty } from "../../../../../../_metronic";
import { handleInfoMessages, handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

//import { DataGrid, Column, Paging, FilterRow, HeaderFilter, Selection, Pager, Button as ColumnButton, } from "devextreme-react/data-grid";
import { confirm, custom } from "devextreme/ui/dialog";

const ContratoDivisionEditPage = props => {

    const { intl, setLoading, accessButton } = props;
    const [estadoSimple, setEstadoSimple] = useState([]);
    const classesEncabezado = useStylesEncabezado();

    const [isVisiblePopUpDivision, setisVisiblePopUpDivision] = useState(false);
    const [isVisiblePopUpPersonas, setisVisiblePopUpPersonas] = useState(false);
    const perfil = useSelector(state => state.perfil.perfilActual);
    const [operadores, setOperadores] = useState([]);

    async function cargarCombos() {
        let estadoSimple = listarEstadoSimple();
        setEstadoSimple(estadoSimple);

        setLoading(true);
        let personas = await servicioPersonaPosicion.personas({ IdCliente: perfil.IdCliente, IdCompania: props.Contrato.IdCompaniaMandante }).finally(() => { setLoading(false); });
        setOperadores(personas);


    }

    function grabar(e) {
        let result = e.validationGroup.validate();
        if (result.isValid) {
            if (props.dataRowEditNew.esNuevoRegistro) {
                props.agregarContratoDivision(props.dataRowEditNew);
            } else {
                props.actualizarContratoDivision(props.dataRowEditNew);
            }
        }
    }



 

    const tituloBarra = () => {
        let titulo = '';

        if (props.dataRowEditNew.esNuevoRegistro) {
            return '';
        }

        return `${(isNotEmpty(props.dataRowEditNew.PadreDescrip) ? props.dataRowEditNew.PadreDescrip : "")}                                              
                ${(isNotEmpty(props.dataRowEditNew.Division) ? props.dataRowEditNew.Division : "")}`
    }

    /**************************************************************************************************** */


    async function agregarPersona(personas) {



        let str_repetidos = '';
        let newArray = [...props.grillaPersona];

        personas.map(async (data) => {
            //Apellido Nombre
            let { IdPersona, NombreCompleto, Apellido, Nombre, TipoDocumento, Documento, Activo } = data;
            let foundIndex = newArray.findIndex(x => x.IdPersona == IdPersona);
            //console.log("persona:", data);
            if (foundIndex == -1) {
                newArray.push({ IdPersona, NombreCompleto: `${Apellido} ${Nombre}`, TipoDocumento, Documento, Activo: "S", esNuevoRegistro: true });
                newArray.map((x, i) => x.RowIndex = i + 1);
            } else {
                str_repetidos += `${Documento} - ${NombreCompleto}.\r\n`;
            }
        });

        props.setGrillaPersona(newArray);
        if (str_repetidos != '') {
            handleErrorMessages({ response: { data: `Personas ya existen:\r\n${str_repetidos}`, status: 400 } });
        }

    }

    const obtenerCampoActivo = (rowData) => {
        return rowData.Activo === "S";
    }


    const eliminarRegistro = (evt) => {
        let data = evt.row.data;

        let dialog = custom({
            showTitle: false,
            messageHtml: intl.formatMessage({ id: "ALERT.REMOVE" }),
            buttons: [
                {
                    text: "Yes",
                    onClick: (e) => {
                        let newArray = props.grillaPersona.filter(x => x.IdPersona != data.IdPersona);

                        newArray.map((x, i) => {
                            x.RowIndex = i + 1;
                        });
                        props.setGrillaPersona(newArray);
                    }
                },
                { text: "No", },
            ]
        });
        dialog.show();

    };




     /*** POPUP DIVISIONES ***/
      const selectDataDivisiones = (data) => {
          props.setDataRowEditNew({
          ...props.dataRowEditNew,
          IdDivision: data.IdDivision,
          Division: `${data.IdDivision} - ${data.Division}`,
          });
          setisVisiblePopUpDivision(false);
      }

    /**************************************************************************************************** */

    useEffect(() => {
        cargarCombos();
    }, []);

    return (
        <>
            {props.showButton && (
                <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
                    toolbar={
                        <PortletHeader
                            title=""
                            toolbar={
                                <PortletHeaderToolbar>
                                    <PortletHeaderToolbar>
                                        <Button
                                            icon="fa fa-save"
                                            type="default"
                                            hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                                            visible={props.modoEdicion}
                                            onClick={grabar}
                                            useSubmitBehavior={true}
                                            validationGroup="FormEdicion"
                                            disabled={!accessButton.grabar}
                                        />
                                        &nbsp;
                                        <Button
                                            icon="fa fa-times-circle"
                                            type="normal"
                                            hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                                            onClick={props.cancelarEdicion}
                                        />
                                    </PortletHeaderToolbar>
                                </PortletHeaderToolbar>
                            }
                        />

                    } />)}

            <PortletBody >
                <React.Fragment>
                    <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                        <GroupItem itemType="group" colCount={2} colSpan={2}>
                            <Item colSpan={2}>
                                <AppBar position="static" className={classesEncabezado.secundario}>
                                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                            {
                                                `${intl.formatMessage({ id: "COMMON.DETAIL" })}: ${tituloBarra()}`
                                            }
                                        </Typography>
                                    </Toolbar>
                                </AppBar>
                            </Item>

                            <SimpleItem dataField="IdCliente" visible={false}></SimpleItem>
                            <SimpleItem dataField="IdCompaniaMandante" visible={false}></SimpleItem>
                            <SimpleItem dataField="IdCompaniaContratista" visible={false}></SimpleItem>
                            <SimpleItem dataField="IdContrato" visible={false}></SimpleItem>
                            <SimpleItem dataField="IdDivision" visible={false}></SimpleItem>

                            <Item
                                colSpan={1} dataField="Division" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.DIVISION.NAME" }), }}
                                editorOptions={{
                                    readOnly: true,
                                    hoverStateEnabled: false,
                                    inputAttr: { style: "text-transform: uppercase" },
                                    showClearButton: true,
                                    buttons: [
                                        {
                                            name: "search",
                                            location: "after",
                                            useSubmitBehavior: true,
                                            options: {
                                                stylingMode: "text",
                                                icon: "search",
                                                disabled: !props.dataRowEditNew.esNuevoRegistro,
                                                onClick: (evt) => {
                                                    setisVisiblePopUpDivision(true);
                                                },
                                            },
                                        },
                                    ],
                                }}
                            />

                            <Item
                                dataField="Activo"
                                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                                editorType="dxSelectBox"
                                isRequired={true}
                                editorOptions={{
                                    items: estadoSimple,
                                    valueExpr: "Valor",
                                    displayExpr: "Descripcion",
                                    readOnly: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                                }}
                            />
                        </GroupItem>

                
                    </Form>
                 


                      {/*******>POPUP DIVISIONES>******** */}
                      <AdministracionDivisionBuscar
                      selectData={selectDataDivisiones}
                      showPopup={{isVisiblePopUp: isVisiblePopUpDivision,setisVisiblePopUp: setisVisiblePopUpDivision}}
                      cancelarEdicion={() => setisVisiblePopUpDivision(false)}
                      />

                </React.Fragment>
            </PortletBody>
        </>
    );

};

ContratoDivisionEditPage.propTypes = {
    titulo: PropTypes.string,
    modoEdicion: PropTypes.bool,
    showButtons: PropTypes.bool,
    showAppBar: PropTypes.bool,

}
ContratoDivisionEditPage.defaultProps = {
    titulo: "",
    modoEdicion: false,
    showButtons: true,
    showAppBar: true,
}

export default injectIntl(WithLoandingPanel(ContratoDivisionEditPage));

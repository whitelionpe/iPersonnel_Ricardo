import Form, { Item, GroupItem } from "devextreme-react/form";
import React, { useEffect } from 'react';
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import { isNotEmpty } from "../../../../../_metronic";
import SimpleDropDownBoxGrid from "../../../../partials/components/SimpleDropDownBoxGrid/SimpleDropDownBoxGrid";

const ReporteIncidenciaListarFilter = ({
    intl,
    dataRowEditNew,
    companiaData,
    cmbPlanilla,
    lstZona,
    cmbIncidencia,

    setDataRowEditNew,
    setPopupVisibleUnidad,
    setPopupVisiblePersonas, 
    isActiveFilters = false,

    varIdCompania = '',
    setVarIdCompania,
    CargarPlanilla,

    incidencias,
    incidenciasSeleccionados,
    setIncidenciasSeleccionados,

    cmbTipoBusqueda,
    CargarIncidencia

}) => {
    const classesEncabezado = useStylesEncabezado();

    return (

        isActiveFilters && (
 
            <fieldset className="scheduler-border"  >
                <legend className="scheduler-border" >
                    <h5>{intl.formatMessage({ id: "ACCREDITATION.PEOPLE.GENERALDATA" })} </h5>
                </legend>
 
                <Form formData={dataRowEditNew}
                    validationGroup="FormEdicion"
                    onFieldDataChanged={(e) => {
                        const { IdCompania } = dataRowEditNew;
                        if (e.dataField == 'IdCompania') {
                            setVarIdCompania(IdCompania);
                            CargarPlanilla(IdCompania);
                            dataRowEditNew.Compania = (companiaData.filter(x => x.IdCompania === IdCompania))[0].Compania;
                        }
                    }}
                >
                    <GroupItem itemType="group" colCount={3} colSpan={1}>

                        <Item
                            dataField="IdCompania"
                            label={{
                                text: intl.formatMessage({
                                    id: "ADMINISTRATION.COMPANY.COMPANY"
                                })
                            }}
                            editorType="dxSelectBox"
                            editorOptions={{
                                items: companiaData,
                                valueExpr: "IdCompania",
                                displayExpr: "Compania",
                                showClearButton: false,
                            }}
                        />

                        <Item
                            dataField="UnidadesOrganizativasDescripcion"
                            label={{
                                text: intl.formatMessage({
                                    id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT"
                                })
                            }}
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
                                            disabled: false,
                                            onClick: () => {
                                                setPopupVisibleUnidad(true);
                                            }
                                        }
                                    }
                                ]
                            }}
                        />

                        <Item
                            dataField="IdPlanilla"
                            label={{
                                text: intl.formatMessage({
                                    id: "CONFIG.MENU.ASISTENCIA.PLANILLA"
                                })
                            }}
                            editorType="dxSelectBox"
                            editorOptions={{
                                items: cmbPlanilla,
                                showClearButton: true,
                                valueExpr: "IdPlanilla",
                                displayExpr: "Planilla"
                            }}
                        />

                        <Item
                            dataField="ListaPersonaView"
                            label={{
                                text: intl.formatMessage({
                                    id: "ADMINISTRATION.POSITION.SUBTITLE"
                                })
                            }}
                            editorOptions={{
                                hoverStateEnabled: false,
                                inputAttr: { style: "text-transform: uppercase" },
                                showClearButton: true,
                                buttons: [
                                    {
                                        name: "search",
                                        location: "after",
                                        useSubmitBehavior: true,
                                        showClearButton: true,
                                        options: {
                                            stylingMode: "text",
                                            icon: "search",
                                            disabled: false,
                                            onClick: () => {
                                                setPopupVisiblePersonas(true);
                                            }
                                        }
                                    }
                                ]
                            }}
                        />

                        <Item
                            dataField="FechaInicio"
                            label={{
                                text: intl.formatMessage({
                                    id: "ACCESS.PERSON.MARK.STARTDATE"
                                })
                            }}
                            editorType="dxDateBox"
                            dataType="datetime"
                            editorOptions={{
                                inputAttr: { style: "text-transform: uppercase" },
                                displayFormat: "dd/MM/yyyy"
                            }}
                        />

                        <Item
                            dataField="FechaFin"
                            label={{
                                text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" })
                            }}
                            editorType="dxDateBox"
                            dataType="datetime"
                            editorOptions={{
                                inputAttr: { style: "text-transform: uppercase" },
                                displayFormat: "dd/MM/yyyy"
                            }}
                        />

                        <Item
                            dataField="Incidencias"
                        >
                            <SimpleDropDownBoxGrid
                                ColumnDisplay={"Incidencia"}
                                placeholder={intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.JUSTIFICATION.MASSIVE.SELECT_TEXT" })}
                                SelectionMode="multiple"
                                dataSource={cmbIncidencia}  //cmbIncidencia -->incidencias
                                Columnas={[{ dataField: "Incidencia", caption: intl.formatMessage({ id: "ASSISTANCE.INCIDENCE.INCIDENCE" }), width: '100%' }]}
                                setSeleccionados={setIncidenciasSeleccionados}
                                Seleccionados={incidenciasSeleccionados}
                                pageSize={10}
                                pageEnabled={true}
                            />
                        </Item>


                    </GroupItem>

                    {/* <GroupItem name="grupo_pasajeros" colCount={1} colSpan={3}>
                <Item>
                    <AppBar
                        position="static"
                        className={classesEncabezado.secundario}
                    >
                        <Toolbar
                            variant="dense"
                            className={classesEncabezado.toolbar}
                        >
                            <Typography
                                variant="h6"
                                color="inherit"
                                className={classesEncabezado.title}
                            >
                                {intl.formatMessage({
                                    id: "CONFIG.MENU.ASISTENCIA.INCIDENCIAS"
                                })}
                            </Typography>
                        </Toolbar>
                    </AppBar>
                </Item>
            </GroupItem> */}
                </Form >
            </fieldset>

        )


    );
};

export default ReporteIncidenciaListarFilter;
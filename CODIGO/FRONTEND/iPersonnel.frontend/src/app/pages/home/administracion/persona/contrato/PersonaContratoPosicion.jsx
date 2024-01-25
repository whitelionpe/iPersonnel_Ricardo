import { Form, GroupItem, Item } from 'devextreme-react/form';
import React from 'react';
import PersonaContratoPosicionDetalle from './PersonaContratoPosicionDetalle';
import { isNotEmpty, listarEstadoSimple } from "../../../../../../_metronic/utils/utils";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";


const PersonaContratoPosicion = ({
    intl,
    modoEdicion,
    dataRowEditNew,
    ocultarEdit,
    cmbFuncion,
    cmbTipoPosicion,
    estadoSimple,
    isRequired,
    isModified,
    settingDataField,
    setFiltroLocal,
    setPopupVisiblePosicion,

}) => {

    const eventClickViewPosition = () => {
        const { IdDivision, IdUnidadOrganizativa,
            IdFuncion, IdTipoPosicion, IdCompaniaContratista } = dataRowEditNew;

        if (!isNotEmpty(IdCompaniaContratista)) { handleInfoMessages(intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONTRACT.COMPANY.MSGERROR" })); return; }
        if (!isNotEmpty(IdDivision)) { handleInfoMessages(intl.formatMessage({ id: "ACREDITATION.AUTORIZATOR.MUST.DIVISION.MSG" })); return; }
        if (!isNotEmpty(IdUnidadOrganizativa)) { handleInfoMessages(intl.formatMessage({ id: "ACCREDITATION.COMPANY.DATA.UO" })); return; }
        // if (!isNotEmpty(IdFuncion)) { handleInfoMessages("Seleccione una Función"); return; }
        // if (!isNotEmpty(IdTipoPosicion)) { handleInfoMessages("Seleccione un Tipo Posición"); return; }
        setFiltroLocal(prev => ({
            IdDivision,
            IdUnidadOrganizativa: '',//->Ya no se busca por unidad organizativa
            IdFuncion: '',//->Ya no se busca por función
            IdTipoPosicion,
            IdCompania: IdCompaniaContratista,
            FlgContratista: dataRowEditNew.FlgContratista === 'N'
        }));
        setPopupVisiblePosicion(true);
    }

    return (<> 
        <Form formData={dataRowEditNew} validationGroup="FormEdicion">

            <GroupItem itemType="group" colCount={2} >


                <Item
                    dataField="IdTipoPosicion"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.POSITIONTYPE" }) }}
                    isRequired={false}
                    editorType="dxSelectBox"
                    editorOptions={{
                        items: cmbTipoPosicion,
                        valueExpr: "IdTipoPosicion",
                        displayExpr: "TipoPosicion",
                        showClearButton: true,
                        readOnly: ocultarEdit ? true : !modoEdicion

                    }}
                />

                <Item
                    dataField="Posicion"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION" }) }}
                    isRequired={modoEdicion ? isRequired('Posicion', settingDataField) : false}
                    editorOptions={{
                        readOnly: true,
                        hoverStateEnabled: false,
                        inputAttr: { 'style': 'text-transform: uppercase' },
                        showClearButton: true,
                        buttons: [{
                            name: 'search',
                            location: 'after',
                            useSubmitBehavior: true,
                            options: {
                                stylingMode: 'text',
                                icon: 'search',
                                // disabled: !modoEdicion, 
                                disabled: ocultarEdit ? true : !modoEdicion,
                                onClick: eventClickViewPosition,
                            }
                        }]
                    }}
                />
                {/* //!(modoEdicion && dataRowEditNew.esNuevoRegistro),
                JDL->2022-07-15: Boroo no define una función, tampoco gerarquia multiple niveles.
                 <Item
                    dataField="IdFuncion"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.FUNCTION" }) }}
                    editorType="dxSelectBox"
                    isRequired={false}
                    editorOptions={{
                        items: cmbFuncion,
                        valueExpr: "IdFuncion",
                        displayExpr: "Funcion",
                        showClearButton: true,
                        readOnly: !(modoEdicion && dataRowEditNew.esNuevoRegistro)
                    }}
                />  <Item/>
                */}

                <GroupItem itemType="group" colCount={2} colSpan={2}>
                    <GroupItem colSpan={2} >
                        <fieldset className="scheduler-border" >
                            <legend className="scheduler-border" >
                                <h5>{intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONTRACT.POSITION.TITLE" })} </h5>
                            </legend>
                            <PersonaContratoPosicionDetalle
                                intl={intl}
                                dataRowEditNew={dataRowEditNew} />
                        </fieldset>
                    </GroupItem>
                </GroupItem>

            </GroupItem>
        </Form>
    </>
    );
};

export default PersonaContratoPosicion;

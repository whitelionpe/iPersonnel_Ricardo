import React, { useEffect, useState, Fragment } from "react";
import Form, { Item, GroupItem, EmptyItem } from "devextreme-react/form";
import {isNotEmpty,listarTipoAccionTransporte } from "../../../../../../_metronic/utils/utils";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

const PersonalEmbarqueFilter = (props) => {

    const { intl, setLoading } = props;
    const filterData = props.filterData;
    const setFilterData = props.setFilterData;

    const [isVisiblePopUpCompania, setisVisiblePopUpCompania] = useState(false);

    const appBarForm = { marginBottom: "10px", padding: "10px" };

    const selectCompania = (data) => {
        // console.log("agregarCompaniaAdministrador", data);
        if (data.length > 0) {
            let { IdCompania, Compania } = data[0];
            let datos = { ...filterData, IdCompania, Compania };
            setFilterData(datos);
        }
        setisVisiblePopUpCompania(false);
    }

    return (
        <Fragment>

            <Form formData={filterData} style={appBarForm} validationGroup="FormEdicion" >

                <GroupItem itemType="group" colCount={3}>
                    <Item
                        dataField="Compania"
                        label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
                        editorOptions={{
                            hoverStateEnabled: false,
                            inputAttr: { style: "text-transform: uppercase" },
                            showClearButton: true,
                            readOnly: true,
                            buttons: [{
                                name: "search",
                                location: "after",
                                useSubmitBehavior: true,
                                options: {
                                    stylingMode: "text",
                                    icon: "search",
                                    disabled: true,
                                    onClick: (evt) => {
                                        setisVisiblePopUpCompania(true);
                                    },
                                },
                            }]
                        }}
                    />
                    <Item dataField="Fecha"
                  label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.DATE" }) }}
                  editorType="dxDateBox"
                        editorOptions={{
                            type: "date",
                            showClearButton: true,
                            displayFormat: "dd/MM/yyyy",
                        }}
                    />
                    <Item dataField="Accion"
                        label={{ text: "Acción" }}
                        editorType="dxSelectBox"
                        isRequired={true}
                        editorOptions={{
                            items: listarTipoAccionTransporte(),
                            valueExpr: "Valor",
                            displayExpr: "Descripcion",
                            showClearButton: true,
                        }}
                    />
                    <EmptyItem />
                </GroupItem>
            </Form>

       {/*******>POPUP DE COMPANIAS>******** */}
         {isVisiblePopUpCompania && (
          <AdministracionCompaniaBuscar
            selectData={selectCompania} 
            showPopup={{ isVisiblePopUp: isVisiblePopUpCompania, setisVisiblePopUp: setisVisiblePopUpCompania }}
            cancelarEdicion={() => setisVisiblePopUpCompania(false)}
            uniqueId={"administracionCompaniaBuscarReporte002"}
            />
        )}

        </Fragment>
    );
};
export default injectIntl(WithLoandingPanel(PersonalEmbarqueFilter));


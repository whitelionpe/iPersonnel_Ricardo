import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem, Button as ColumnButton, } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

const ProteccionDatosListPage = props => {
    const { intl } = props;

    const cargarProteccionDatos = evt => {
        props.cargarProteccionDatos(evt.row.data); 
    };

    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }

    return (
        <>
            <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
                toolbar={

                    <PortletHeader
                        title=""
                        toolbar={
                            <PortletHeaderToolbar>
                                <PortletHeaderToolbar>
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

                } />


            <PortletBody>
                <DataGrid
                    dataSource={props.usuarioPerfilData}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onCellPrepared={onCellPrepared}
                >                  
                    <Column dataField="IdAplicacion" visible={false} width={"20%"} />
                    <Column dataField="Modulo" caption={intl.formatMessage({ id: "SECURITY.PROFILE.MENU.MODULE" })} width={"20%"} />
                    <Column dataField="Aplicacion" caption={intl.formatMessage({ id: "SECURITY.PROFILE.MENU.APLICATION" })} width={"40%"} />
                    <Column dataField="CantProtecion" caption={intl.formatMessage({ id: "SECURITY.DATAPROTECTION.CANT" })} alignment={"center"} width={"40%"} />

                    <Column type="buttons" width={95} visible={props.showButtons} >
                        <ColumnButton icon="fields" hint={intl.formatMessage({ id: "SECURITY.DATAPROTECTION.ADD", })} onClick={cargarProteccionDatos} />7
                    </Column>


                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Modulo"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>
            </PortletBody>
        </>
    );
};

ProteccionDatosListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
};
ProteccionDatosListPage.defaultProps = {
    showHeaderInformation: true,
};
export default injectIntl(ProteccionDatosListPage);

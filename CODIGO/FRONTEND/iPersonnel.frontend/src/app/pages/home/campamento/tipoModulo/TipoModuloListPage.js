import React, { useEffect, useState, useRef } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { isNotEmpty } from "../../../../../_metronic";
import { DataGrid, Column, Editing, Summary, TotalItem, MasterDetail } from "devextreme-react/data-grid";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import PropTypes from "prop-types";

import { listarReporte } from '../../../../api/campamento/tipoModulo.api';


const TipoModuloListPage = props => {

    const { intl, focusedRowKey, accessButton } = props;
    const dataGridRef = useRef(null);

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    }

    const seleccionarRegistro = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
    }

    const seleccionarRegistroDblClick = evt => {
        if (evt.data === undefined) return;
        if (isNotEmpty(evt.data)) {
            props.verRegistroDblClick(evt.data);
        };
    }

    const textEditing = {
        confirmDeleteMessage: '',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    
    function onCellPrepared(e) {
        if (e.rowType === 'data') {           
                e.cellElement.style.color = e.data.Activo === 'N' ?'red':'';
            
        }
    }


    //***Reporte
  /*   const seleccionarReporte = evt => {
        props.seleccionarReporte(evt);
    }; */

    useEffect(() => {

    }, []);

    return (
        <>
            <PortletHeader
                title={intl.formatMessage({ id: "ACTION.LIST" })}
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <Button
                                disabled={!accessButton.nuevo}
                                icon="plus"
                                type="default"
                                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                onClick={props.nuevoRegistro} />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <DataGrid
                    id="dg-tipoModulo"
                    dataSource={props.TipoModuloData}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    // onRowDblClick={seleccionarRegistroDblClick}
                    focusedRowKey={focusedRowKey}
                    onCellPrepared={onCellPrepared}
                    ref={dataGridRef}
                    repaintChangesOnly={true}
                >
                    <Editing
                        mode="row"
                        useIcons={props.showButtons}
                        allowUpdating={props.showButtons}
                        allowDeleting={props.showButtons}
                        texts={textEditing}
                    />
                    {/* <Column dataField="RowIndex"   caption="#" width={"7%"} visible={true} alignment={"center"} /> */}
                    <Column dataField="IdTipoModulo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} alignment={"center"} />
                    <Column dataField="TipoModulo" caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })} width={"40%"} />
                    <Column dataField="NumeroModuloTotal" caption={intl.formatMessage({ id: "CAMP.CAMP.MODULES" })} width={"10%"} alignment={"center"} format="#,###"/>
                    <Column dataField="NumeroHabitacionTotal" caption={intl.formatMessage({ id: "CAMP.CAMP.BEDROOMS" })} width={"10%"} alignment={"center"} format="#,###"/>
                    <Column dataField="NumeroHabitacionCamaTotal" caption={intl.formatMessage({ id: "CAMP.CAMP.BEDS" })} width={"10%"} alignment={"center"} format="#,###"/>
                    <Column dataType="boolean" dataField="Activo" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdTipoModulo"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        //alignment={"left"} 
                        />
                    </Summary>

                    <MasterDetail enabled={true} component={(dta) => (ReporteListPage({ data: dta.data, intl}))} />

                </DataGrid>
            </PortletBody>
        </>
    );
};

TipoModuloListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
    showButtons: PropTypes.bool,
    modoEdicion: PropTypes.bool
};
TipoModuloListPage.defaultProps = {
    showHeaderInformation: true,
    showButtons: true,
    modoEdicion: true
};

//REPORTE
const ReporteListPage = props => {

    const { intl } = props;

    const [dataSource, setDataSource] = useState([]);
    const [focusedRowKeyReporte, setFocusedRowKeyReporte] = useState();
    const splashScreen = document.getElementById("splash-screen");




    async function listarReporteTipoModulo(dataRow) {
        //console.log("listarReporteTipoModulo",dataRow);
        splashScreen.classList.remove("hidden");
        const { IdCliente, IdDivision, IdTipoModulo } = dataRow;
        if (isNotEmpty(IdTipoModulo)) {
            let params = { IdCliente, IdDivision, IdTipoModulo };
            await listarReporte(params).then((data) => {
                setDataSource(data);
                getRowFocus();
            }).finally(() => { splashScreen.classList.add("hidden"); });
        }
    }

    const getRowFocus = () => {
        let dataRow = JSON.parse(localStorage.getItem('dataRowReporte'));
        if (isNotEmpty(dataRow)) {
            const { RowIndex } = dataRow;
            setFocusedRowKeyReporte(RowIndex);
        }
    }

    useEffect(() => {
        listarReporteTipoModulo(props.data.data);

    }, []);

    return (

        <>
            <div className="grid_detail_title">
                    Detalle
                </div>
            <DataGrid
                id="dg-reporte"
                dataSource={dataSource}
                showBorders={true}
                columnAutoWidth={true}
            >
                <Editing
                    mode="row"
                />
                <Column dataField="Campamento" caption={intl.formatMessage({ id: "CAMP.CAMP.HOTELS" })} width={"70%"} />
                <Column dataField="NumeroModulo" caption={intl.formatMessage({ id: "CAMP.CAMP.MODULES" })} width={"10%"} alignment={"center"} format="#,###"/>
                <Column dataField="NumeroHabitacion" caption={intl.formatMessage({ id: "CAMP.CAMP.BEDROOMS" })} width={"10%"} alignment={"center"} format="#,###"/>
                <Column dataField="NumeroHabitacionCama" caption={intl.formatMessage({ id: "CAMP.CAMP.BEDS" })} width={"10%"} alignment={"center"} format="#,###"/>

                <Summary>
                    <TotalItem cssClass="classColorPaginador_" column="Campamento" displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL" })}`} />
                    <TotalItem cssClass="classColorPaginador_" column="NumeroModulo" summaryType="sum" displayFormat={`{0}`} valueFormat={"#,###"} alignment={"center"} />
                    <TotalItem cssClass="classColorPaginador_" column="NumeroHabitacion" summaryType="sum" displayFormat={`{0}`} valueFormat={"#,###"} alignment={"center"} />
                    <TotalItem cssClass="classColorPaginador_" column="NumeroHabitacionCama" summaryType="sum" displayFormat={`{0}`} valueFormat={"#,###"} alignment={"center"} />
                </Summary>
            </DataGrid>

        </>
    );
};


export default injectIntl(WithLoandingPanel(TipoModuloListPage));

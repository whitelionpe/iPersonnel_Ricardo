import React, { useEffect, useState } from "react";
//import { useSelector } from "react-redux";
import { DataGrid, Column, Editing, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { NivelesUbicacionPais, isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types";

// .::: Filtro CustonDataGrid Ini :::.
import CustomDataGrid from "../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { storeListar as loadUrl } from "../../../../api/administracion/ubigeo.api";
import { initialFilter } from "./UbigeoIndexPage"
import { GroupItem, Item } from "devextreme-react/form";
import { useSelector } from "react-redux";
// .::: Filtro CustonDataGrid End :::.

const UbigeoListPage = props => {

    const { intl, accessButton } = props;
    const [paises, setPaises] = useState([]);
    const perfil = useSelector(state => state.perfil.perfilActual);
    // console.log("****************perfil.IdPais :> ", perfil.IdPais);
    // const [idPaisActual, setIdPaisActual] = useState(props.idPaisActual);
    // console.log("****************idPaisActual :> ", idPaisActual);
    const [ubicacion, setUbicacion] = useState({
        Nivel1: intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.DEPARTAMENT" }),
        Nivel2: intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.PROVINCE" }),
        Nivel3: intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.DISTRIC" })
    })

    const [depa, setDepa] = useState("XXX d");

    // .::: Filtro CustonDataGrid Ini :::.
    const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
    const [filterData, setFilterData] = useState({ ...initialFilter, IdPais: perfil.IdPais });
    // --PAGINATION--
    const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
    const resetLoadOptions = props.resetLoadOptions;

    const keysToGenerateFilter = [
        "IdUbigeo",
        "Pais",
        "Departamento",
        "Provincia",
        "Distrito",
        "Activo",
        "IdPais"
    ];
    // .::: Filtro CustonDataGrid End :::.

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
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }

    useEffect(() => { 
        if (isNotEmpty(props.idPaisActual)) {
            var ress = NivelesUbicacionPais().find(x => x.Pais == props.idPaisActual); 
            setUbicacion({
                Nivel1: ress.Ubicacion.Nivel1,
                Nivel2: ress.Ubicacion.Nivel2,
                Nivel3: ress.Ubicacion.Nivel3
            });
        }
    }, [props.idPaisActual])

    // .::: Filtro CustonDataGrid Ini :::.
    useEffect(() => {
        if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
    }, [ifThereAreNoChangesLoadFromStorage])

    useEffect(() => {
        if (props.refreshData) {
            props.refresh();
            props.setRefreshData(false);
        }
    }, [props.refreshData]);


    const renderFormContentCustomFilter = ({ getInstance }) => {
        return (
            true && (
                <GroupItem colSpan={2} colCount={2}>
                    <GroupItem itemType="group" >
                        <Item
                            dataField="IdPais"
                            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COUNTRY" }) }}
                            editorType="dxSelectBox"
                            editorOptions={{
                                items: props.paisData,
                                valueExpr: "IdPais",
                                value: props.idPaisActual,
                                displayExpr: "Pais",
                                onValueChanged: (e) => {
                                    props.setIdPaisActual(e.value);
                                    getInstance().filter();
                                    // var company = companiaData.filter(x => x.IdCompania === e.value);
                                    // getCompanySeleccionada(e.value, company);
                                    // setFocusedRowKey(); 
                                },
                            }}
                        />
                    </GroupItem>
                </GroupItem>
            )
        )
    };

    const renderDataGrid = ({ gridRef, dataSource }) => {

        if (dataSource._storeLoadOptions.filter !== undefined) {
            if (props.totalRowIndex === 0) {
                props.setTotalRowIndex(dataSource._totalCount);
            }
            if (dataSource._totalCount != props.totalRowIndex) {
                if (dataSource._totalCount != -1) {
                    props.setVarIdUbigeo("")
                    props.setFocusedRowKey();
                    props.setTotalRowIndex(dataSource._totalCount);
                }
            }
        }
        return (
            <DataGrid
                dataSource={dataSource}
                ref={gridRef}

                showBorders={true}
                focusedRowEnabled={true}
                //keyExpr="IdUbigeo"
                onCellPrepared={onCellPrepared}
                onEditingStart={editarRegistro}
                onRowRemoving={eliminarRegistro}
                onFocusedRowChanged={seleccionarRegistro}
                onRowDblClick={seleccionarRegistroDblClick}
                focusedRowKey={props.focusedRowKey}
                allowColumnReordering={true}
                allowColumnResizing={true}
                columnAutoWidth={true} 
                noDataText={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA" })} 
            // repaintChangesOnly={true}
            >
                <Editing mode="row"
                    useIcons={true}
                    allowUpdating={true}
                    allowDeleting={true}
                    /* allowUpdating={accessButton.editar}
                    allowDeleting={accessButton.eliminar} */
                    texts={textEditing} />
                <FilterRow visible={true} showOperationChooser={false} />
                <HeaderFilter visible={false} />
                <FilterPanel visible={false} />
                <Column
                    dataField="RowIndex"
                    caption="#"
                    allowSorting={false}
                    allowFiltering={false}
                    allowHeaderFiltering={false}
                    width={"7%"}
                    alignment={"center"} />

                <Column dataField="IdUbigeo"
                    caption={intl.formatMessage({ id: "COMMON.CODE" })}
                    width={"8%"}
                    alignment={"center"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                />
                <Column dataField="Departamento"
                    caption={ubicacion.Nivel1}
                    width={"20%"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                />
                <Column dataField="Provincia"
                    caption={ubicacion.Nivel2}
                    width={"20%"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                />
                <Column dataField="Distrito"
                    caption={ubicacion.Nivel3}
                    width={"20%"}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                />
                <Column dataType="boolean"
                    caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
                    calculateCellValue={obtenerCampoActivo}
                    width={"10%"}
                    allowSorting={false}
                    allowHeaderFiltering={false}
                />
                <Column dataField="Pais"
                    caption={intl.formatMessage({ id: "ADMINISTRATION.UBIGEO.COUNTRY" })}
                    width={"18%"}
                    visible={false}
                    allowSorting={true}
                    allowHeaderFiltering={false}
                />

            </DataGrid>
        );
    };
    // .::: Filtro CustonDataGrid End :::.

    return (
        <>
            <PortletHeader
                title={intl.formatMessage({ id: "ACTION.LIST" })}
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <Button
                                icon="plus"
                                type="default"
                                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                onClick={props.nuevoRegistro}
                            //disabled={!accessButton.nuevo}
                            />
                            &nbsp;
                            <Button
                                icon="refresh"
                                type="default"
                                hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                                disabled={customDataGridIsBusy}
                                onClick={resetLoadOptions}
                            />
                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />

            <PortletBody>

                <CustomDataGrid
                    showLog={false}
                    uniqueId={props.uniqueId}
                    dataSource={props.dataSource}
                    rowNumberName="RowIndex"
                    loadWhenStartingComponent={props.isFirstDataLoad && !props.refreshData}
                    renderDataGrid={renderDataGrid}
                    loadUrl={loadUrl}
                    forceLoad={forceLoadTypes.Unforced}
                    sendToServerOnlyIfThereAreChanges={true}
                    ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
                    caseSensitiveWhenCheckingForChanges={true}
                    uppercaseFilterRow={true} 
                    initialLoadOptions={{
                        currentPage: 1,
                        pageSize: 20,
                        sort: { column: "Departamento", order: "asc" },
                    }}
                    filterRowSize="sm"
                    summaryCountFormat={`${intl.formatMessage({
                        id: "COMMON.TOTAL.ROW",
                    })} {0} de {1} `}
                    // CUSTOM FILTER
                    visibleCustomFilter={true}
                    renderFormContentCustomFilter={renderFormContentCustomFilter}
                    keysToGenerateFilter={keysToGenerateFilter}
                    filterData={filterData}
                    // PAGINATION
                    paginationSize="md"
                    // EVENTS
                    onLoading={() => setCustomDataGridIsBusy(true)}
                    onError={() => setCustomDataGridIsBusy(false)}
                    onLoaded={() => setCustomDataGridIsBusy(false)}
                />

            </PortletBody>
        </>
    );
};

UbigeoListPage.propTypes = {
    uniqueId: PropTypes.string,
};
UbigeoListPage.defaultProps = {
    uniqueId: "ListarUbigeo",
};

export default injectIntl(UbigeoListPage);

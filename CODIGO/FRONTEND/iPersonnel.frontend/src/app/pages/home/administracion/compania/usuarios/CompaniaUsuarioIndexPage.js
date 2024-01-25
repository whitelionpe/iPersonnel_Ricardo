import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Tooltip from '@material-ui/core/Tooltip';
import {
    DataGrid,
    Column,
    Editing,
    FilterRow,
    HeaderFilter,
    FilterPanel,
    Button as ColumnButton
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

import {
    PortletBody,
    PortletHeader,
    PortletHeaderToolbar,
} from "../../../../../partials/content/Portlet";
import { DoubleLinePersona } from "../../../../../partials/content/Grid/DoubleLineLabel";
import { isNotEmpty, toAbsoluteUrl, listarEstadoSimple, clasificarCompania } from "../../../../../../_metronic";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";

import { storeListarUsuarioCompania as loadUrl } from "../../../../../api/administracion/compania.api";

export const initialFilter = {
    Activo: 'S',
    IdCliente: '',
    IdUsuario: '',
    IdPerfil: '',
    IdModulo: '',
    IdAplicacion: '',
    Contratista: ''
};

const CompaniaUsuarioIndexPage = (props) => {

    const { intl, setLoading } = props;

    const { IdCompania, Compania } = props.selectedCompania;
    const { IdCliente, IdDivision } = useSelector((state) => state.perfil.perfilActual);

    //-CustomerDataGrid-Variables-ini->
    const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
    const [filterData,] = useState({ ...initialFilter, IdCliente, IdCompania: IdCompania });
    const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
    const resetLoadOptions = props.resetLoadOptions;

    const [isVisiblePopUpCompaniaContratista, setisVisiblePopUpCompaniaContratista] = useState(false);

    const eliminarRegistro = (evt) => {
        props.eliminarRegistro(evt.row.data);
    };

    const obtenerCampoActivo = (rowData) => {
        return rowData.Activo === "S";
    };

    const cellRenderContratista = (rowData) => {
        if (rowData && rowData.data) {
            const { Contratista, IdPersona } = rowData.data;

            if (Contratista === "S") {
                return <>
                    <i className="fas fa-circle  text-success icon-5x" >  &nbsp; {intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" }).toUpperCase() + "- " + IdPersona} </i>
                </>
            }
            else if (Contratista === "N") {
                return <>
                    <i className="fas fa-circle  text-info icon-5x" >  &nbsp; {intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" }).toUpperCase() + "- " + IdPersona}  </i>
                </>
            } else {
                return <span></span>
            }
        }
    };

    const seleccionarUsuario = (evt) => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarUsuario(evt.row.data);
    };

    const seleccionarRegistroDblClick = evt => {
        if (evt.data === undefined) return;
        if (isNotEmpty(evt.data)) {
            props.verRegistroDblClick(evt.data);
        };
    }

    function onCellPrepared(e) {
        if (e.rowType === "data") {
            if (e.data.Activo === "N") {
                e.cellElement.style.color = "red";
            }
        }
    }

    const selectCompaniaContratista = dataPopup => {
        const { IdCompania, Compania } = dataPopup[0];
        props.dataSource.loadDataWithFilter({ data: { IdCompania, Compania } })
        setisVisiblePopUpCompaniaContratista(false);
    }

    useEffect(() => {
        if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
    }, [ifThereAreNoChangesLoadFromStorage])

    useEffect(() => {
        if (props.refreshData) {
            props.refresh();
            props.setRefreshData(false);
        }
    }, [props.refreshData]);

    //MOSTRAT MODAL
    const mostrarPopUpPerfiles = evt => {
        props.mostrarPopUpPerfiles(evt.row.data);
    }

    //DETECTAR EL FILTRO QUE CARGA CUANDO HAY CAMBIO EN EL IdCompania
    useEffect(() => {
        if (isNotEmpty(IdCompania)) {
            setTimeout(() => {
                props.dataSource.loadDataWithFilter({ data: { IdCliente, IdCompania } });
            }, 500)
        }
    }, [IdCompania]);

    //-CustomerDataGrid-Filter
    const keysToGenerateFilter = [
        'IdCliente',
        'IdPerfil',
        'IdUsuario',
        'NombreCompleto',
        'Documento',
        'ConfiguracionLogeo',
        'Contratista',
        'Activo',
        'IdModulo',
        'IdAplicacion',
        'Correo',
        'IdCompania'
    ];

    const renderDataGrid = ({ gridRef, dataSource }) => {
        if (dataSource._storeLoadOptions.filter !== undefined) {
            if (props.totalRowIndex === 0) {
                props.setTotalRowIndex(dataSource._totalCount);
            }
            if (dataSource._totalCount != props.totalRowIndex) {
                if (dataSource._totalCount != -1) {
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
                keyExpr="RowIndex"
                // onEditingStart={editarRegistro}
                // onRowRemoving={eliminarRegistro}
                onFocusedRowChanged={seleccionarUsuario}
                focusedRowKey={props.focusedRowKey}
                onRowDblClick={seleccionarRegistroDblClick}
                onCellPrepared={onCellPrepared}
                repaintChangesOnly={true}
                allowColumnReordering={true}
                allowColumnResizing={true}
                columnAutoWidth={true}
            >
                <Editing
                    mode="row"
                    useIcons={true}
                />
                <FilterRow visible={true} showOperationChooser={false} />
                <Column
                    dataField="IdUsuario"
                    caption={intl.formatMessage({ id: "SECURITY.USER.IDENTIFIER" })}
                    width={"18%"}
                    allowSorting={true}
                    allowSearch={true}
                    allowFiltering={true}
                />
                <Column
                    dataField="NombreCompleto"
                    caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
                    width={"23%"}
                    cellRender={DoubleLinePersona}
                    allowSorting={true}
                    allowSearch={true}
                    allowFiltering={true}
                />
                <Column
                    dataField="TipoDocumento"
                    caption={intl.formatMessage({
                        id: "COMMON.TYPE",
                    })}
                    width={"8%"}
                    alignment={"center"}
                    allowSearch={false}
                    allowFiltering={false}
                />
                <Column
                    dataField="Documento"
                    caption={intl.formatMessage({ id: "SECURITY.USER.DOCUMENTNUMBER" })}
                    allowSorting={true}
                    allowFiltering={true}
                    allowHeaderFiltering={false}
                    alignment={"left"}
                    width={"12%"}
                />
                <Column
                    dataField="Correo"
                    caption={intl.formatMessage({
                        id: "SECURITY.USER.MAIL",
                    })}
                    width={"25%"}
                    allowSorting={true}
                    allowSearch={true}
                    allowFiltering={true}
                />
                <Column
                    dataField={"Contratista"}
                    caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.CONTRACTOR" })}
                    cellRender={cellRenderContratista}
                    width={"10%"}
                    alignment={"left"}
                    allowSorting={true}
                    allowSearch={false}
                    allowFiltering={false}
                />

                <Column
                    dataType="boolean"
                    caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
                    calculateCellValue={obtenerCampoActivo}
                    width={"7%"}
                    allowSorting={false}
                    allowFiltering={false}
                />
                <Column type="buttons" visible={true}>
                    <ColumnButton
                        icon="plus"
                        hint={intl.formatMessage({ id: "SYSTEM.TEAM.ASSIGNMENT" })}
                        onClick={mostrarPopUpPerfiles}
                    />
                    <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
                </Column>
            </DataGrid>
        );
    }

    return (
        <>
            <HeaderInformation
                data={props.getInfo()}
                visible={true}
                labelLocation={'left'}
                colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <Button
                                    icon="plus"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                    onClick={props.nuevoRegistroUsuario}
                                    disabled={customDataGridIsBusy}
                                />
                                &nbsp;
                                <Button icon="refresh"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                                    disabled={customDataGridIsBusy}
                                    onClick={resetLoadOptions} />
                            </PortletHeaderToolbar>
                        }
                    />
                }
            />
            <PortletBody>

                <CustomDataGrid
                    showLog={false}
                    uniqueId={props.uniqueId} //'posicionesList'
                    dataSource={props.dataSource}
                    rowNumberName='RowIndex'
                    // loadWhenStartingComponent={props.isFirstDataLoad && !props.refreshData}
                    renderDataGrid={renderDataGrid}
                    loadUrl={loadUrl}
                    
                    forceLoad={forceLoadTypes.Unforced}
                    sendToServerOnlyIfThereAreChanges={true}
                    ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
                    caseSensitiveWhenCheckingForChanges={true}

                    uppercaseFilterRow={true}
                    initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'NombreCompleto', order: 'asc' } }}
                    filterRowSize='sm'
                    summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
                    // CUSTOM FILTER
                    // visibleCustomFilter={isActiveFilters}
                    // renderFormContentCustomFilter={renderFormContentCustomFilter}
                    keysToGenerateFilter={keysToGenerateFilter}
                    filterData={filterData}
                    // PAGINATION
                    paginationSize='md'
                    // EVENTS
                    onLoading={() => setCustomDataGridIsBusy(true)}
                    onError={() => setCustomDataGridIsBusy(false)}
                    onLoaded={() => setCustomDataGridIsBusy(false)}
                />
            </PortletBody>

            {/* PopUp Compañia */}
            {isVisiblePopUpCompaniaContratista && (
                <AdministracionCompaniaBuscar
                    selectData={selectCompaniaContratista}
                    showPopup={{ isVisiblePopUp: isVisiblePopUpCompaniaContratista, setisVisiblePopUp: setisVisiblePopUpCompaniaContratista }}
                    cancelarEdicion={() => setisVisiblePopUpCompaniaContratista(false)}
                    uniqueId={"UsuariosListPage"}
                    isContratista={"S"}
                />
            )}

        </>
    );
};

CompaniaUsuarioIndexPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
    titulo: PropTypes.string,
    modoEdicion: PropTypes.bool,
    showButtons: PropTypes.bool,
};
CompaniaUsuarioIndexPage.defaultProps = {
    showHeaderInformation: false,
    titulo: "",
    modoEdicion: false,
    showButtons: true,

};

export default injectIntl(CompaniaUsuarioIndexPage);

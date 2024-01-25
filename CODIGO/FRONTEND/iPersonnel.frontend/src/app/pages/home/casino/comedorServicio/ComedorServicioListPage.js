import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { DataGrid, Button as ColumnButton, Column, Editing, MasterDetail, Selection,Summary, TotalItem  } from "devextreme-react/data-grid";

import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import PropTypes from "prop-types";

import {
    listar as listarCSC
} from "../../../../api/casino/comedorServicioCosto.api";

const ComedorServicioListPage = props => {

    const { intl, accessButton } = props;

    // var saleAmountFormat = { style: 'currency', currency: 'PEN', useGrouping: true, minimumSignificantDigits: 3 };

    const editarRegistro = evt => {
        props.editarRegistro(evt.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.data);
    };

    const nuevoComedorServicioCosto = evt => {
        props.nuevoComedorServicioCosto(evt.row.data);
    };

    const obtenerCampoEspecial = rowData => {
        return rowData.Especial === "S";
    }
    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    }

    const seleccionarComedorServicio = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarComedorServicio(evt.row.data);

    };

    const textEditing = {
        confirmDeleteMessage:'',
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


    function onRowExpanding(e) {
     if(props.allowDeploy)
     {
        //  props.expandRow.setExpandRow(e.key);
        props.collapsedRow.setCollapsed(false);
        e.component.collapseAll(-1);
        return;
     }
    }

    function onRowCollapsed(e) {
        if(props.allowDeploy)
        {

        props.collapsedRow.setCollapsed(true);
        e.component.collapseRow(e.key);
        return;
       }
    }

    function contentReady(e) {
     if(props.allowDeploy)
      {
        if (!props.collapsedRow.collapsed) {
            e.component.expandRow(props.expandRow.expandRow);
        }
        return;
       }
    }

        //*******************-Eventos de Aplicación-**************************/
        const seleccionarComedorServicioCosto = evt => {
            props.seleccionarComedorServicioCosto(evt);
        };
    
        const editarComedorServicioCosto = evt => {
            props.editarComedorServicioCosto(evt);
        };
    
        const eliminarComedorServicioCosto = evt => {
            props.eliminarComedorServicioCosto(evt);
        };

        const verRegistroDblClickDetail = evt =>{
            props.verRegistroDblClickDetail(evt);

        }
    


    return (
        <>
            <HeaderInformation data={props.getInfo()}  visible={true}  labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <Button
                                    icon="plus"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                    onClick={props.nuevoRegistro}
                                    disabled={!accessButton.nuevo}
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
                <DataGrid
                    id="datagrid-modulo"
                    keyExpr="RowIndex"
                    dataSource={props.comedoresServicio}
                    showBorders={true}
                    focusedRowEnabled={true}
                    focusedRowKey={props.focusedRowKeyComedorServicio}
                    onFocusedRowChanged = { seleccionarComedorServicio }
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    //onCellPrepared={onCellPrepared}

                     //onRowExpanding={onRowExpanding}
                    // onRowCollapsed={onRowCollapsed}
                     //onContentReady={contentReady}

                     repaintChangesOnly={true}
                >


                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={accessButton.editar}
                        allowDeleting={accessButton.eliminar}
                        texts={textEditing}
                    />

                    <Selection mode="single" />

                    <Column dataField="IdServicio" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} alignment={"center"}/>
                    <Column dataField="Servicio" caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE" })} width={"25%"} />
                    <Column dataField="Costo"
                            dataType="number"
                             format={props.formatCurrency}
                            caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.COST" })}
                            width={"15%"} 
                            alignment={"center"}
                    />
                    <Column dataField="HoraInicio" caption={intl.formatMessage({ id: "ACCESS.PERSON.GRUPO.STARTTIME" })} width={"10%"} alignment={"center"} />
                    <Column dataField="HoraFin" caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.ENDTIME" })} width={"10%"} alignment={"center"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.SPECIAL" })} calculateCellValue={obtenerCampoEspecial} width={"8%"} />
                    <Column dataField="Orden" caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.ORDER" })} width={"5%"} alignment={"center"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
                    <Column type="buttons" width={"10%"} visible={props.showButtons} >
                        <ColumnButton 
                        icon="money" 
                        hint={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.ASSING.COST" })} 
                        onClick={nuevoComedorServicioCosto}
                        visible = { props.allowDeploy }
                         />
                        <ColumnButton name="edit" />
                        <ColumnButton name="delete" />
                    </Column>

                    { props.allowDeploy && (
                      <MasterDetail enabled={true}
                       component={(dta) => (ComedorServicioCostoList({ data: dta.data, intl, seleccionarComedorServicioCosto, editarComedorServicioCosto, eliminarComedorServicioCosto,verRegistroDblClickDetail, showButtons: props.showButtons, formatCurrency:props.formatCurrency }))} />
                    )}

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdServicio"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({id:"COMMON.TOTAL.ROW"}) } {0}`}
                        />                      
                    </Summary>


                </DataGrid>
            </PortletBody>
        </>
    );
};


ComedorServicioListPage.prototype = {
    showButtons: PropTypes.bool,
}
ComedorServicioListPage.defaultProps = {
    showButtons: true,
}

//Asignar componente ComedorServicioCostoList.
const ComedorServicioCostoList = props => {
    const { intl } = props;

    const [dataSource, setDataSource] = useState([]);
    const [focusedRowKeyComedorServicioCosto, setFocusedRowKeyComedorServicioCosto] = useState();
    const splashScreen = document.getElementById("splash-screen");

    const editarComedorServicioCosto = evt => {
        props.editarComedorServicioCosto(evt.data);
    };

    const eliminarComedorServicioCosto = evt => {
        props.eliminarComedorServicioCosto(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const seleccionarComedorServicioCosto = evt => {

        if (evt.rowIndex === -1) return;

        if (isNotEmpty(evt.row.data)) {
            const { RowIndex } = evt.row.data;
            setFocusedRowKeyComedorServicioCosto(RowIndex);
            props.seleccionarComedorServicioCosto(evt.row.data);
        }

    };

    function onCellPreparedDetail(e) {

        if (e.rowType === 'data') {
            if (e.data.Pendiente === 'S') {
                e.cellElement.style.color = '#de6e4b';
            }
        }
    }

    function allowDeletingDetail(e) {
        return  (e.row.data.Pendiente === 'N');
      }

      function allowUpdatingDetail(e) {
        return  (e.row.data.Pendiente === 'N');
      }

      const verRegistroDblClickDetail = evt => {
        if (evt.data === undefined) return;
        if (isNotEmpty(evt.data)) {
            props.verRegistroDblClickDetail(evt.data);
        };
    }

    
    const textEditing = {
        confirmDeleteMessage:'',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    async function listarComedorServicioCosto(dataRow) {
        splashScreen.classList.remove("hidden");
        const { IdCliente, IdDivision, IdComedor, IdServicio } = dataRow;

        if (isNotEmpty(IdCliente) && isNotEmpty(IdDivision) &&  isNotEmpty(IdComedor) &&  isNotEmpty(IdServicio) ) {
            let params = { 
                  IdCliente : IdCliente
                , IdDivision: IdDivision
                , IdComedor : IdComedor
                , IdServicio: IdServicio
             };
            await listarCSC(params).then((data) => {
                setDataSource(data);
                //Obtener Focus de dataGrid
                getRowFocus();
            }).finally(() => { splashScreen.classList.add("hidden"); });
        }
    }
    const getRowFocus = () => {
        let dataRow = JSON.parse(localStorage.getItem('dataRowAplication'));
        if (isNotEmpty(dataRow)) {
            const { RowIndex } = dataRow;
            setFocusedRowKeyComedorServicioCosto(RowIndex);
        }
    }   


    useEffect(() => {
        listarComedorServicioCosto(props.data.data);
    }, []);

    return (

        <>
         <div className="grid_detail_title">
          { intl.formatMessage({ id: "CASINO.DINING.ROOM.COST.SERVICE.COST.ALLOCATION"}) } 
        </div>
            <DataGrid
                id="datagrid-aplicacion"
                dataSource={dataSource}
                showBorders={true}
                columnAutoWidth={true}
                focusedRowEnabled={true}
                focusedRowKey={focusedRowKeyComedorServicioCosto}
                keyExpr="RowIndex"
                onCellPrepared={onCellPreparedDetail}
                onEditingStart={editarComedorServicioCosto}
                onRowRemoving={eliminarComedorServicioCosto}
                onFocusedRowChanged={seleccionarComedorServicioCosto}
                onCellDblClick = {verRegistroDblClickDetail}

            >
                <Editing
                    mode="row"
                    useIcons={props.showButtons}
                    allowUpdating={allowUpdatingDetail}
                    allowDeleting={allowDeletingDetail}
                    texts={textEditing}
                />
            <Column dataField="RowIndex" caption="#"  alignment={"center"} />
            <Column dataField="IdCategoriaCosto" caption={intl.formatMessage({ id: "COMMON.CODE" })} visible ={false}   />
            <Column dataField="CategoriaCosto" 
            caption={intl.formatMessage({ id: "CASINO.CATEGORY.COST" })} 
            width={"70%"}
            alignment={"left"}
            />    

        <Column caption={intl.formatMessage({ id: "CASINO.DINING.ROOM.COST.SERVICE.ASSUMED.COMPANY" })} alignment={"center"}>
            <Column dataField="PorcentajeAsumidoEmpresa" 
                    dataType="number"
                    format="percent"
                    caption={intl.formatMessage({ id: "%" })}
                    width={"15%"} 
                    alignment={"center"} 

            />

                <Column dataField="CostoAsuminoEmpresa"
                            dataType="number"
                            format={props.formatCurrency}
                            caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.COST" })}
                            width={"15%"} 
                            alignment={"center"}
                    />

            </Column>      

            <Column caption={intl.formatMessage({ id: "CASINO.DINING.ROOM.COST.SERVICE.ASSUMED.WORKER" })} alignment={"center"}>

            <Column dataField="PorcentajeAsumidoTrabajador"
            dataType="number"
            format="percent"
            caption={intl.formatMessage({ id: "%" })}
            width={"15%"}
            alignment={"center"}
            /> 

            <Column dataField="CostoAsuminoTrabajador"
                            dataType="number"
                            format={props.formatCurrency}
                            caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.COST" })}
                            width={"15%"} 
                            alignment={"center"}
                    />
            
            </Column>



    
        </DataGrid>

        </>
    );
};

export default injectIntl(WithLoandingPanel(ComedorServicioListPage));

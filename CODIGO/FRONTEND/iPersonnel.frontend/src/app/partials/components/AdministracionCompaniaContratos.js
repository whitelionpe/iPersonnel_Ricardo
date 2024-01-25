import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";//Multi-idioma
import { Button } from "devextreme-react";
import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../content/Portlet";

import { isNotEmpty } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection, Editing,Summary ,TotalItem } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';
import PropTypes from "prop-types";
import { obtenerTodos as obtenerContratos } from "../../api/administracion/contrato.api";


const AdministracionCompaniaContratos = props => {
  const { intl } = props;
  const [contratos, setContratos] = useState([]);
  const {IdCliente , IdDivision } = useSelector(state => state.perfil.perfilActual);

  async function cargarCombos() {
    let data = await obtenerContratos({  
      IdCliente: IdCliente,
      IdCompaniaMandante: props.varIdCompania,
      IdCompaniaContratista :"",
      IdDivision :IdDivision,
      Activo :""
     });
    setContratos(data);
}

function onCellPrepared(e) {
  if (e.rowType === 'data') {
    if (e.data.Activo === 'N') {
      e.cellElement.style.color = 'red';
    }
  }
}

  useEffect(() => {
    cargarCombos();
  }, []);


  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"600px"}
        width={"750px"}
        title={ intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.MAINTENANCE" }).toUpperCase()}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
        <Portlet>

          <DataGrid
            dataSource={contratos}
            showBorders={true}
            keyExpr="RowIndex"
            onCellPrepared={onCellPrepared}
            focusedRowEnabled={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
          >
            <Editing mode="cell" allowUpdating={false} >
            </Editing>

            <Selection mode={props.selectionMode} />
            <FilterRow visible={false}  showOperationChooser={false}  />
            <HeaderFilter visible={false} />
            <FilterPanel visible={false} />

            <Column 
            dataField="IdContrato" 
            caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" })} 
            editorOptions={false} 
            allowEditing={false} 
            visible={true} 
            />

            <Column 
            dataField="Asunto" 
            caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBJECT" })} 
            editorOptions={false} 
            allowEditing={false} 
             />

            <Column
              dataField="FechaInicio"
              caption={intl.formatMessage({
              id: "CASINO.PERSON.GROUP.STARTDATE",
              })}
              dataType="date" format="dd/MM/yyyy"
              alignment={"center"}
              allowSorting={true}
              allowSearch={true}
              allowFiltering={true}
            />
            <Column
              dataField="FechaFin"
              caption={intl.formatMessage({
              id: "CASINO.PERSON.GROUP.ENDDATE",
              })}
              dataType="date" format="dd/MM/yyyy"
              alignment={"center"}
              allowSorting={true}
              allowSearch={true}
              allowFiltering={true}
            />

            <Column 
            dataField="Servicios" 
            caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SERVICES" })} 
            editorOptions={false} 
            allowEditing={false} 
            />

          <Summary>
            <TotalItem
             cssClass="classColorPaginador_"
            column="IdContrato"
            summaryType="count"
            displayFormat={`${intl.formatMessage({id:"COMMON.TOTAL.ROW"}) } {0}`}
            />                      
          </Summary>

            <Paging defaultPageSize={15} />
            <Pager showPageSizeSelector={false} />
          </DataGrid>


        </Portlet>
      </Popup>
    </>
  );
};

AdministracionCompaniaContratos.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
AdministracionCompaniaContratos.defaultProps = {
  showButton: true,
  selectionMode: "row", //['multiple', 'row','single]
};
export default injectIntl(AdministracionCompaniaContratos);

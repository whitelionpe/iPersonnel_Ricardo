import React, { useEffect, useState, useRef } from "react";
import { injectIntl } from "react-intl";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import DataGrid, { Selection, Column } from "devextreme-react/data-grid";
import { isNotEmpty } from "../../../../../../_metronic";
//import Alert from '@material-ui/lab/Alert';

const GrupoZonaEquipoListPage = props => {
  const { intl, grupoZonaEquipos } = props;
  const [selectedRow, setSelectedRow] = useState([]);
  const refGrilla = useRef(null);

  const grabar = () => {

    //+++Evaluar seleccionar/ sin seleccionar
    var dataSend = [];
    grupoZonaEquipos.map(item => {
      //evaluar si existe el objeto selccionado 
      if (selectedRow.length > 0 && selectedRow.includes(item) ) {
        dataSend.push({ ...item, Selected: true });
      } else {
        dataSend.push({ ...item, Selected: false });
      }
    });

    if (dataSend.length >= 1) {
      props.agregarGrupoEquipo({ selectedRow: dataSend });
    } else {
      handleInfoMessages(intl.formatMessage({ id: "ACCESS.GROUP.MUST.ITEM" }));
    }

  }


  const seleccionarRegistro = (evt) => {
    //console.log("seleccionarRegistro", evt);
    if (evt.selectedRowsData !== undefined) {
      //console.log("Select-Row", evt.selectedRowsData);
      if (isNotEmpty(evt.selectedRowsData)) setSelectedRow(evt.selectedRowsData);
    }
  }

  useEffect(() => {
    if (refGrilla !== null && refGrilla.current !== null) {
      //Desactivar seleccioon multiple
      refGrilla.current.instance.deselectAll();
      //Buscar registro previamente seleccionado.
      var seledData = grupoZonaEquipos.filter(x => x.selected).map(x => { return x.RowIndex; });
      //Asignar id selecccionados.
      refGrilla.current.instance.selectRows(seledData, true);
    }
  }, [grupoZonaEquipos])


  return (
    <>
      {/* <h1>Lista de puerta xx</h1> */}
      {props.showButton && (
        <PortletHeader
          title={""}
          toolbar={
            <PortletHeaderToolbar >
              <Button
                icon="fa fa-save"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                onClick={grabar}
                useSubmitBehavior={true}
                validationGroup="FormEdicion"
                disabled={props.isVisibleAlert}
              />
              {/* &nbsp;
              <Button
                icon="fa fa-times-circle"
                type="normal"
                hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                onClick={cancelarEdicion}
              /> */}
            </PortletHeaderToolbar>
          }
        />
      )}

      <PortletBody>



        <DataGrid
          id="gridContainer"
          ref={refGrilla}
          //defaultSelectedRowKeys={startupSelectedKeys}
          dataSource={grupoZonaEquipos}
          //focusedRowEnabled={true}
          keyExpr="RowIndex"
          showBorders={true}
          //onSelectionChanged={(e => onSelectionChanged(e))}
          //selectedRowKeys={selectedRow}
          onSelectionChanged={seleccionarRegistro}
          repaintChangesOnly={true}
          focusedRowEnabled={true}
        >
          <Selection mode={"multiple"} />
          {/* <Column dataField="RowIndex" caption="#" width={"10%"} alignment={"center"} visible={false} />          
          <Column dataField="IdEquipo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"25%"} />*/}
          <Column dataField="IP" caption={intl.formatMessage({ id: "SYSTEM.TEAM.IP" })} width={"15%"} />
          <Column dataField="Equipo" caption={intl.formatMessage({ id: "SYSTEM.DEVICE" })} width={"30%"} />         
          <Column dataField="Modelo" caption={intl.formatMessage({ id: "SYSTEM.TEAM.MODEL" })} width={"15%"} />
          <Column dataField="TipoEquipo" caption={intl.formatMessage({ id: "SYSTEM.TEAM.TEAMTYPE" })} width={"15%"} />
          <Column dataField="TipoLectura" caption={intl.formatMessage({ id: "SYSTEM.TEAM.READINGTYPE" })} width={"15%"} />
          
        </DataGrid>

        {/* </Item>
              <Item dataField="IdCliente" visible={false} />
              <Item dataField="IdDivision" visible={false} />
              <Item dataField="IdZona" visible={false} />
              <Item dataField="Activo" visible={false} />
            </GroupItem>
          </Form> */}


      </PortletBody>


    </>
  );
};



export default injectIntl(GrupoZonaEquipoListPage);



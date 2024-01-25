import React, { useEffect, useState, useRef } from "react";
import { injectIntl } from "react-intl";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import DataGrid, { Selection, Column } from "devextreme-react/data-grid";
import { isNotEmpty } from "../../../../../../_metronic";
//import Alert from '@material-ui/lab/Alert';

const PuertaListPage = props => {
  const { intl, puertas } = props;
  const [selectedRow, setSelectedRow] = useState([]);
  const refGrilla = useRef(null);

  const grabar = () => {

    //+++Evaluar seleccionar/ sin seleccionar
    var dataSend = [];
    puertas.map(item => {
      //evaluar si existe el objeto selccionado 
      if (selectedRow.length > 0 && selectedRow.includes(item) ) {
        dataSend.push({ ...item, Selected: true });
      } else {
        dataSend.push({ ...item, Selected: false });
      }
    });

    if (dataSend.length >= 1) {
      props.agregarGrupoPuerta({ selectedRow: dataSend });
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
      var seledData = props.puertas.filter(x => x.selected).map(x => { return x.RowIndex; });
      //Asignar id selecccionados.
      refGrilla.current.instance.selectRows(seledData, true);
    }
  }, [props.puertas])


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
          dataSource={props.puertas}
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
          <Column dataField="IdPuerta" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"25%"} />*/}
          <Column dataField="Puerta" caption={intl.formatMessage({ id: "ACCESS.PERSON.RESTRICTION.DOOR" })} width={"40%"} />
          <Column dataField="TipoPuerta" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE" })} width={"60%"} />
          {/* <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} /> */}
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



export default injectIntl(PuertaListPage);



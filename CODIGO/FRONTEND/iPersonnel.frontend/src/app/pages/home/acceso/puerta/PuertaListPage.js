import React, { useEffect, useState, useRef } from "react";
import { injectIntl } from "react-intl";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
//import Paper from '@material-ui/core/Paper';
//import Form, { Item, GroupItem } from "devextreme-react/form";
import DataGrid, { Selection, Column } from "devextreme-react/data-grid";
import { isNotEmpty } from "../../../../../_metronic";
//import Alert from '@material-ui/lab/Alert';

const PuertaListPage = props => {
  const { intl, cancelarEdicion, setSelectedNodos, selectedNodos, setLoading } = props;
  const classesEncabezado = useStylesEncabezado();
  const [selectedRow, setSelectedRow] = useState([]);
  const classes = useStylesTab();
  const [listarPuertas, setListarPuertas] = useState([]);
  const refGrilla = useRef(null);

  //const [startupSelectedKeys, setStartupSelectedKeys] = ["P02ADM"];
  //const startupSelectedKeys = ["P02ADM"];
  // let startupSelectedKeys = [1, 2];

  // const startupSelectedKeys = () => {
  //   return [1, 2];
  // };

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  }


  async function cargar() {
    //debugger;
    // if (isNotEmpty()) {
    //   handleInfoMessages(intl.formatMessage({ id: "ACCESS.GROUP.MUST.ITEM" }));
    // }
    // else {
    //   setSelectedRow([]);
    //   let solicitudes = selectedNodos;
    //   setListarPuertas(solicitudes);
    //   let default_items = solicitudes.filter(x => x.selected === "1").map(x => { return x.IdPuerta; });
    //   setSelectedRow(default_items);
    // }
  }

  // useEffect(() => {
  //   console.log("props.puertas", props.puertas);
  // }, [props.puertas]);


  const grabar = () => {
    //let default_items = solicitudes.filter(x => x.selected === "1").map(x => { return x.IdPuerta; });

    // let itemsSeleccionados = props.puertas.filter(datos => selectedRow.includes(datos.IdPuerta));
    //let itemsSeleccionados = props.puertas.filter(datos =>  datos.selected === "1").map (datos =>{ return isNotEmpty(datos.IdPuerta); });
    //setSelectedRow(itemsSeleccionados);

    if (selectedRow.length >= 1) {
      props.agregarGrupoPuerta({ selectedRow });
    } else {
      handleInfoMessages(intl.formatMessage({ id: "ACCESS.GROUP.MUST.ITEM" }));
    }

  }

  // function onSelectionChanged(e) {
  //   console.log("onSelectionChanged-->", e);
  //   setSelectedRow(e.selectedRowKeys);
  // }
  // function onSelectionChanged(e) {
  //   e.component.refresh(true);
  // }

  // function calculateSelectedRow(options) {
  //   if (options.name === 'SelectedRowsSummary') {
  //     if (options.summaryProcess === 'start') {
  //       options.totalValue = 0;
  //     } else if (options.summaryProcess === 'calculate') {
  //       if (options.component.isRowSelected(options.value.RowIndex)) {
  //         options.totalValue += options.value.RowIndex;
  //       }
  //     }
  //   }
  // }

  const seleccionarRegistro = (evt) => {
    //console.log("seleccionarRegistro", evt);
    if (evt.selectedRowsData !== undefined) {
      console.log("Select-Row", evt.selectedRowsData);
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



      {/* <Paper className={classes.paper}>
        <AppBar position="static" className={classesEncabezado.secundario}>
          <Toolbar variant="dense" className={classesEncabezado.toolbar}>
            <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
              {intl.formatMessage({ id: "ACCREDITATION.AUTHORIZER.DATA" })}
            </Typography>
          </Toolbar>
        </AppBar>
        <PortletHeader
          title={intl.formatMessage({ id: "ACCREDITATION.AUTHORIZER.SELECTED" })}
          toolbar={
            <PortletHeaderToolbar>
            </PortletHeaderToolbar>
          }
        /> */}
      <PortletBody>

        {/* <DataGrid
          id="gridContainerA"
          defaultSelectedRowKeys={startupSelectedKeys}
          onSelectionChanged={onSelectionChanged}
          dataSource={props.puertas}
          keyExpr="RowIndex"
          showBorders={true}>
          <Paging enabled={false} />
          <Selection mode="multiple" />
          <Column dataField="Puerta" width={130} caption="Invoice Number" />
          <Column dataField="TipoPuerta" width={160} dataType="date" />
          <Column dataField="Employee" />
          <Column dataField="CustomerStoreCity" caption="City" />
          <Column dataField="CustomerStoreState" caption="State" />
          <Column dataField="SaleAmount" alignment="right" format="currency" />
          <Summary calculateCustomSummary={calculateSelectedRow}>
            <TotalItem
              name="SelectedRowsSummary"
              summaryType="custom"
              valueFormat="currency"
              displayFormat="Sum: {0}"
              showInColumn="SaleAmount" />
          </Summary>
        </DataGrid> */}

        {/* <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}> */}

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
          {/* <Column dataField="RowIndex" caption="#" width={"10%"} alignment={"center"} visible={false} /> */}
          <Column dataField="IdPuerta" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"25%"} />
          <Column dataField="Puerta" caption={intl.formatMessage({ id: "ACCESS.PERSON.RESTRICTION.DOOR" })} width={"20%"} />
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
      {/* </Paper> */}

    </>
  );
};



export default injectIntl(PuertaListPage);



import React, { useEffect, useState } from "react";
import "./SimpleDropDownBoxGrid.css";
import DropDownBox from "devextreme-react/drop-down-box";
import {
  DataGrid,
  Column,
  Paging,
  Selection
} from "devextreme-react/data-grid";
const SimpleDropDownBoxGridCharge = ({
  ColumnDisplay,
  ColumnValue,
  placeholder = "Select a value..",
  SelectionMode = "multiple",
  dataSource = [],
  Columnas = [],
  setSeleccionados,
  Seleccionados,
  pageSize = 10,
  pageEnabled = true,
  dataCheck,
  setDatacheck,
  setIsChangeCmbService,
  readOnly = false
}) => {
  const [itemsSelected, setItemsSelected] = useState([]);
  const [selectedRowsData, setSelectedRowsData] = useState([]);
  const [dataSourceGrid, setDataSourceGrid] = useState([]);
  const [isComponentLoad, setIsComponentLoad] = useState(false);

  const [dataGrid, setDataGrid] = useState(null);

  useEffect(() => {
   
    if (dataSource) setDataSourceGrid(dataSource);
    setItemsSelected(Seleccionados);
    
  }, []);

  useEffect(() => {
    
    if (isComponentLoad) {
      setSeleccionados(itemsSelected);
      setDatacheck(itemsSelected);
      setIsChangeCmbService(true);
      setIsComponentLoad(false);    
    }

  }, [isComponentLoad]);


  const dropDownBoxValueChanged = e => {
    if (e.value === null) {
      setItemsSelected([]);
      setIsComponentLoad(true);
    }
  };

  const dataGrid_onSelectionChanged = e => {
    setItemsSelected((e.selectedRowKeys.length && e.selectedRowKeys) || []);
    setSelectedRowsData(e.selectedRowsData);
    
  };

  const dropDownBoxonClosed = e => {
    setIsComponentLoad(true);
  };

  const dropDownBoxonOpen = e => {
    setIsComponentLoad(false);
  };

  function onEditorPrepared(e) {
    if (dataGrid) dataGrid.instance.selectRows(dataCheck);
  }

  const dropDownBoxContentRender = e => {
    return (
      <DataGrid
        id="dgFiltroCombo"
        // keyExpr="IdModulo"
        keyExpr={ColumnValue}
        ref={ref => { setDataGrid(ref) }} //setDataGrid}//
        onEditorPrepared={onEditorPrepared}
        dataSource={dataSourceGrid}
        selectedRowKeys={itemsSelected}
        onSelectionChanged={dataGrid_onSelectionChanged}
      >
        <Selection mode={SelectionMode} />
        {Columnas.map(x => (
          <Column
            key={x.dataField}
            dataField={x.dataField}
            caption={x.caption}
            width={x.width}
          />
        ))}
        <Paging enabled={pageEnabled} pageSize={pageSize} />
      </DataGrid>
    );
  };


  const displayDataValue = () => {
    return dataSource.filter(y => dataCheck.includes(y[ColumnValue])).map(x => x[ColumnDisplay]);
  }

  return (
    <div>
      <DropDownBox
        value={displayDataValue()}
        deferRendering={false}
        // valueExpr="IdServicio"
        // displayExpr="Servicio"
        placeholder={placeholder}
        showClearButton={true}
        dataSource={dataSourceGrid}
        onValueChanged={dropDownBoxValueChanged}
        contentRender={dropDownBoxContentRender}
        onClosed={dropDownBoxonClosed}
        onOpen={dropDownBoxonOpen}
        readOnly={readOnly}
      />
    </div>
  );
};

export default SimpleDropDownBoxGridCharge;

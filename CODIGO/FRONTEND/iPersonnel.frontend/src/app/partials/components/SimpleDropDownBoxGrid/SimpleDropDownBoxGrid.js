import React, { useEffect, useState, } from 'react';
import './SimpleDropDownBoxGrid.css'
import DropDownBox from 'devextreme-react/drop-down-box';
import { DataGrid, Column, Paging, ColumnChooser, Editing, Summary, TotalItem, Selection } from "devextreme-react/data-grid";
const SimpleDropDownBoxGrid = (
    {
        ColumnDisplay,
        placeholder = "Select a value..",
        SelectionMode = "multiple",
        dataSource = [],
        Columnas = [],
        setSeleccionados,
        Seleccionados,
        pageSize = 10,
        pageEnabled = true,
        
    }
) => {
    const [itemsSelected, setItemsSelected] = useState([]);
    const [dataSourceGrid, setDataSourceGrid] = useState([]);
    const [isComponentLoad, setIsComponentLoad] = useState(false);


    useEffect(() => {
        setDataSourceGrid(dataSource);
        setItemsSelected(Seleccionados);
    }, []);

    useEffect(() => {
        if (isComponentLoad) {
            setSeleccionados(itemsSelected);
            setIsComponentLoad(false);
        }
    }, [isComponentLoad]);


    const dropDownBoxValueChanged = (e) => {

        if (e.value === null) {
            setItemsSelected([]);
            setIsComponentLoad(true);
        }

    }

    const dataGrid_onSelectionChanged = (e) => {
        setItemsSelected(e.selectedRowKeys.length && e.selectedRowKeys || []);
    }

    const dropDownBoxonClosed = (e) => {
        setIsComponentLoad(true);
    }


    const dropDownBoxonOpen = (e) => {
        setIsComponentLoad(false);
    }



    const dropDownBoxContentRender = (e) => {
        return (
            <DataGrid
                id="dgFiltroCombo"
                dataSource={dataSourceGrid}
                selectedRowKeys={itemsSelected}
                onSelectionChanged={dataGrid_onSelectionChanged}
            >
                <Selection mode={SelectionMode} />
                { Columnas.map(x => (
                    <Column key={x.dataField} dataField={x.dataField} caption={x.caption} width={x.width} />
                ))}
                <Paging enabled={pageEnabled} pageSize={pageSize} />
            </DataGrid>
        );
    }

    const displayDataValue = () => {
        
        return itemsSelected.map(x => (x[ColumnDisplay]));
    }

    return (
        <div>
            <DropDownBox
                value={displayDataValue()}
                deferRendering={false}
                //valueExpr="IdServicio"
                //displayExpr="Servicio"
                placeholder={placeholder}
                showClearButton={true}
                dataSource={dataSourceGrid}
                onValueChanged={dropDownBoxValueChanged}
                contentRender={dropDownBoxContentRender}
                onClosed={dropDownBoxonClosed}
                onOpen={dropDownBoxonOpen}
            />
        </div>
    );
};


export default SimpleDropDownBoxGrid;
import React, { useState, useRef } from 'react';
import Form, { Item, GroupItem } from "devextreme-react/form";
import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection } from "devextreme-react/data-grid";
import { DropDownBox } from 'devextreme-react';
import PropTypes from 'prop-types'

const SelectionUbigeo = (props) => {
    const formUbigeo = useRef(null);
    const ddlUbigeo = useRef(null);
    //const [gridBoxValue, setGridBoxValue] = useState([]);
    const [dataRow, setDataRow] = useState([]);

    const gridBox_displayExpr = (item) => {
        return item && `${item.IdUbigeo} <${item.Departamento}-${item.Provincia}-${item.Distrito} >`;
    }

    const seleccionarRegistro = evt => {
        ddlUbigeo.current.instance.focus();
        props.setGridBoxValue(evt.data);
        props.onValueChanged(evt.data);
        const { IdUbigeo, Pais, Departamento, Provincia, Distrito, Comunidad } = evt.data;
        setDataRow({ IdUbigeo, Pais, Departamento, Provincia, Distrito, Comunidad });
    }

    return (
        <>
            <Form
                formData={dataRow.length === 0 ? props.gridBoxValue : dataRow}
                ref={formUbigeo}
            >
                <GroupItem itemType="group" colCount={2} colSpan={2}>

                    <Item
                        label={{ text: props.label }}
                        colSpan={!props.verDependencia ? 2 : 1}
                        dataField="IdUbigeo"
                    >
                        <DropDownBox
                            value={props.gridBoxValue}
                            valueExpr="IdUbigeo"
                            deferRendering={false}
                            displayExpr={() => gridBox_displayExpr(props.gridBoxValue)}
                            placeholder="Seleccione..." 
                            contentRender={dataGridRender}
                            ref={ddlUbigeo} 
                        />
                    </Item>
                    <Item
                        dataField="Pais"
                        visible={props.verDependencia}
                        label={{ text: "País" }}
                        editorOptions={{
                            placeholder: "País",
                            disabled: true
                        }}
                    />
                    <Item
                        dataField="Departamento"
                        visible={props.verDependencia}
                        label={{ text: "Departamento" }}
                        editorOptions={{
                            placeholder: "Departamento",
                            disabled: true
                        }}
                    />
                    <Item
                        dataField="Provincia"
                        visible={props.verDependencia}
                        label={{ text: "Provincia" }}
                        editorOptions={{
                            placeholder: "Provincia",
                            disabled: true

                        }}
                    />
                    <Item
                        dataField="Distrito"
                        visible={props.verDependencia}
                        label={{ text: "Distrito" }}
                        editorOptions={{
                            placeholder: "Distrito",
                            disabled: true
                        }}
                    />

                </GroupItem>
            </Form>
        </>
    )

    function dataGridRender() {

        return (
            <DataGrid
                dataSource={props.dataUbigeo}
                showBorders={true}
                keyExpr="RowIndex"
                focusedRowEnabled={true}
                remoteOperations={true}
                hoverStateEnabled={true}
                onRowClick={seleccionarRegistro}
                height="100%">
                <Selection mode="single" />

                <FilterRow visible={true} />
                <HeaderFilter visible={true} />
                <FilterPanel visible={false} />
                <Column dataField="IdUbigeo" visible={false} />

                <Column
                    dataField="Departamento"
                    allowHeaderFiltering={false}
                    allowSorting={true}
                    width={"30%"}
                />
                <Column
                    dataField="Provincia"
                    allowHeaderFiltering={false}
                    allowSorting={true}
                    width={"30%"}
                />
                <Column
                    dataField="Distrito"
                    allowHeaderFiltering={false}
                    allowSorting={true}
                    width={"30%"}
                />

                <Paging defaultPageSize={10} />
                <Pager showPageSizeSelector={false} />
            </DataGrid>
        );
    }
}

SelectionUbigeo.propTypes = {
    label: PropTypes.string,
    idUbigeo: PropTypes.string,
    verDependencia: PropTypes.bool
}
SelectionUbigeo.defaultProps = {
    label: "Ubigeo",
    IdUbigeo: "",
    verDependencia: false
}

export default SelectionUbigeo;
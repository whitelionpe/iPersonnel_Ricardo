import React from "react";
import { DataGrid, Column, Editing, Popup, Position, Form, Lookup } from 'devextreme-react/data-grid';
import { Item } from 'devextreme-react/form';
//import { connect } from 'react-redux';
//import { bindActionCreators } from 'redux';
import { obtenerTodos, crear, actualizar } from "../../../../api/sistema/division.api";
import { obtenerTodos as obtenerTodosCliente } from "../../../../api/sistema/cliente.api";

const textEditing = {
  confirmDeleteMessage: "¿Seguro de eliminar el división?",
  addRow: "Agregar División",
  editRow: "Editar División",
  deleteRow: "Eliminar División",
  saveRowChanges: "Grabar",
  cancelRowChanges: "Cancelar"
};

class DivisionPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clientes: [],
      divisiones: [],
      focusedRowKey: 0,

    };
    this.onRowInserted = this.onRowInserted.bind(this);
    this.onRowUpdated = this.onRowUpdated.bind(this);
    this.getFiltroPorCliente = this.getFiltroPorCliente.bind(this);
  }

  componentDidMount() {

    obtenerTodosCliente().then(
      res => {
        this.setState({
          clientes: res.data
        });
      }
    );

    this.listarDivisiones();
  }

  listarDivisiones() {
    obtenerTodos(0, 0).then(
      res => {
        this.setState({
          divisiones: res.data
        });
      }
    );
  }

  onRowInserted(ev) {
    const { IdCliente, IdDivision, IdClientePadre, IdDivisionPadre, Division, Nivel, NombreNivel } = ev.data;
    let self = this;
    crear(
      IdCliente
      , IdDivision
      , IdClientePadre
      , IdDivisionPadre
      , Division
      , Nivel
      , NombreNivel
    ).then(
      res => {
        self.listarDivisiones();
      }
    );
  }

  onRowUpdated(ev) {
    const { IdCliente, IdDivision, IdClientePadre, IdDivisionPadre, Division, Nivel, NombreNivel } = ev.data;
    let self = this;
    actualizar(
      IdCliente
      , IdDivision
      , IdClientePadre
      , IdDivisionPadre
      , Division
      , Nivel
      , NombreNivel).then(
        res => {
          self.listarDivisiones();
        }
      );
  }

  //*******************************************************************
  //--->Filtro por cliente para filtrar padre.
  setStateClienteValue(rowData, value) {
    rowData.IdClientePadre = null;
    this.defaultSetCellValue(rowData, value);
  }
  getFiltroPorCliente(options) {
    return {
      store: this.state.clientes,
      filter: options.data ? ['IdClientePadre', '=', options.data.IdCliente] : null
    };
  }

  onEditorPreparing(e) {

    if (e.parentType === 'dataRow' && e.dataField === 'IdCliente') {
      //e.editorOptions.disabled = (typeof e.row.data.IdCliente !== 'string');
      //console.log(e.row.data.IdCliente);
    }

  }

  render() {
    return (
      <>
        <div className="row">
          <div className="col-md-12">
            <DataGrid
              dataSource={this.state.divisiones}
              showBorders={true}
              focusedRowEnabled={true}
              keyExpr="IdDivision"
              onRowInserted={this.onRowInserted}
              onRowUpdated={this.onRowUpdated}
              onEditorPreparing={this.onEditorPreparing}
            >
              <Editing
                mode={"popup"}
                allowAdding={true}
                allowDeleting={true}
                allowUpdating={true}
                useIcons={true}
                texts={textEditing}
              >
                <Popup title="Información de división" showTitle={true} width={550} height={500}>
                  <Position my="top" at="top" of={window} />
                </Popup>

                <Form>
                  <Item itemType="group" colCount={1} colSpan={2}>
                    <Item dataField="IdCliente" isRequired={true} />
                    <Item dataField="IdClientePadre" isRequired={false} />
                    <Item dataField="IdDivisionPadre" isRequired={false} />
                    <Item dataField="IdDivision" isRequired={true} />
                    <Item dataField="Division" isRequired={true} />
                    <Item dataField="Nivel" isRequired={true} />
                    <Item dataField="NombreNivel" isRequired={true} />
                  </Item>
                </Form>

              </Editing>
              <Column dataField="IdCliente" caption="Cliente" setCellValue={this.setStateClienteValue} >
                <Lookup dataSource={this.state.clientes} valueExpr="IdCliente" displayExpr="Cliente" />
              </Column>
              <Column dataField="IdClientePadre" caption="Cliente Padre" >
                <Lookup dataSource={this.getFiltroPorCliente} valueExpr="IdCliente" displayExpr="Cliente" />
              </Column>
              <Column dataField="IdDivisionPadre" caption="División Padre" >
                <Lookup dataSource={this.state.divisiones} valueExpr="IdDivision" displayExpr="Division" />
              </Column>
              <Column dataField="IdDivision" caption="Código División" width={80}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              />
              <Column dataField="Division" caption="División"
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              />
              <Column dataField="Nivel" caption="Código Nivel" width={80} />
              <Column dataField="NombreNivel" caption="Nivel"
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              />

            </DataGrid>
          </div>

        </div>

      </>
    );
  }
}


export default DivisionPage;
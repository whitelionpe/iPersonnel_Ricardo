import React from "react";
import {DataGrid, Column, Editing, Popup, Position, Form, Lookup } from 'devextreme-react/data-grid';
import { Item } from 'devextreme-react/form';
//import { connect } from 'react-redux';
//import { bindActionCreators } from 'redux';
import { obtenerTodos, crear,actualizar } from "../../../../api/sistema/cliente.api";
import { listarPaises, listarTiposDocumento } from "../../../../api/sistema/entidad.api";

const textEditing = {
  confirmDeleteMessage: "¿Seguro de eliminar el cliente?",
  addRow: "Agregar Cliente",
  editRow: "Editar Cliente",
  deleteRow: "Eliminar Cliente",
  saveRowChanges: "Grabar",
  cancelRowChanges: "Cancelar"
};

class ClientePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clientes: [],
      paises: [],
      tiposDocumento: [],
      focusedRowKey: 0,
     
    };
    this.onRowInserted = this.onRowInserted.bind(this);
    this.onRowUpdated = this.onRowUpdated.bind(this);
  }

  componentDidMount() {
    
    listarPaises().then(
      res => {
        this.setState({
          paises: res.data
        });
      }
    );

    listarTiposDocumento().then(
      res => {
        this.setState({		
          tiposDocumento: res.data         
        });
      }
    );

    this.listarClientes();
  }

  listarClientes(){
    obtenerTodos(0, 0).then(
      res => {
        this.setState({
          clientes: res.data
        });
      }
    );
  }

 // obtenerCampoCliente(rowData) {
 //   return `${rowData.Cliente} ${rowData.Cliente}`;
 // }

  obtenerCampoCorporativo(rowData){
    return rowData.Corporativo === "S";
  }



  onRowInserted(ev){
    let formCliente = ev.data;
    let self = this;
    crear(formCliente.IdCliente,formCliente.IdClientePadre,formCliente.Cliente,formCliente.Alias,
          formCliente.Documento,formCliente.IdPais,formCliente.Corporativo).then(
            res => {
              self.listarClientes();
            }
          );
   }

   onRowUpdated(ev){
    const {IdCliente,IdClientePadre,Cliente,Alias,Documento,IdPais,Corporativo} = ev.data;
    let self = this;
    actualizar(IdCliente,
              IdClientePadre,
              Cliente,
              Alias ,
              Documento,
              IdPais ,
              Corporativo ).then(
              res => {
                    self.listarClientes();
            }
          );
   }

  render() {
    return (
      <>
        <div className="row">
          <div className="col-md-12">
          <DataGrid
                dataSource={this.state.clientes}
                showBorders={true}
                focusedRowEnabled={true}
                keyExpr="IdCliente"
                onRowInserted={this.onRowInserted}
                onRowUpdated={this.onRowUpdated}
          >
            <Editing
                  mode={"popup"}
                  allowAdding={true}
                  allowDeleting={true}
                  allowUpdating={true}
                  useIcons={true}
                  texts={textEditing}
            >
            <Popup title="Información del cliente" showTitle={true} width={600} height={450}>
              <Position my="top" at="top" of={window} />
            </Popup>
            
              <Form>
                <Item itemType="group" colCount={1} colSpan={2}>                
                   <Item dataField="IdPais" isRequired={true} /> 
                   <Item dataField="IdClientePadre" isRequired={true} />
                  <Item dataField="IdCliente" isRequired={true} 
                        editorOptions={ { maxLength: 20,
                                          inputAttr: {'style': 'text-transform: uppercase'}
                                      } }
                  />                 
                 
                  <Item dataField="Cliente" isRequired={true}  
                        editorOptions={ { maxLength: 200,
                                          inputAttr: {'style': 'text-transform: uppercase'}
                                      } }
                  />
                  <Item dataField="Alias" isRequired={true}  
                        editorOptions={ { maxLength: 100,
                                          inputAttr: {'style': 'text-transform: uppercase'}
                                     } }
                  />
                  <Item dataField="Documento" isRequired={true} 
                        editorOptions={ { maxLength: 20,
                                          inputAttr: {'style': 'text-transform: uppercase'}
                                     } }
                  />                 
                </Item>
              </Form>   
                   
            </Editing>
            <Column dataField="IdPais"  caption="País" >
                <Lookup dataSource={this.state.paises} valueExpr="IdPais" displayExpr="Pais" />
            </Column>
            <Column dataField="IdClientePadre"  caption="Padre" >
                <Lookup dataSource={this.state.clientes} valueExpr="IdCliente" displayExpr="Cliente" />
            </Column>
            <Column dataField="IdCliente" caption="Código" width={80} />
            <Column dataField="Cliente" width={200} />
            <Column dataField="Alias" />           
            <Column dataField="Documento" caption="#Documento"  />            
            <Column dataType="boolean" caption="Corporativo" calculateCellValue={this.obtenerCampoCorporativo} width={100} />

          </DataGrid>
          </div>

        </div>

      </>
    );
  }
}


export default ClientePage;
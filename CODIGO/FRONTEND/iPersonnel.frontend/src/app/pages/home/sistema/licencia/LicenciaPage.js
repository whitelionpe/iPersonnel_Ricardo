import React from "react";
import {DataGrid, Column, Editing, Popup, Position, Form, Lookup } from 'devextreme-react/data-grid';
import { Item } from 'devextreme-react/form';
//import { connect } from 'react-redux';
//import { bindActionCreators } from 'redux';
import { obtenerTodos as obtenerTodosCliente } from "../../../../api/sistema/cliente.api";
import { obtenerTodos, crear,actualizar } from "../../../../api/sistema/licencia.api";
import { listarModulo } from "../../../../api/sistema/entidad.api";

const textEditing = {
  confirmDeleteMessage: "¿Seguro de eliminar licencia?",
  addRow: "Agregar Licencia",
  editRow: "Editar Licencia",
  deleteRow: "Eliminar Licencia",
  saveRowChanges: "Grabar",
  cancelRowChanges: "Cancelar"
};

class LicenciaPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      licencias: [],
      modulos: [],
      clientes:[],
      focusedRowKey: 0,
     
    };
    this.onRowInserted = this.onRowInserted.bind(this);
    this.onRowUpdated = this.onRowUpdated.bind(this);
  }

  componentDidMount() {
    
    listarModulo().then(
      //console.log('Listar modulo'),
      res => {
        this.setState({
          modulos: res.data
        });
      }
    );

    obtenerTodosCliente(0,0).then(
      res => {
        this.setState({		
          clientes: res.data         
        });
        
      });

    this.listarLicencias();
  }

  listarLicencias(){
    obtenerTodos(0, 0).then(
      res => {
        this.setState({
          licencias: res.data
        });
      }
    );
  }

 
  onRowInserted(ev){
    const {IdModulo,IdCliente,Licencia,FechaFin,Clave} = ev.data;
    let self = this;
    crear(IdModulo,IdCliente,Licencia,FechaFin,Clave).then(
            res => {
              self.listarLicencias();
            });
  }

   onRowUpdated(ev){
    const {IdModulo,IdCliente,Licencia,FechaFin,Clave} = ev.data;
    let self = this;
    actualizar(IdModulo,IdCliente,Licencia,FechaFin,Clave).then(
              res => {
                    self.listarLicencias();
            });
   }

  render() {
    return (
      <>
        <div className="row">
          <div className="col-md-12">
          <DataGrid
                dataSource={this.state.licencias}
                showBorders={true}
                focusedRowEnabled={true}
                keyExpr="IdModulo"
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
            <Popup title="Información de licencia" showTitle={true} width={700} height={375}>
              <Position my="top" at="top" of={window} />
            </Popup>
            
              <Form>
                <Item itemType="group" colCount={2} colSpan={2}>                
                  <Item dataField="IdModulo" isRequired={true}  />
                  <Item dataField="IdCliente" isRequired={true} /> 
                  <Item dataField="Licencia" isRequired={true} />
                  <Item dataField="FechaFin" isRequired={true} />
                  <Item dataField="Clave" isRequired={true} />                               
                </Item>
              </Form>   
                   
            </Editing>
                    
            <Column dataField="IdModulo" caption="Módulo"  >
              <Lookup dataSource={this.state.modulos} valueExpr="IdModulo" displayExpr="Modulo" />
            </Column>
            <Column dataField="IdCliente"  caption="Cliente" >
                <Lookup dataSource={this.state.clientes} valueExpr="IdCliente" displayExpr="Cliente" />
            </Column>            
            <Column dataField="Licencia" mode="password" />           
            <Column dataField="FechaFin" caption="Fecha.Fin"  dataType="date" />   
            <Column dataField="Clave" visible="false" />    

          </DataGrid>
          </div>

        </div>

      </>
    );
  }
}

export default LicenciaPage;
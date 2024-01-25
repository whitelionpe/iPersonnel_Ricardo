import React from "react";
import {DataGrid, Column, Editing, Popup, Position, Form, Lookup, SearchPanel } from 'devextreme-react/data-grid';
import { Item } from 'devextreme-react/form';
//import { connect } from 'react-redux';
//import { bindActionCreators } from 'redux';
import { obtenerTodos, crear,actualizar } from "../../../../api/sistema/parametro.api";
import { listarModulo } from "../../../../api/sistema/entidad.api";

const textEditing = {
  confirmDeleteMessage: "¿Seguro de eliminar el parámetro?",
  addRow: "Agregar Parámetro",
  editRow: "Editar Parámetro",
  deleteRow: "Eliminar Parámetro",
  saveRowChanges: "Grabar",
  cancelRowChanges: "Cancelar"
};

class ParametroPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      parametros: [],
      modulos: [],      
      focusedRowKey: 0,
     
    };
    this.onRowInserted = this.onRowInserted.bind(this);
    this.onRowUpdated = this.onRowUpdated.bind(this);
  }

  componentDidMount() {
    
    listarModulo().then(
      res => {
        this.setState({
          modulos: res.data
        });
      }
    );

    this.listarParametros();
    
  }

  listarParametros(){
    obtenerTodos(0, 0).then(
      res => {
        this.setState({
          parametros: res.data
        });
      }
    );
  }

  onRowInserted(ev){
    const {IdModulo,IdParametro,Parametro} = ev.data;
    let self = this;
    crear(IdModulo,IdParametro,Parametro).then(
            res => {
              self.listarParametros();
            }
          );
   }

   onRowUpdated(ev){
    const {IdModulo,IdParametro,Parametro} = ev.data;
    let self = this;
    actualizar(IdModulo,IdParametro,Parametro).then(
              res => {
                    self.listarParametros();
            }
          );
   }

  render() {
    return (
      <>
        <div className="row">
          <div className="col-md-12">
          <DataGrid
                dataSource={this.state.parametros}
                showBorders={true}
                focusedRowEnabled={true}
                keyExpr="IdParametro"
                onRowInserted={this.onRowInserted}
                onRowUpdated={this.onRowUpdated}
          >
            <SearchPanel visible={true} highlightCaseSensitive={true} />

            <Editing
                  mode={"popup"}
                  allowAdding={true}
                  allowDeleting={true}
                  allowUpdating={true}
                  useIcons={true}
                  texts={textEditing}
            >
            <Popup title="Información de parámetro" showTitle={true} width={400} height={300}>
              <Position my="top" at="top" of={window} />
            </Popup>
            
              <Form>
                <Item itemType="group" colCount={1} colSpan={2}>                
                  <Item dataField="IdModulo" isRequired={true} 
                        editorOptions={ { maxLength: 20,
                                          inputAttr: {'style': 'text-transform: uppercase'}
                                     } }
                  />                                
                  <Item dataField="IdParametro" isRequired={true}   />
                  <Item dataField="Parametro" isRequired={true} 
                        editorOptions={ { maxLength: 500,
                                          inputAttr: {'style': 'text-transform: uppercase'}
                                      } }
                  />                 
                </Item>
              </Form>   
                   
            </Editing>
            <Column dataField="IdModulo" caption="Módulo"  >
              <Lookup dataSource={this.state.modulos} valueExpr="IdModulo" displayExpr="Modulo" />
            </Column>
            <Column dataField="IdParametro" caption="Código" width={80} />
            <Column dataField="Parametro"  />  

          </DataGrid>
          </div>

        </div>

      </>
    );
  }
}


export default ParametroPage;
import React from "react";
import {DataGrid, Column, Editing, Popup, Position, Form, Lookup, SearchPanel } from 'devextreme-react/data-grid';
import { Item } from 'devextreme-react/form';
//import { connect } from 'react-redux';
//import { bindActionCreators } from 'redux';
import { obtenerTodos, crear,actualizar } from "../../../../api/sistema/regla.api";
import { listarModulo } from "../../../../api/sistema/entidad.api";

const textEditing = {
  confirmDeleteMessage: "¿Seguro de eliminar el regla?",
  addRow: "Agregar Regla",
  editRow: "Editar Regla",
  deleteRow: "Eliminar Regla",
  saveRowChanges: "Grabar",
  cancelRowChanges: "Cancelar"
};

class ReglaPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reglas: [],
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

    this.listarReglas();
  }

  listarReglas(){
    obtenerTodos(0, 0).then(
      res => {
        this.setState({
          reglas: res.data
        });
      }
    );
  }

  onRowInserted(ev){
    const {IdRegla,IdModulo,Regla,Comentario} = ev.data;
    let self = this;
    crear(IdRegla,IdModulo,Regla,Comentario).then(
            res => {
              self.listarReglas();
            }
          );
   }

   onRowUpdated(ev){
    const {IdRegla,IdModulo,Regla,Comentario} = ev.data;
    let self = this;
    actualizar(IdRegla,IdModulo,Regla,Comentario).then(
              res => {
                    self.listarReglas();
            }
          );
   }

  render() {
    return (
      <>
        <div className="row">
          <div className="col-md-12">
          <DataGrid
                dataSource={this.state.reglas}
                showBorders={true}
                focusedRowEnabled={true}
                keyExpr="IdRegla"
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
            <Popup title="Información de la regla" showTitle={true} width={500} height={375}>
              <Position my="top" at="top" of={window} />
            </Popup>
            
              <Form>
                <Item itemType="group" colCount={1} colSpan={2}>                
                  <Item dataField="IdModulo" isRequired={true}  />                                
                  <Item dataField="IdRegla" isRequired={true} 
                        editorOptions={ { maxLength: 20,
                                          inputAttr: {'style': 'text-transform: uppercase'}
                                      } }
                  />
                  <Item dataField="Regla" isRequired={true}   
                        editorOptions={ { maxLength: 100,
                                          inputAttr: {'style': 'text-transform: uppercase'}
                                      } }
                  />
                  <Item dataField="Comentario" isRequired={true}  
                        editorOptions={ { maxLength: 8000,
                                          inputAttr: {'style': 'text-transform: uppercase'}
                                      } }
                  />                 
                </Item>
              </Form>   
                   
            </Editing>
            <Column dataField="IdModulo" caption="Módulo"  >
              <Lookup dataSource={this.state.modulos} valueExpr="IdModulo" displayExpr="Modulo" />
            </Column>
            <Column dataField="IdRegla" caption="Código" width={80} />
            <Column dataField="Regla" width={200} />
            <Column dataField="Comentario" />  

          </DataGrid>
          </div>

        </div>

      </>
    );
  }
}


export default ReglaPage;
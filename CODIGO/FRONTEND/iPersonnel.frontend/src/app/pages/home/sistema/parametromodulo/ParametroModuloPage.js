import React from "react";
import {DataGrid, Column, Editing, Popup, Position, Form, Lookup, SearchPanel } from 'devextreme-react/data-grid';
import { Item } from 'devextreme-react/form';
//import { connect } from 'react-redux';
//import { bindActionCreators } from 'redux';
import { obtenerTodos, crear,actualizar } from "../../../../api/sistema/parametroModulo.api";
import { obtenerTodos as obtenerTodosCliente } from "../../../../api/sistema/cliente.api";
import { obtenerTodos as obtenerTodosDivision } from "../../../../api/sistema/division.api";
import { obtenerTodos as obtenerTodosParametro } from "../../../../api/sistema/parametro.api";
import { listarModulo ,listarEstadoSimple  } from "../../../../api/sistema/entidad.api";

const textEditing = {
  confirmDeleteMessage: "¿Seguro de eliminar el parámetro módulo?",
  addRow: "Agregar Parámetro módulo",
  editRow: "Editar Parámetro módulo",
  deleteRow: "Eliminar Parámetro módulo",
  saveRowChanges: "Grabar",
  cancelRowChanges: "Cancelar"
};

class ParametroModuloPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        parametroModulos: [],
        clientes:[],
        divisiones:[],      
        modulos: [],
        parametros:[],  
        estadoSimple: listarEstadoSimple,    
        focusedRowKey: 0,
    };
    this.onRowInserted = this.onRowInserted.bind(this);
    this.onRowUpdated = this.onRowUpdated.bind(this);

    this.getFiltroPorCliente = this.getFiltroPorCliente.bind(this);
    this.getFiltroPorModulo = this.getFiltroPorModulo.bind(this);


  }

  componentDidMount() {
    
    obtenerTodosCliente().then(
      res => {
        this.setState({
          clientes: res.data
        });
      }
    );
    listarModulo().then(
      res => {
        this.setState({
            modulos: res.data
        });
      }
    );
    obtenerTodosDivision().then(
      res => {
        this.setState({
            divisiones: res.data
        });
      }
    );
    obtenerTodosParametro().then(
      res=>{
        this.setState({
            parametros:res.data
        })
      }
    );

    this.listarParametroModulos();
    
  }

  listarParametroModulos(){
     obtenerTodos(0, 0).then(
      res => {
        this.setState({
          parametroModulos: res.data
        });
      }
    );
  }

  onRowInserted(ev){
    const {IdCliente,IdDivision,IdModulo,IdParametro,IdSecuencial,Valor,Descripcion,Sp_Antes,Sp_Despues,EditableModulo,Fijo} = ev.data;
    let self = this;
    crear(IdCliente,IdDivision,IdModulo,IdParametro,IdSecuencial,Valor,Descripcion,Sp_Antes,Sp_Despues,EditableModulo,Fijo).then(
            res => {
              self.listarParametroModulos();
            }
          );
   }

   onRowUpdated(ev){
    const {IdCliente,IdDivision,IdModulo,IdParametro,IdSecuencial,Valor,Descripcion,Sp_Antes,Sp_Despues,EditableModulo,Fijo} = ev.data;
    let self = this;
    actualizar(IdCliente,IdDivision,IdModulo,IdParametro,IdSecuencial,Valor,Descripcion,Sp_Antes,Sp_Despues,EditableModulo,Fijo).then(
              res => {
                    self.listarParametroModulos();
            }
          );
   }
//*******************************************************************
//--->Filtro por cliente para un grupo de divisiones.
   setStateClienteValue(rowData, value) {
        rowData.IdDivision = null;
        this.defaultSetCellValue(rowData, value);
  }
  getFiltroPorCliente(options) {
        return {
          store: this.state.divisiones,
          filter: options.data ? ['IdCliente', '=', options.data.IdCliente] : null
        };
  }
  //*******************************************************************
 //--->Filtro por modulo para un grupo de parametros.
  setStateModuloValue(rowData, value) {
    rowData.IdParametro = null;
    this.defaultSetCellValue(rowData, value);
}

getFiltroPorModulo(options) {
  return {
    store: this.state.parametros,
    filter: options.data ? ['IdModulo', '=', options.data.IdModulo] : null
  };
}
onEditorPreparing(e) {
    
    if (e.parentType === 'dataRow' && e.dataField === 'IdCliente') {
        //e.editorOptions.disabled = (typeof e.row.data.IdCliente !== 'string');
    }

  }

  render() {
    return (
      <>
        <div className="row">
          <div className="col-md-12">
          <DataGrid
                dataSource={this.state.parametroModulos}
                showBorders={true}
                focusedRowEnabled={true}
                keyExpr="IdSecuencial"
                onRowInserted={this.onRowInserted}
                onRowUpdated={this.onRowUpdated}
                onEditorPreparing={this.onEditorPreparing}
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
            <Popup title="Información de parámetro módulo" showTitle={true} width={750} height={500}>
              <Position my="top" at="top" of={window} />
            </Popup>
            
              <Form>
                <Item itemType="group" colCount={2} colSpan={2}>                
                  <Item dataField="IdCliente" isRequired={true}   />                                
                  <Item dataField="IdDivision" isRequired={true}  />
                  <Item dataField="IdModulo" isRequired={true}  />    
                  <Item dataField="IdParametro" isRequired={true} /> 
                  <Item dataField="IdSecuencial" isRequired={true} 
                      editorOptions={ { maxLength: 10,
                                        inputAttr: {'style': 'text-transform: uppercase'}
                                    } } 
                  />   
                  <Item dataField="Valor" isRequired={true} 
                        editorOptions={ { maxLength: 100,
                                          inputAttr: {'style': 'text-transform: uppercase'}
                                      } } 
                  />  
                  <Item dataField="Descripcion" isRequired={true}  
                        editorOptions={ { maxLength: 500,
                                          inputAttr: {'style': 'text-transform: uppercase'}
                                     } } 
                  />  
                  <Item dataField="Sp_Antes" isRequired={true}  
                        editorOptions={ { maxLength: 100,
                                         inputAttr: {'style': 'text-transform: uppercase'}
                                      } } 
                  />  
                  <Item dataField="Sp_Despues" isRequired={true}  
                        editorOptions={ { maxLength: 100,
                                        inputAttr: {'style': 'text-transform: uppercase'}
                                      } } 
                  /> 
                  <Item dataField="EditableModulo" isRequired={true}  /> 
                  <Item dataField="Fijo" isRequired={true}  /> 

                </Item>
              </Form>   
                   
            </Editing>
            <Column dataField="IdCliente" caption="Cliente" setCellValue={this.setStateClienteValue}  >
                <Lookup dataSource={this.state.clientes} valueExpr="IdCliente" displayExpr="Cliente"   />
            </Column>
            <Column dataField="IdDivision" caption="División"  >
                <Lookup dataSource={this.getFiltroPorCliente} valueExpr="IdDivision" displayExpr="Division" />
            </Column>
            <Column dataField="IdModulo" caption="Módulo" setCellValue={this.setStateModuloValue} >
              <Lookup dataSource={this.state.modulos} valueExpr="IdModulo" displayExpr="Modulo" />
            </Column>            
            <Column dataField="IdParametro" caption="Parámetro"  >
              <Lookup dataSource={this.getFiltroPorModulo} valueExpr="IdParametro" displayExpr="Parametro" />
            </Column>
            <Column dataField="IdSecuencial" caption="Código" width={80} />
            <Column dataField="Descripcion" caption="Descripción"   />  
            
            <Column dataField="Valor" visible={false} /> 
            <Column dataField="Sp_Antes"  visible={false} /> 
            <Column dataField="Sp_Despues"  visible={false} /> 
            <Column dataField="EditableModulo" visible={false}  > 
                <Lookup dataSource={this.state.estadoSimple} valueExpr="Valor" displayExpr="Descripcion" />
            </Column>
            <Column dataField="Fijo"  visible={false} >
                <Lookup dataSource={this.state.estadoSimple} valueExpr="Valor" displayExpr="Descripcion" />
            </Column> 

          </DataGrid>
          </div>

        </div>

      </>
    );
  }
}


export default ParametroModuloPage;
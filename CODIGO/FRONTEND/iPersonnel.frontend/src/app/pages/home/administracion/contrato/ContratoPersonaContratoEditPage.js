   
import React,{useEffect, useState} from "react";
import { Button } from "devextreme-react";
import { injectIntl } from "react-intl";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel"; 
import { Popup } from "devextreme-react/popup";  
import { Portlet,PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { getDateOfDay,isNotEmpty,dateFormat,dateFromString} from "../../../../../_metronic";
import { handleInfoMessages ,handleSuccessMessages,handleErrorMessages} from "../../../../store/ducks/notify-messages";
import { obtenerTodos as obtenerCmbCentroCosto } from "../../../../api/administracion/contratoCentroCosto.api";
import { obtenerTodos as obtenerCmbDivision } from "../../../../api/administracion/contratoDivision.api";
import { obtenerTodos as obtenerCmbSubContratista } from "../../../../api/administracion/contratoSubcontratista.api"; 
 
import Form, { Item, GroupItem } from "devextreme-react/form";
import AdministracionContratoBuscar from "../../../../partials/components/AdministracionContratoBuscar";
import AdministracionUnidadOrganizativaContratoBuscar from "../../../../partials/components/AdministracionUnidadOrganizativaContratoBuscar"; 
import { servicePersonaContrato } from "../../../../api/administracion/personaContrato.api";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { login } from "../../../../crud/auth.crud";

 

const ContratoPersonaContratoEditPage = (props) => { 
 
    const { intl ,setLoading,showPopup} = props; 
    const classesEncabezado = useStylesEncabezado(); 
    const [fechasContrato,setFechasContrato]= useState([]);
    
    const [cmbDivision, setCmbDivision] = useState([]);
    const [cmbCentroCosto, setCmbCentroCosto] = useState([]);
    const [cmbSubContratista, setCmbSubContratista] = useState([]);

    const [localFilter,setLocalFilter] = useState({ 
      IdCliente : props.dataContract.IdCliente, 
      IdContrato: props.dataContract.IdContrato,  
      IdCompaniaMandante: props.dataContract.IdCompaniaMandante, 
      IdCompaniaContratista : props.dataContract.IdCompaniaContratista, 
      IdDivision: "", 
      IdUnidadOrganizativa: "",   
      IdCompaniaSubContratista: "",
       Activo : props.dataContract.Activo 
    });

    const [formDataContract,setFormDataContract] = useState({
          IdCliente : props.dataContract.IdCliente,
          FechaInicio : getDateOfDay().FechaInicio,
          FechaFin : "", 
          IdContrato: "", 
          Asunto: props.dataContract.Asunto, 
          IdCompaniaMandante: props.dataContract.IdCompaniaMandante,
          CompaniaMandante: props.dataContract.CompaniaMandante,
          IdCompaniaContratista : props.dataContract.IdCompaniaContratista,
          CompaniaContratista : props.dataContract.CompaniaContratista,
          IdDivision: "",
          Division: "",
          IdCentroCosto: "",
          CentroCosto: "",
          IdUnidadOrganizativa: "",  
          UnidadOrganizativa: "",  
          IdCompaniaSubContratista: "",
          CompaniaSubContratista: ""   ,
          IdCompaniaContratistaPrevia : props.dataContract.IdCompaniaContratista,
          IdCompaniaMandantePrevia: props.dataContract.IdCompaniaMandante,
          IdPersonaList: props.dataWorkers.map(x=> x.IdPersona).toString() 
      });
  
    const [popupVisibleContrato, setPopupVisibleContrato]= useState(false);
    const [popupVisibleUnidad, setPopupVisibleUnidad]= useState(false);
     
    const eventClickSearchContract = () =>{
      setPopupVisibleContrato(true); 
    };
 
    const eventClickSearchUnity = () =>{ 
        if (!isNotEmpty( localFilter.IdContrato)) { handleInfoMessages(intl.formatMessage({ id: "ACCREDITATION.COMPANY.DATA.CONTRACT" })); return; } 
      setPopupVisibleUnidad(true);
      };
   
    const agregarContrato = (contrato) => { 
      const { IdContrato, FechaInicio ,FechaFin} = contrato[0]; 
 
      setFechasContrato({ FechaInicioContrato: FechaInicio, FechaFinContrato: FechaFin })
 
      if (isNotEmpty(IdContrato)) {   
        setFormDataContract({...formDataContract,
          Asunto: contrato[0].Contrato, 
          IdContrato: contrato[0].IdContrato, 
          IdCompaniaMandante: contrato[0].IdCompaniaMandante,
          CompaniaMandante: contrato[0].CompaniaMandante,
          IdCompaniaContratista : contrato[0].IdCompaniaContratista,
          CompaniaContratista : contrato[0].CompaniaContratista,
          IdDivision: "",
          Division: "",
          IdUnidadOrganizativa: "",  
          UnidadOrganizativa: "" ,
          IdCentroCosto: "",
          CentroCosto: "",
          IdCompaniaSubContratista: "",
          CompaniaSubContratista: ""  ,
          FechaInicio : dateFromString(dateFormat(getDateOfDay().FechaInicio , 'dd/MM/yyyy')) < dateFromString(dateFormat(FechaInicio , 'dd/MM/yyyy'))  ? dateFromString(dateFormat(FechaInicio , 'dd/MM/yyyy'))  : dateFromString(dateFormat(getDateOfDay().FechaInicio , 'dd/MM/yyyy')),
          FechaFin : "", 
        });  
 
        cargarCombos(contrato[0]);
          
      } 
    };

    const selectUnidadOrganizativa = (dataPopup) => {
      const { IdUnidadOrganizativa, UnidadOrganizativa } = dataPopup[0]; 

      setFormDataContract({...formDataContract, 
        IdCentroCosto: "",
        CentroCosto: "",
        IdUnidadOrganizativa: IdUnidadOrganizativa,  
        UnidadOrganizativa: UnidadOrganizativa 
      });  

      setLocalFilter({...localFilter, 
        IdCentroCosto: "",
        CentroCosto: "",
        IdUnidadOrganizativa: IdUnidadOrganizativa,  
        UnidadOrganizativa: UnidadOrganizativa 
      });  
 
      onObtenerCentroCosto(IdUnidadOrganizativa);
      setPopupVisibleUnidad(false);
    };
 
    async function onObtenerCentroCosto(value) {
      setLoading(true); 
      //Obtener centro de costo cambio.
      await obtenerCmbCentroCosto({
          IdCliente: localFilter.IdCliente,
          IdCompaniaMandante: localFilter.IdCompaniaMandante ,
          IdCompaniaContratista: localFilter.IdCompaniaContratista,
          IdContrato: localFilter.IdContrato,
          IdUnidadOrganizativa: value,
          IdCentroCosto: '',
      }).then(response => {
          setCmbCentroCosto(response); 
      }).finally(() => { setLoading(false); });
 
      //if (dataRowEditNew.esNuevoRegistro) dataRowEditNew.IdCentroCosto = '';
    }


    async function cargarCombos(filtro) { 
      const { IdContrato, IdCliente ,IdCompaniaMandante, IdCompaniaContratista, IdUnidadOrganizativa } = filtro;
 
      if (!isNotEmpty(IdContrato)) return;

      setLoading(true);

      let param = { IdCliente, IdContrato, IdCompaniaMandante, IdCompaniaContratista };
      let promesas = [];

      promesas.push(obtenerCmbDivision({ ...param, IdDivision: '%' }));
      promesas.push(obtenerCmbSubContratista({ ...param }));
  
      //console.log("IdUnidadOrganizativa > ",IdUnidadOrganizativa);
      if (IdUnidadOrganizativa) {
          promesas.push(obtenerCmbCentroCosto({ ...param, IdUnidadOrganizativa, IdCentroCosto: '' }));
      } 

      await Promise.all(promesas)
          .then(resp => {  
              setCmbDivision(resp[0]);
              setCmbSubContratista(resp[1]);  

              if (IdUnidadOrganizativa) {
                  setCmbCentroCosto(resp[4]);//5->4
              } 

          }).finally(resp => { 
              setLoading(false);
              //setLocalFilter({ ...filtro });
          });
  }



    function grabar(e) {
 
      let result = e.validationGroup.validate(); 
      if (result.isValid) { 
         if (Date.parse(new Date(formDataContract.FechaInicio)) > Date.parse(new Date(formDataContract.FechaFin))) {
           handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
           return;
         }  
        actualizarDatosContrato(formDataContract);
 
      }
    }
  
    async function actualizarDatosContrato(datos) {
      setLoading(true);
      const { IdCliente
        ,IdCompaniaMandante   
        ,IdCompaniaContratista  
        ,IdContrato  
        ,IdDivision  
        ,IdUnidadOrganizativa   
        ,IdCompaniaSubContratista  
        ,IdCentroCosto  
        ,FechaInicio  
        ,FechaFin
        ,IdPersonaList 
        ,IdCompaniaMandantePrevia
        ,IdCompaniaContratistaPrevia} = datos; 
      let params = {  
                        IdCliente : isNotEmpty(IdCliente) ? IdCliente : ""
                        ,IdCompaniaMandante  : isNotEmpty(IdCompaniaMandante) ? IdCompaniaMandante : "" 
                        ,IdCompaniaContratista  : isNotEmpty(IdCompaniaContratista) ? IdCompaniaContratista : ""
                        ,IdContrato  : isNotEmpty(IdContrato) ? IdContrato : "" 
                        ,IdDivision  : isNotEmpty(IdDivision) ? IdDivision : ""
                        ,IdUnidadOrganizativa   : isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : ""
                        ,IdCompaniaSubContratista  : isNotEmpty(IdCompaniaSubContratista) ? IdCompaniaSubContratista : ""
                        ,IdCentroCosto  : isNotEmpty(IdCentroCosto) ? IdCentroCosto : ""
                        ,FechaInicio  : isNotEmpty(FechaInicio) ? FechaInicio : ""
                        ,FechaFin  : isNotEmpty(FechaFin) ? FechaFin : ""
                        ,IdPersonaList  : isNotEmpty(IdPersonaList) ? IdPersonaList : ""
                        ,IdCompaniaMandantePrevia  : isNotEmpty(IdCompaniaMandantePrevia) ? IdCompaniaMandantePrevia : ""
                        ,IdCompaniaContratistaPrevia  : isNotEmpty(IdCompaniaContratistaPrevia) ? IdCompaniaContratistaPrevia : ""
      };
      
      //console.log("params >> ",params);
      await servicePersonaContrato.actualizarcontratopersona(params).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.UPDATE.SUCESS" }));
        //listarPersonaDatos();
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => { setLoading(false); });
    }
  
  

  return (
    <>
          <Popup
          visible={showPopup.isVisiblePopUp}//{isVisiblePopUp}
          onHiding={() =>
            showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp)
          }
           
          showTitle={true}
          title= {(intl.formatMessage({ id: "ADMINISTRATION.PERSON.CHANGE.CONTRACT" })).toUpperCase()}
          width={"860px"}
          height={"420px"}
          dragEnabled={false}
          position="center"
          //closeOnOutsideClick={false}
          >
            <Portlet>
                  <PortletHeader 
                    title=""//{intl.formatMessage({ id: "ACTION.EDIT" })}    {(intl.formatMessage({ id: "ADMINISTRATION.PERSON.SHOW.INACTIVES.WORKERS" }))}
                    toolbar={ 
                      <PortletHeaderToolbar>
                            
                        &nbsp;
                        &nbsp;
                        &nbsp; 
                        &nbsp;
                        <Button
                          icon="fa fa-save"
                          type="default"
                          hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                          onClick={grabar} 
                          useSubmitBehavior={true}
                          validationGroup="FormEdicion"  
                        />
                        &nbsp;
                        <Button
                          icon="fa fa-times-circle"
                          type="normal"
                          hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                          onClick= {props.cancelar} 
                        />

                      </PortletHeaderToolbar>
                    }
                  />
                  <PortletBody > 
                     
                      <Form  formData={formDataContract}   validationGroup="FormEdicion"
                      >
                        <GroupItem itemType="group" colCount={2} colSpan={2}>
                          <Item colSpan={2}>
                            <AppBar position="static" className={classesEncabezado.secundario}>
                              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                  {intl.formatMessage({ id: "COMMON.DETAIL" })}
                                </Typography>
                              </Toolbar>
                            </AppBar>
                          </Item>
            
                          <Item
                            dataField="CompaniaContratista"
                            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
                            //isRequired={modoEdicion ? isRequired('CompaniaContratista', settingDataField) : false}
                            editorOptions={{
                              readOnly: true,
                              hoverStateEnabled: false,
                              inputAttr: { 'style': 'text-transform: uppercase' },
                              showClearButton: true,
                              disabled: true
                            }}
                          />
            
            
                          <Item
                            dataField="IdContrato"
                            colSpan={1}
                            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }) }}
                            isRequired={true}//{modoEdicion ? isRequired('IdContrato', settingDataField) : false}
                            editorOptions={{
                              hoverStateEnabled: false,
                              inputAttr: { 'style': 'text-transform: uppercase' },
                              showClearButton: true,
                              readOnly: true,
                              buttons: [{
                                name: 'search',
                                location: 'after',
                                useSubmitBehavior: true,
                                options: {
                                  disabled: false,//!(modoEdicion && dataRowEditNew.esNuevoRegistro ? isModified('CompaniaContratista', settingDataField) : false),
                                  stylingMode: 'text',
                                  icon: 'search',
                                  onClick: eventClickSearchContract,
                                }
                              }]
                            }}
                          />
            
                          <Item dataField="Asunto" 
                            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBJECT" }) }}
                            isRequired={false} // Por Regla 
                            editorOptions={{
                              //readOnly: !(modoEdicion ? isModified('Contrato', settingDataField) : false),
                              maxLength: 50,
                              inputAttr: { 'style': 'text-transform: uppercase' },
                              readOnly: true,
                              disabled: true
                            }}
                          />
            
                          <Item dataField="CompaniaMandante"
                            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY.ABR" }) }} 
                            editorOptions={{ 
                              maxLength: 50,
                              inputAttr: { 'style': 'text-transform: uppercase' },
                              readOnly: true,
                              disabled: true 
                            }}
                          />
            
                          <Item
                            dataField="IdDivision"
                            label={{ text: intl.formatMessage({ id: "SYSTEM.DIVISION" }) }}
                            editorType="dxSelectBox"
                             isRequired= {true} 
                             editorOptions={{
                              items: cmbDivision,
                              valueExpr: "IdDivision",
                              displayExpr: "Division",
                              showClearButton: true,
                               readOnly: false  
                             }}
                          />
            
                          <Item
                            colSpan={2}
                            dataField="UnidadOrganizativa"
                            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.ORGANIZATIONALUNIT" }) }}
                             editorOptions={{
                               hoverStateEnabled: false,
                               inputAttr: { 'style': 'text-transform: uppercase' },
                               showClearButton: true,
                               readOnly: true,
                               buttons: [{
                                  name: 'search',
                                  location: 'after',
                                  useSubmitBehavior: true,
                                  options: {
                                    stylingMode: 'text',
                                    icon: 'search',
                                    disabled: false,  
                                    onClick: eventClickSearchUnity
                                    
                                  }
                                }]
                             }}
                          />
            
                          <Item
                            dataField="IdCentroCosto"
                            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" }) }}
                            editorType="dxSelectBox"
                            editorOptions={{
                              items: cmbCentroCosto,
                              valueExpr: "IdCentroCosto",
                              displayExpr: "CentroCosto",
                              showClearButton: true,
                              readOnly: false 
                            }}
                          />
            
                          <Item
                            dataField="IdCompaniaSubContratista"
                            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.SUBCONTRACTOR" }) }}
                            editorType="dxSelectBox"
                            editorOptions={{
                              items: cmbSubContratista,
                              valueExpr: "IdCompaniaSubContratista",
                              displayExpr: "CompaniaSubContratista",
                              showClearButton: true,
                              readOnly: false
                            }}
                          />
            
                          <Item dataField="FechaInicio"
                            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }} 
                            editorType="dxDateBox"
                            isRequired={true}
                            dataType="date"
                            editorOptions={{ 
                              inputAttr: { 'style': 'text-transform: uppercase' },
                              displayFormat: "dd/MM/yyyy",
                              min: fechasContrato.FechaInicioContrato,
                              max: fechasContrato.FechaFinContrato,
                              disabled: true
                            }}
                          />
            
                          <Item dataField="FechaFin"
                            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }} 
                            editorType="dxDateBox"
                            dataType="date"
                            isRequired={true}
                            editorOptions={{
                              inputAttr: { 'style': 'text-transform: uppercase' },
                              displayFormat: "dd/MM/yyyy", 
                              min: fechasContrato.FechaInicioContrato,
                              max: fechasContrato.FechaFinContrato,
                              readOnly: false 
                            }}
                          />
                          
            
                        </GroupItem>
              
            
                      </Form>
                     
                      {popupVisibleContrato && (
                        <AdministracionContratoBuscar
                          uniqueId={"AdministracionContratoBuscarPersonasEditPage"}
                          selectData={agregarContrato}
                          showPopup={{ isVisiblePopUp: popupVisibleContrato, setisVisiblePopUp: setPopupVisibleContrato }}
                          cancelar={() => setPopupVisibleContrato(false)}
                          filtro={localFilter}
                          height="590px"
                        />
                      )}

                       
                      {popupVisibleUnidad && (
                        <AdministracionUnidadOrganizativaContratoBuscar
                          uniqueId={"PersonaContratoEditPage"}
                          selectData={selectUnidadOrganizativa}
                          showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
                          cancelar={() => setPopupVisibleUnidad(false)}
                          selectionMode={"row"}
                          filtro={localFilter}
                        />
                      )}

                  </PortletBody> 
            </Portlet>
          </Popup>
       
    </> 
  );

};
 

export default injectIntl(WithLoandingPanel(ContratoPersonaContratoEditPage)); 

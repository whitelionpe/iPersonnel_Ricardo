import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem,SimpleItem,PatternRule } from "devextreme-react/form";

import { Button } from "devextreme-react";
import { listarEstadoSimple,listarEstado, PatterRuler, isNotEmpty } from "../../../../../_metronic";

import {
  service
} from "../../../../api/transporte/manifiestoReservacionCupoSemanal.api";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { Portlet, PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import { Checkbox } from '@material-ui/core';
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

const ManifiestoCupoEditPage = props => {

  const { intl, varIdCompania, setLoading,dataRowEditNew, modoEdicion,settingDataField } = props;
  const classesEncabezado = useStylesEncabezado();

  const textos = {
    Lunes: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.MONDAY" }),
    Martes: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.TUESDAY" }),
    Miercoles: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.WEDNESDAY" }),
    Jueves: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.THURSDAY" }),
    Viernes: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.FRIDAY" }),
    Sabado: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.SATURDAY" }),
    Domingo: intl.formatMessage({ id: "CASINO.GROUP.SERVICE.SUNDAY" }),
  };

  const handleChangeDia = (event, dia) => {
    const data = { ...dataRowEditNew, [dia]: { ...dataRowEditNew[dia], seleccionado: event.target.checked } };
    props.setDataRowEditNew(data);
  };

  const renderDia = (e) => {
    if (e) {
      const { editorOptions: { value: data }, dataField: dia } = e;
      if (dia) {
        return (
          <Checkbox
            checked={ isNotEmpty(data) ?  data.seleccionado : false}
            value={textos[dia]}
            name={dia}
            onChange={(event => handleChangeDia(event, dia))}
             inputProps={{
               disabled: !modoEdicion,
             }}
          />
        );
      }
    }
    return '';
  }

  const restablecer = async () => {
    if (varIdCompania) {
      const config = await service.obtener({ IdCompania: varIdCompania });
      if(isNotEmpty(config)) props.setDataRowEditNew(generarConfiguracionAMostrar(config));
    }
  }

  const generarConfiguracionAMostrar = (configuracionRaw) => {
    if (configuracionRaw) {
      const {
        Lunes,
        Martes,
        Miercoles,
        Jueves,
        Viernes,
        Sabado,
        Domingo,
      } = configuracionRaw;
      return {
        ...configuracionRaw,
        Lunes: { seleccionado: (Lunes > 0), cupos: Lunes },
        Martes: { seleccionado: (Martes > 0), cupos: Martes },
        Miercoles: { seleccionado: (Miercoles > 0), cupos: Miercoles },
        Jueves: { seleccionado: (Jueves > 0), cupos: Jueves },
        Viernes: { seleccionado: (Viernes > 0), cupos: Viernes },
        Sabado: { seleccionado: (Sabado > 0), cupos: Sabado },
        Domingo: { seleccionado: (Domingo > 0), cupos: Domingo },
      };
    }
    return configuracionRaw;
  }

  
  const grabar = (e) => {
    let result = e.validationGroup.validate();
    let boolValue = false;

    if (result.isValid) {
      const clavesDias = Object.keys(textos);
      const data = clavesDias.map(dia => dataRowEditNew && dataRowEditNew[dia] && dataRowEditNew[dia].seleccionado ? dataRowEditNew.Cupos : 0);
      const { Activo, EsUrbanito } = dataRowEditNew;
      // console.log("grabar|data:",data);
      var returnValue = data.find(x => x >= 1);
     if(dataRowEditNew.Cupos === 0 || returnValue === undefined){
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "TRANSPORTE.COUPONS.VALIDATION.SAVE" }));
     }else{
      props.actualizarConfiguracion({ IdCompania: varIdCompania, Configuracion: data, Activo, EsUrbanito });
     }

    }
  }

  const configruracionDias = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
   
        <GroupItem
          alignItemLabels={false} 
          colCount={7}
          // colspan={2}
         >
            <SimpleItem dataField="Lunes" 
            label={{ text: textos["Lunes"], showColon: false }} 
             render={renderDia} 
             />
           
            {/* <SimpleItem dataField="Martes"
             label={{ text: textos["Martes"], showColon: false }} 
             render={renderDia}
              /> */}

          <SimpleItem dataField="Martes" text="Martes"  render={renderDia} />

            <SimpleItem dataField="Miercoles" label={{ text: textos["Miercoles"], showColon: false }} render={renderDia} />
            <SimpleItem dataField="Jueves" label={{ text: textos["Jueves"], showColon: false }} render={renderDia} />
            <SimpleItem dataField="Viernes" label={{ text: textos["Viernes"], showColon: false }} render={renderDia} />
            <SimpleItem dataField="Sabado" label={{ text: textos["Sabado"], showColon: false }} render={renderDia} />
            <SimpleItem dataField="Domingo" label={{ text: textos["Domingo"], showColon: false }} render={renderDia} />
        </GroupItem> 
        {/* <CheckBox
                defaultValue={true}
                text="Label"
              /> */}

        </Form>
      </>
    );
  }
  


  useEffect(() => {

  }, []);

  return (
    <>
  
  <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
        toolbar={
          <PortletHeader
            title={''}
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  icon="fa fa-save"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  onClick={grabar}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  visible={modoEdicion}
                />
                &nbsp;
               <Button
                    icon="undo"
                    type="default"
                    hint={intl.formatMessage({ id: "COMMON.REVERT" })}
                    onClick={restablecer}
                    visible={modoEdicion}
               />
                &nbsp;
                <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={props.cancelarEdicion}
                />
              </PortletHeaderToolbar>
            }
          />
        }
      />

 <Portlet>
            <PortletBody>
              <React.Fragment>
                <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">

              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                    {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <GroupItem colCount={3} >

                    <Item
                      dataField="Cupos"
                      label={{ text: intl.formatMessage({ id: "TRANSPORTE.COUPONS.MAXIMUM.QUANTITY.MSG" }) }}
                      isRequired={true}
                      editorType="dxNumberBox"
                      dataType="number"
                      editorOptions={{
                        inputAttr: { style: "text-transform: uppercase; text-align: right",},
                        showSpinButtons: true,
                        showClearButton: false,
                        readOnly: !(modoEdicion ? isModified('Cupos', settingDataField) : false),
                        maxLength: 2,
                        min: 0,
                        max: 9999,
                      }}
                      />
            
                    <Item
                      dataField="EsUrbanito"
                      label={{ text: intl.formatMessage({ id: "TRANSPORTE.COUPONS.ISURBAN.MSG" }) }}
                      editorType="dxSelectBox"
                      isRequired={modoEdicion ? isRequired('EsUrbanito', settingDataField) : false}
                      editorOptions={{
                        readOnly: !(modoEdicion ? isModified('EsUrbanito', settingDataField) : false),
                        items: listarEstado(),
                        valueExpr: "Valor",
                        displayExpr: "Descripcion"
                      }}
                    />

                    <Item
                      dataField="Activo"
                      label={{ text: intl.formatMessage({ id: "TRANSPORTE.COUPONS.STATE" }) }}
                      editorType="dxSelectBox"
                      isRequired={true}
                      editorOptions={{
                        items: listarEstadoSimple(),
                        valueExpr: "Valor",
                        displayExpr: "Descripcion",
                        readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                      }}
                    />
                  </GroupItem>

                <GroupItem>
                  <fieldset className="scheduler-border" >
                      <legend className="scheduler-border" >
                        <h5>{intl.formatMessage({ id: "TRANSPORTE.COUPONS.CONFIGURATION" })} </h5>
                      </legend>
                      {configruracionDias()}
                    </fieldset>
                </GroupItem>



                </Form>
              </React.Fragment>
            </PortletBody>
         </Portlet> 

    </>
  );

};

export default injectIntl(ManifiestoCupoEditPage);

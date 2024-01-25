import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import Form, { Item, GroupItem, EmptyItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';

import {
  handleErrorMessages,
  handleSuccessMessages,
  handleWarningMessages,
  handleInfoMessages,
  confirmAction
} from "../../../../store/ducks/notify-messages";


//Utils
import { dateFormat, dateFromString, isNotEmpty } from "../../../../../_metronic";

// import { serviceHorarioMasivo } from "../../../../api/asistencia/horarioMasivo.api";
// import { descargarPlantilla as objDescarga} from "../../../../api/asistencia/justificacionMasiva.api";
import { servicioJustificacionMasiva } from "../../../../api/asistencia/justificacionMasiva.api";
//servicioJustificacionMasiva

const JustificacionMasivaFormImportPage = (props) => {

  const { intl, setLoading, varIdCompania, companyName, companiaData, getCompanySeleccionada, setDataPersonasTemporal } = props;
  const classesEncabezado = useStylesEncabezado();
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);


  const procesarJustificacion = async (e) => {
    // console.log("const procesarJustificacion = async (e) - Import");
    let result = e.validationGroup.validate();

    if (!result.isValid) {
      return;
    }
    //Existe trabajadores
    if (props.dataPersonasTemporal.length > 0) { 
      //Despues de la validación existe trabajadores observados  Observado =N
      var personas = props.dataPersonasTemporal.filter(x => x.Observado === 'N');
      if (personas.length > 0) {
        //confirmar si continua proceso de asignacion de horario
        var response = await confirmAction(intl.formatMessage({ id: "ASSISTANCE.MASSIVE.JUSTIFICATION.MSG.REPLACE" }), intl.formatMessage({ id: "COMMON.YES" }), intl.formatMessage({ id: "COMMON.NOT" }));
        if (response.isConfirmed) {
          //Procesar personas aquellos trabajadores sin observación
          let listPersonas = []; 
console.log("personas :> ",personas);
          personas.map(item => 
            listPersonas.push({
              ...item,
              FechaInicio: dateFormat(dateFromString(item.FechaInicio), 'yyyyMMdd'),
              FechaFin: dateFormat(dateFromString(item.FechaFin), 'yyyyMMdd'),
              InicioEnfermedad: isNotEmpty(item.InicioEnfermedad)?dateFormat(dateFromString(item.InicioEnfermedad), 'yyyyMMdd'):'',
              FinEnfermedad: isNotEmpty(item.FinEnfermedad)?dateFormat(dateFromString(item.FinEnfermedad), 'yyyyMMdd'):'',
              InicioCertificado: isNotEmpty(item.InicioCertificado)?dateFormat(dateFromString(item.InicioCertificado), 'yyyyMMdd'):'' 
            }) 
          ); 
          console.log("listPersonas :> ",listPersonas);
          props.procesarPersonasMasivo(listPersonas);
        }
      }
      else {
        handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES.MSG" }));

      }
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ASSISTANCE.MASSIVE.SCHEDULES.MSG.MISSINGADD" }));
    }

  }

  async function descargarPlantilla(e) {

    setLoading(true);
    await servicioJustificacionMasiva.descargarPlantilla({ IdDivision, IdCompania: varIdCompania, Compania: companyName, FileName: "ImportarJustificaciones" })
      .then(resp => {
        if (resp.error === 0) {
          let temp = `data:application/vnd.ms-excel;base64,${encodeURIComponent(resp.fileBase64)}`;
          //console.log("descargarPlantilla|temp:", temp);
          let download = document.getElementById('iddescargaformato');
          download.href = temp;
          download.download = `${resp.nombre}.xlsx`;
          download.click();
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
        }
      }).catch(error => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), error);
        // setProcesados(false);
      }).finally(() => {
        setLoading(false);
      });
    //} 
  }

  const importarJustificacionExcel = async (e) => {

    let inputFile = document.getElementById(`btn_Excel_0001`);

    if (inputFile.files.length == 0) {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.MASIVO.VALIDAREXCEL.MENSAJE" }));
      return;
    }
    let x = inputFile.files[0];

    if (x == "" && x == undefined) {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.MASIVO.VALIDAREXCEL.MENSAJE" }));
      return;
    }

    let filebase64 = await fileToBase64(x);
    let archivo = isNotEmpty(filebase64[0]) ? filebase64[0] : "";

    if (!isNotEmpty(archivo)) {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.MASIVO.VALIDAREXCEL.MENSAJE" }));
      return;
    }
    let param = {
      IdDivision,
      IdCompania: varIdCompania
    }

    setLoading(true);
    await servicioJustificacionMasiva.importarJustificaciones({
      ...param,
      File: archivo
    }).then(async res => {
      // console.log("Resultado-->", res.Resultado);
      //  console.log("Resultado->res->", { res });
      setDataPersonasTemporal(res);
      //setDataProcesados(res.data);
      handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "ADMINISTRATION.MASIVO.MESSAGES.SUCCESS" }));

    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(res => {
      setLoading(false);
    })
    document.getElementById(`btn_Excel_0001`).value = null;

  }

  async function fileToBase64(file) {
    // create function which return resolved promise | with data:base64 string
    function getBase64(file) {
      const reader = new FileReader()
      return new Promise(resolve => {
        reader.onload = ev => {
          resolve(ev.target.result)
        }
        reader.readAsDataURL(file)
      })
    }
    // here will be array of promisified functions
    const promises = []
    // loop through fileList with for loop
    promises.push(getBase64(file))
    // array with base64 strings
    return await Promise.all(promises);
  }

  useEffect(() => {

  }, []);


  return (
    <Fragment>
      <a id="iddescargaformato" className="" ></a>
      <PortletHeader
        title={props.titulo}
        toolbar={
          <PortletHeaderToolbar>

            <Button
              icon="fa flaticon2-gear"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.PROCESS" })}
              onClick={procesarJustificacion}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              visible={props.modoEdicion ? true : false}
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

      <PortletBody >
        {/* <React.Fragment> */}
        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" disabled={props.disabledFiltrosFrm} >
          <GroupItem itemType="group" colCount={4} >

            <Item colSpan={4}>
              <AppBar position="static" className={classesEncabezado.secundario}>
                <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                  <Typography variant="h6" color="inherit" className={classesEncabezado.title}>{intl.formatMessage({ id: "COMMON.DATA" })}  </Typography>
                </Toolbar>
              </AppBar>
            </Item>

            <Item colSpan={2}
              dataField="IdCompania"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
              editorType="dxSelectBox"
              isRequired={true}
              editorOptions={{
                items: companiaData,
                valueExpr: "IdCompania",
                displayExpr: "Compania",
                //showClearButton: true,
                searchEnabled: true,
                value: varIdCompania,
                onValueChanged: (e) => {
                  if (isNotEmpty(e.value)) {
                    var company = companiaData.filter(x => x.IdCompania === e.value);
                    getCompanySeleccionada(e.value, company);
                  }
                }
              }}
            />
            <Item dataField="FechaInicio" visible={false} />
            <Item dataField="FechaFin" visible={false} />

          </GroupItem>

          <GroupItem itemType="group" colCount={4}>
            <Item label={{ text: intl.formatMessage({ id: "ADMINISTRATION.MASIVO.DOWNLOADTEMPLATE" }) }} >

              <Button
                icon="fa flaticon2-arrow-down"
                type="default"
                //text={intl.formatMessage({ id: "ACTION.DOWNLOAD" })}
                hint={intl.formatMessage({ id: "ACTION.DOWNLOAD" })}
                onClick={descargarPlantilla}
              />

              {/* <input
                type="button"
                className="btn btn-primary btn-azul card-button-azul"
                value={intl.formatMessage({ id: "ACTION.DOWNLOAD" })}
                style={{ width: "96px", marginRight: "50px" }}
                onClick={descargarPlantilla}
              /> */}

            </Item>
            <Item colSpan={2} label={{ text: intl.formatMessage({ id: "COMMON.FILE" }) }}>
              <input className="form-control"
                type="file"
                id="btn_Excel_0001"
                accept={'.xls, .xlsx'}
              />
            </Item>
            <Item label={{ text: intl.formatMessage({ id: "ACTION.IMPORT" }) }} >

              <Button
                icon="fa flaticon2-arrow-up"
                type="default"
                //text={intl.formatMessage({ id: "ACTION.IMPORT" })}
                hint={intl.formatMessage({ id: "ACTION.IMPORT" })}
                onClick={importarJustificacionExcel}
              />
              {/* <input
                type="button"
                className="btn btn-primary btn-azul card-button-azul"
                value={intl.formatMessage({ id: "ACTION.IMPORT" })}
                onClick={importarJustificacionExcel}
              /> */}
            </Item>

          </GroupItem>

        </Form>

      </PortletBody>


    </Fragment >
  );
};


export default injectIntl(WithLoandingPanel(JustificacionMasivaFormImportPage));

import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import { useSelector } from "react-redux";
import Form, { 
  Item,
  GroupItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
  } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import DataGrid, {
    Column,
    Editing,
    Paging,
    Selection,
    FilterRow,
} from 'devextreme-react/data-grid';
import { Popup } from 'devextreme-react/popup';

import { listar as ObtenerCampamentoPerfil} from "../../../../api/campamento/perfil.api";
import CampamentoPerfilBuscar from "../../../../partials/components/CampamentoPerfilBuscar";

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";


const CompaniaPerfilEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton  } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [dataPerfil, setPerfiles] = useState([]);
  
  const [isVisiblePopUpPerfil, setisVisiblePopUpPerfil] = useState(false);


  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();

    setEstadoSimple(estadoSimple);

  }

  async function listarPerfil() {

    let data =  ObtenerCampamentoPerfil({
    IdCliente: perfil.IdCliente ,
    IdDivision : perfil.IdDivision , 
    NumPagina: 0,
    TamPagina: 0});
    setPerfiles(data);
    console.log("listarPerfil",data)
  
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarCompaniaPerfil(props.dataRowEditNew);
      } else {
        props.actualizarCompaniaPerfil(props.dataRowEditNew);
      }
    }
  }

//   const onRowDblClickPerfil = row => {
//     const { IdPerfil, Perfil } = row.data

//     props.dataRowEditNew.IdPerfil = IdPerfil;
//     props.dataRowEditNew.Perfil = Perfil;
//     setisVisiblePopUpPerfil(false);
// }

const selectCompaniaPerfil = (data) => {
  console.log("selectCompaniaPerfilªdata",data);
  const { IdPerfil, Perfil } = data[0];
   props.dataRowEditNew.IdPerfil = IdPerfil;
   props.dataRowEditNew.Perfil = Perfil;  
   
   setisVisiblePopUpPerfil(false);
}

const isRequiredRule = (id) => {
  return modoEdicion ? false : isRequired(id, settingDataField);
}

  useEffect(() => {
    cargarCombos();
    listarPerfil();
  }, []);

  return (
    <>
      <PortletHeader
        title={props.titulo}
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
              disabled={!accessButton.grabar}
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
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
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

              <Item dataField="Perfil" 
                    isRequired={modoEdicion}
                    label={{ text: intl.formatMessage({ id: "CAMP.PROFILE.PROFILE" }) }}
                    editorOptions={{
                    readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                    hoverStateEnabled: false,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    showClearButton: true,
                    buttons: [{
                    name: 'search',
                    location: 'after',
                    useSubmitBehavior: true,
                    options: {
                            stylingMode: 'text',
                            icon: 'search',
                            onClick: () => {
                            setisVisiblePopUpPerfil(true);
                            },
                            }
                    }]

                    }}
                    />

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false),
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                }}
              />
            </GroupItem>
          </Form>

     {/*******>POPUP DE PERFIL >******** */}
      <CampamentoPerfilBuscar
            selectData={selectCompaniaPerfil}
            showPopup={{ isVisiblePopUp: isVisiblePopUpPerfil, setisVisiblePopUp: setisVisiblePopUpPerfil }}
            cancelar={() => setisVisiblePopUpPerfil(false)}
            //selectionMode={"row"}
            uniqueId ={"CampamentoPerfilBuscarCompaniaPerfilEditPage"}
            //showButton ={true} //false
        /> 

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(CompaniaPerfilEditPage);

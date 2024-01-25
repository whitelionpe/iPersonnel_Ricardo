import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";//Multi-idioma
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
//import { service as serviceTipoVehiculo } from "../../../../api/acreditacion/TipoVehiculo.api";
import AdministracionTipoVehiculoBuscar from "../../../../../partials/components/AdministracionTipoVehiculoBuscar";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { isNotEmpty } from "../../../../../../_metronic";

import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";

const PerfilTipoVehiculoEditPage = props => {

  const { intl, setLoading } = props;
  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUpTipoVehiculos, setisVisiblePopUpTipoVehiculos] = useState(false);


  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarRegistro(props.dataRowEditNew);
      } else {
        //props.actualizarRegistro(props.dataRowEditNew);
      }
    }
  }

  function agregar(dataPopup) {
    const { IdCliente, TipoVehiculo, IdTipoVehiculo, Orden } = dataPopup[0];

    if (isNotEmpty(IdTipoVehiculo)) {
      props.dataRowEditNew.TipoVehiculo = TipoVehiculo;
      props.dataRowEditNew.IdTipoVehiculo = IdTipoVehiculo;
      props.dataRowEditNew.Orden = Orden;
      setisVisiblePopUpTipoVehiculos(false);

    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
    }

  }



  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  useEffect(() => {
    //cargarCombos();
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
              <Item dataField="IdCliente" visible={false} />
              <Item dataField="IdPerfil" visible={false} />
              <Item dataField="IdTipoVehiculo" visible={false} />
              <Item
                colSpan={1} dataField="TipoVehiculo" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.TYPEVEHICLE" }), }}
                editorOptions={{
                  readOnly: true,
                  hoverStateEnabled: false,
                  inputAttr: { style: "text-transform: uppercase" },
                  showClearButton: true,
                  buttons: [
                    {
                      name: "search",
                      location: "after",
                      useSubmitBehavior: true,
                      options: {
                        stylingMode: "text",
                        icon: "search",
                        disabled: !props.dataRowEditNew.esNuevoRegistro,
                        onClick: (evt) => {
                          setisVisiblePopUpTipoVehiculos(true);
                        },
                      },
                    },
                  ],
                }}
              />


            </GroupItem>
          </Form>


          {/* POPUP TipoVehiculoS   ++++++++++++++++++++++++++- */}
          <AdministracionTipoVehiculoBuscar
            selectData={agregar}
            showPopup={{ isVisiblePopUp: isVisiblePopUpTipoVehiculos, setisVisiblePopUp: setisVisiblePopUpTipoVehiculos }}
            cancelarEdicion={() => setisVisiblePopUpTipoVehiculos(false)}
            selectionMode={"multiple"}
            showButton={true}
          />

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(WithLoandingPanel(PerfilTipoVehiculoEditPage));

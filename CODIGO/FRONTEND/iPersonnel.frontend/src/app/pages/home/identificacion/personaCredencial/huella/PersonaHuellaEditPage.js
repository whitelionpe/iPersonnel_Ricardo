import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { Portlet, PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { convertyyyyMMddToFormatDate, dateFormat, isNotEmpty,toAbsoluteUrl } from "../../../../../../_metronic";
import PropTypes from 'prop-types';
import CardFoto from "../../../../../partials/content/cardFoto";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import {handleErrorMessages} from "../../../../../store/ducks/notify-messages";
import ImageViewer from "../../../../../partials/components/ImageViewer/ImageViewer";
import {obtener} from "../../../../../api/identificacion/personaHuella.api";


const PersonaHuellaEditPage = props => {
  const[huella1, setHuella1] = useState("");
  const[huella2, setHuella2] = useState("");
  const[huella3, setHuella3] = useState("");

  const { intl } = props;
  const classesEncabezado = useStylesEncabezado();

  const { IdCliente  } = useSelector(state => state.perfil.perfilActual);

  useEffect(() => {
    const interval = setInterval(()=>{
      //obtiene las huellas de la persona
      obtener({ IdPersona: props.varIdPersona, IdCliente: IdCliente })
        .then(data => {
          if (isNotEmpty(data)) {
            setHuella1(data.Huella1 !== null ? toAbsoluteUrl("/media/products/FingerPrint.jpg") : "");

            setHuella2(data.Huella2 !== null ? toAbsoluteUrl("/media/products/FingerPrint.jpg") : "");

            setHuella3(data.Huella3 !== null ? toAbsoluteUrl("/media/products/FingerPrint.jpg") : "");
          }
          else{
            setHuella1("");
            setHuella2("");
            setHuella3("");
          }
        })
        .catch(err => {
          console.log(err);
        }).finally(() => {
        });
    }, 500);

    return () => clearInterval(interval);
  },[]);

    return (
        <>
            <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <Button
                                    icon="fa fa-fingerprint"
                                    type="normal"
                                    hint={"Enrolar"}
                                    onClick={props.ejecutarEnrolador}
                                />
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
            <PortletBody >
                <React.Fragment>
                    <Form validationGroup="FormEdicion" formData={props.dataRowEditNew} >
                        <GroupItem itemType="group" colCount={3} colSpan={3}>
                            <Item colSpan={3}>
                                <AppBar position="static" className={classesEncabezado.secundario}>
                                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                            {intl.formatMessage({ id: "IDENTIFICATION.PERSON.FOOTPRINT" })}
                                        </Typography>
                                    </Toolbar>
                                </AppBar>
                            </Item>
                            <Item dataField="IdPersona" visible={false} />
                            <Item dataField="IdCliente" visible={false} />
                            <Item >
                                <Portlet >
                                    <PortletHeader title={intl.formatMessage({ id: "IDENTIFICATION.PERSON.FOOTPRINT01" })} />
                                    <PortletBody >
                                        <div className="d-flex justify-content-center"  >
                                            <div id="container-media" style={{ marginBottom: '10px' }}>
                                                <ImageViewer
                                                    //defaultImage={huella1 != null ? toAbsoluteUrl("/media/products/FingerPrint.jpg") : null}
                                                    defaultImage={huella1}
                                                    width={192}
                                                    height={192}
                                                    intl={intl}
                                                    mostrarDimensiones={false}
                                                />
                                            </div>
                                        </div>
                                    </PortletBody>
                                </Portlet >
                            </Item>
                            <Item>
                                <Portlet >
                                    <PortletHeader title={intl.formatMessage({ id: "IDENTIFICATION.PERSON.FOOTPRINT02" })} />
                                    <PortletBody >
                                        <div className="d-flex justify-content-center">
                                            <div id="container-media" style={{ marginBottom: '10px' }}>
                                                <ImageViewer
                                                    //defaultImage={huella2 != null ? toAbsoluteUrl("/media/products/FingerPrint.jpg") : null}
                                                    defaultImage={huella2}
                                                    width={192}
                                                    height={192}
                                                    intl={intl}
                                                    mostrarDimensiones={false}
                                                />
                                            </div>
                                        </div>
                                    </PortletBody>
                                </Portlet>
                            </Item>

                            <Item>
                                <Portlet >
                                    <PortletHeader title={intl.formatMessage({ id: "IDENTIFICATION.PERSON.FOOTPRINT03" })} />
                                    <PortletBody >
                                        <div className="d-flex justify-content-center">
                                            <div id="container-media" style={{ marginBottom: '10px' }}>
                                                <ImageViewer
                                                    //defaultImage={huella3 != null ? toAbsoluteUrl("/media/products/FingerPrint.jpg") : null}
                                                    defaultImage={huella3}
                                                    width={192}
                                                    height={192}
                                                    intl={intl}
                                                    mostrarDimensiones={false}
                                                />
                                            </div>
                                        </div>
                                    </PortletBody>
                                </Portlet>
                            </Item>
                        </GroupItem>

                    </Form>
                </React.Fragment>

            </PortletBody>
        </>
    );
};
PersonaHuellaEditPage.propTypes = {
    titulo: PropTypes.string,
    modoEdicion: PropTypes.bool,
    showButtons: PropTypes.bool,
    showAppBar: PropTypes.bool,
    uploadImagen: PropTypes.bool,
    showHeaderInformation: PropTypes.bool,

}
PersonaHuellaEditPage.defaultProps = {
    titulo: "",
    modoEdicion: false,
    showButtons: true,
    showAppBar: true,
    uploadImagen: false,
    showHeaderInformation: true,
}

export default injectIntl(PersonaHuellaEditPage);

import React, { Fragment, useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { Popup } from "devextreme-react/popup";
import styled from "@emotion/styled";
import "../../../../../../../partials/content/Acreditacion/PopupFile/PopupFile.css";

const DivHeader = styled.div`
  font-family: "Helvetica Neue", "Segoe UI", Helvetica, Verdana, sans-serif;
  width: 100%;
  height: 100%;
  display: flex;
`;

const DivHeaderTitle = styled.div`
  font-size: 15px;
  font-family: "Helvetica Neue", "Segoe UI", Helvetica, Verdana, sans-serif;
  text-transform: uppercase;
  font-weight: bold;
  height: auto;
  margin-top: auto;
  margin-bottom: auto;
  color: white;
`;

const SpinnerByEstado = ({ Estado }) => {
  return (
    <div className="col-2">
      {Estado === "P" ? (
        <div className="spinner_file"></div>
      ) : Estado === "T" ? (
        <i className={"dx-icon-todo file-ok"}></i>
      ) : Estado === "E" ? (
        <i className={"dx-icon-remove file-error"}></i>
      ) : (
        <span style={{ fontSize: "9px", color: "gray" }}>Sin datos</span>
      )}
    </div>
  );
};

const VisitaPopupMensaje = ({
  showPopup = { isVisiblePopUp: false, setisVisiblePopUp: () => {} },
  Titulo = "",
  ListaDatos = [],
  eventoBoton = () => {},
  verBoton,
  intl
}) => {
  const paintTitle = () => {
    return (
      <DivHeader>
        <DivHeaderTitle>
          <b>{Titulo}</b>
        </DivHeaderTitle>
        <div style={{ marginLeft: "auto", marginRigth: "0" }}></div>
      </DivHeader>
    );
  };

  return (
    <>
      <Popup
        visible={showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        //showTitle={false}
        height={"300px"}
        width={"40%"}
        //title={paintTitle()}
        titleRender={paintTitle}
        onHiding={() => showPopup.setisVisiblePopUp(!showPopup.isVisiblePopUp)}
      >
        <div style={{ width: "100%", height: "100%", display: "flex" }}>
          <div style={{ width: "100%", overflowY: "auto" }}>
            <div className={"barra-titulo"}>
              {intl.formatMessage({ id: "ACCREDITATION.TITLE.POPUP.FILE" })}
            </div>

            <div className={"file-barra-estados-up"}>
              <div
                className="row"
                style={{
                  background: "#000000",
                  color: "white",
                  paddingLeft: "10px"
                }}
              >
                <div className="col-5">Invitado</div>
                <div className="col-2">Creado</div>
                <div className="col-2">Foto</div>
                <div className="col-2">Requisitos</div>
              </div>
              {ListaDatos.map((x, i) => (
                <div key={`EST_ALERT_${i}`} className="row">
                  <div className="col-5">
                    <span className={"texto-file"}> {x.Documento}</span>
                  </div>
                  <div className="col-2">
                    <SpinnerByEstado Estado={x.EstadoCreado} />
                  </div>
                  <div className="col-2">
                    <SpinnerByEstado Estado={x.EstadoFoto} />
                  </div>
                  <div className="col-2">
                    <SpinnerByEstado Estado={x.EstadoRequisito} />
                  </div>
                </div>
              ))}
            </div>

            {verBoton ? (
              <>
                <div className={"file-boton-cerrar-padre"}>
                  <div className={"file-boton-cerrar"}>
                    {/* <input value="Cerrar" type="button" onClick={eventoBoton} /> */}

                    <Button
                      icon="fa fa-times-circle"
                      text="Cerrar"
                      type="default"
                      hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                      onClick={eventoBoton}
                    />
                  </div>
                </div>
              </>
            ) : null}

            {/* <i className={"dx-icon-remove"}></i>
                        <i className={"dx-icon-todo"}></i>
                        <i className={"dx-icon-pulldown"}></i>
                        <div className="spinner_file"></div> */}
          </div>
        </div>
      </Popup>
    </>
  );
};

export default VisitaPopupMensaje;

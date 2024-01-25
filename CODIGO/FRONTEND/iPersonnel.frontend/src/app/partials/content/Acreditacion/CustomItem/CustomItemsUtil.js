import React, { Fragment } from "react";

import styled from "@emotion/styled";
import "../DynamicColumns.css";
import { Button, TextBox, Label } from "devextreme-react";
import notify from "devextreme/ui/notify";
import {
  OverlayTrigger,
  Tooltip,
  Dropdown,
  ButtonGroup,
  Button as ButtonBS
} from "react-bootstrap";

import { Tooltip as ToolTipoReact } from "devextreme-react/tooltip";
import { isNotEmpty } from "../../../../../_metronic";
import { ItemText } from "./CustomItemInputs";
import TextBoxItem from "../Inputs/TextBox";
import TextAreaItem from "../Inputs/TextAreaBox";

/* *** Syled Components ****************************/
export const DivObservedBox = styled.div`
  width: 50px;
  text-align: center;
  margin-top: auto;
  margin-bottom: auto;
`;


/******************************************************* */

export const CustomItem = ({
  children = [],
  item = {},
  EstadoAprobacionRequisito = "",
  RechazoIndisciplina = "S",
  modoEdicion = false,
  dataRowEditRequisitos = [],
  EstadoAprobacion = "",
  IdSolicitud,
  //   eventClick = () => {
  //     console.log("ObservedItemCell eventClick");
  //   },
  eventViewDocument = () => {
    console.log("ObservedItemCell eventViewDocument");
  },
  intl
}) => {
  let readOnly =
    !modoEdicion || item.Automatico
      ? true
      : item.EstadoAprobacion === "O" && EstadoAprobacionRequisito === "O"
        ? false
        : item.EstadoAprobacion === "P" && EstadoAprobacionRequisito === "O"
          ? true
          : false;

  // console.log({ children, item });
  return (
    <div className="row" key={`DR_${item.Index}_INDEX`}>
      {React.cloneElement(children, {
        Item: item,
        readOnly,
        Elements: dataRowEditRequisitos
      })}
      {item.Tipo !== "G" && (
        <TextAreaItem
          label={intl.formatMessage({ id: "COMMON.OBSERVATION" }).toUpperCase()}
          elements={item}
          name="Observacion"
          colSpan={5}
          labelTop={true}
          readOnly={true}
        />
      )}
      <div className="col-3">
        {item.AdjuntarArchivo === "N" ? (
          <ObservedItemCell
            item={item}
            RechazoIndisciplina={RechazoIndisciplina}
            modoEdicion={modoEdicion}
            // eventClick={eventClick}
            intl={intl}
          />
        ) : (
          <ItemFileCell
            item={item}
            IdSolicitud={IdSolicitud}
            EstadoAprobacion={EstadoAprobacion}
            modoEdicion={modoEdicion}
            RechazoIndisciplina={RechazoIndisciplina}
            eventViewDocument={eventViewDocument}
            // eventClick={eventClick}
            intl={intl}
          />
        )
          //   createItemFile(item)
        }
      </div>
    </div>
  );
};

export const ItemFileCell = ({
  item,
  IdSolicitud,
  EstadoAprobacion,
  modoEdicion,
  RechazoIndisciplina,
  eventViewDocument,
  //   eventClick,
  intl
}) => {
  let css = "btn_upload_not_file";

  let EstadoItem = isNotEmpty(item.EstadoAprobacion) ? item.EstadoAprobacion : "";
  EstadoAprobacion = isNotEmpty(EstadoAprobacion) ? EstadoAprobacion.trim() : "P";
  EstadoAprobacion = isNotEmpty(EstadoAprobacion) ? EstadoAprobacion : "P";
  IdSolicitud = isNotEmpty(IdSolicitud) ? IdSolicitud : 0;
  EstadoItem = isNotEmpty(EstadoItem.replace(" ", "")) ? EstadoItem : "P";

  let verObservados = modoEdicion && EstadoItem === "O";

  let solicitudNueva =
    EstadoAprobacion === "P" &&
    modoEdicion &&
    IdSolicitud === 0 &&
    EstadoItem === "P";

  let verPendientes =
    IdSolicitud > 0 &&
    modoEdicion &&
    EstadoAprobacion === "P" &&
    EstadoItem === "P";

  return (
    <>
      <br />
      <div style={{ display: "flex" }}>
        <ObservedItem
          item={item}
          RechazoIndisciplina={RechazoIndisciplina}
          modoEdicion={modoEdicion}
          //eventClick={eventClick}
          intl={intl}
        />

        <DivObservedBox>
          {item.NombreArchivo !== "" ? (
            <Button
              icon="fa fa-eye"
              type="default"
              hint={item.NombreArchivo}
              id={`gbi_${item.Index}`}
              onClick={async e => {
                e.event.preventDefault();
                eventViewDocument(item);
              }}
              useSubmitBehavior={true}
              style={{ margin: "auto", display: "table" }}
            />
          ) : null}
        </DivObservedBox>
        <DivObservedBox>
          {verObservados || item.Automatico || verPendientes || solicitudNueva ? (
            <Button
              icon="fa fa-upload"
              type="default"
              hint={"Subir"}
              id={`gb_${item.Index}`}
              className={`float-right btn_wizard_upload ${css}`}
              onClick={e => {
                document.getElementById(`btn_${item.Index}`).click();
              }}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              style={{ marginLeft: "10px" }}
            />
          ) : null}
        </DivObservedBox>
      </div>
    </>
  );
};

export const ObservedItemCell = ({
  item = {},
  RechazoIndisciplina = "S",
  modoEdicion = false,
  //   eventClick = () => {
  //     console.log("ObservedItemCell eventClick");
  //   },
  intl
}) => {
  return (
    <div style={{ display: "flex" }}>
      <ObservedItem
        item={item}
        RechazoIndisciplina={RechazoIndisciplina}
        modoEdicion={modoEdicion}
        //eventClick={eventClick}
        intl={intl}
      />
      <DivObservedBox></DivObservedBox>
      <DivObservedBox></DivObservedBox>
    </div>
  );
};

export const ObservedItem = ({
  item = {},
  RechazoIndisciplina = "S",
  modoEdicion = false,
  //   eventClick = () => {
  //     console.log("createItemObservado eventClick");
  //   },
  intl
}) => {
  let processedRecord =
    item.EstadoAprobacion === "O" ||
    item.EstadoAprobacion === "R" ||
    item.EstadoAprobacion === "A";

  let viewObervacion = RechazoIndisciplina !== "S";
  let nuevoId = `id_${item.IdRequisito}_${item.Value}_${item.EstadoAprobacion}_EST`;

  //Styles:
  let styleDivIcon = { marginRight: "3px", marginTop: "2px" };
  let styleDivGridObserverd = { width: "100%", display: "flex" };
  let styleDivGridObserverdItem = { marginLeft: "auto", marginRight: "auto" };

  const eventClick = value => {
    let elemento = document.getElementById(`${item.Index}|CHECKBUTTON`);
    let elementoObs = document.getElementById(`${item.Index}|OBSBUTTON`);

    elemento.classList.remove("btn-observado");
    elemento.classList.remove("btn-pendiente");
    elemento.classList.remove("btn-rechazado");
    elemento.classList.remove("btn-aprobado");

    elementoObs.classList.remove("btn-observado");
    elementoObs.classList.remove("btn-pendiente");
    elementoObs.classList.remove("btn-rechazado");
    elementoObs.classList.remove("btn-aprobado");

    let tipo =
      value === "A"
        ? "btn-aprobado"
        : value === "R"
          ? "btn-rechazado"
          : value === "O"
            ? "btn-observado"
            : "btn-pendiente";
    let descripcion =
      value === "A"
        ? "Aprobado"
        : value === "R"
          ? "Rechazado"
          : value === "O"
            ? "Observado"
            : "Pendiente";

    elemento.classList.add(tipo);
    elemento.firstChild.data = descripcion;

    elementoObs.classList.add(tipo);
  };

  return processedRecord ? (
    <Fragment>
      <DivObservedBox>
        <div id={nuevoId} style={styleDivIcon}>
          <i className="dx-icon-user"></i>
        </div>
        <ToolTipoReact
          target={`#${nuevoId}`}
          showEvent="dxhoverstart"
          hideEvent="dxhoverend"
          position="left"
        >
          <div style={{ textAlign: "left" }}>
            <strong>
              {intl.formatMessage({ id: "AUTH.INPUT.USERNAME" }).toUpperCase()}
              :&nbsp;
            </strong>
            {item.UsuarioAprobacion}
            <br />
            <strong>
              {intl
                .formatMessage({ id: "ACCESS.PERSON.MARK.DATE" })
                .toUpperCase()}
              :&nbsp;
            </strong>
            {item.FechaAprobacion}
            <br />
            <strong>
              {intl
                .formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" })
                .toUpperCase()}
              :&nbsp;
            </strong>
            {item.HoraAprobacion}
          </div>
        </ToolTipoReact>
      </DivObservedBox>
      <div style={styleDivGridObserverd}>
        <ButtonGroup style={styleDivGridObserverdItem}>
          <OverlayTrigger
            // trigger="click"
            key={"botton"}
            placement={"left"}
            overlay={
              <Tooltip id="button-tooltip" className={"bordertooltip"}>
                <strong>Observación:</strong>
                <br />
                {viewObervacion ? item.Observacion : ""}
              </Tooltip>
            }
          >
            <ButtonBS
              id={`${item.Index}|OBSBUTTON`}
              className={`font-weight-bold btn-verobs ${item.EstadoAprobacion === "A"
                ? "btn-aprobado"
                : item.EstadoAprobacion === "R"
                  ? "btn-rechazado"
                  : item.EstadoAprobacion === "O"
                    ? "btn-observado"
                    : "btn-pendiente"
                }`}
            >
              <i className="fas fa-clipboard-list"></i>
            </ButtonBS>
          </OverlayTrigger>

          <Dropdown>
            <Dropdown.Toggle
              id={`${item.Index}|CHECKBUTTON`}
              className={`font-weight-bold btn-danger-solicitante ${item.EstadoAprobacion === "A"
                ? "btn-aprobado"
                : item.EstadoAprobacion === "R"
                  ? "btn-rechazado"
                  : item.EstadoAprobacion === "O"
                    ? "btn-observado"
                    : "btn-pendiente"
                }`}
            >
              {item.EstadoAprobacion === "A"
                ? "Aprobado"
                : item.EstadoAprobacion === "R"
                  ? "Rechazado"
                  : item.EstadoAprobacion === "O"
                    ? "Observado"
                    : "Pendiente"}
            </Dropdown.Toggle>
            {modoEdicion ? (
              <Dropdown.Menu>
                <Dropdown.Item
                  href="#"
                  onClick={e => {
                    eventClick("P");
                  }}
                >
                  Pendiente
                </Dropdown.Item>
                <Dropdown.Item
                  href="#"
                  onClick={e => {
                    eventClick("O");
                  }}
                >
                  Observado
                </Dropdown.Item>
              </Dropdown.Menu>
            ) : null}
          </Dropdown>
        </ButtonGroup>
      </div>
    </Fragment>
  ) : null;
};

export const HiddenInputFile = ({
  item = { AdjuntarArchivo: "N", Tipo: "A", Index: "0" },
  maxSizeFile = 5,
  dataRowEditRequisitos = [],
  optRequisito = [],
  setValueFile,
  intl
}) => {
  let isFileType = item.AdjuntarArchivo === "S" || item.Tipo === "A";
  const filtersFiles = ".pdf"; // Solo PDF ".png, .jpg, .jpeg, .pdf, .doc, .docx";
  //const refButton = useRef(null);

  const buscarArchivo = (e, item) => {
    let id = e.target.id.replace("btn_", "gb_");
    let files = e.target.files;

    let size = 1024 * 1024 * maxSizeFile;
    if (files.length > 0) {
      let archivoInfo = files[0].name.split(".");

      if (archivoInfo.length > 0) {
        let ext = archivoInfo.pop();
        if (ext.toUpperCase() !== "PDF") {
          let type = "warning";
          let text = intl.formatMessage({ id: "ACCREDITATION.PDF.VALIDATION" });
          notify(text, type, 3000);
          return;
        }
      }

      //console.log("Peso del archivo :::", files[0].size);
      if (files[0].size > size) {
        let type = "warning";
        let text = intl.formatMessage({ id: "ACCREDITATION.PDF.WEIGHT" });

        text.replace("|", maxSizeFile);
        notify(text, type, 3000);

        return;
      }

      document.getElementById(id).classList.remove("btn_upload_not_file");
      document.getElementById(id).classList.add("btn_upload_file");



      if (item.Tipo === "A") {
        // console.log("Es de tipo archivo");
        // console.log("================================");
        // console.log({ dataRowEditRequisitos, item, optRequisito });
        dataRowEditRequisitos[item.Index] = files[0].name;

        // console.log({
        //     x: files,
        //     y: files[0].name
        // });

        setValueFile(files[0].name);
        for (let i = 0; i < optRequisito.length; i++) {
          if (optRequisito[i].Index === item.Index) {
            optRequisito[i].ViewAcreditacion = false;
          }
        }
        // console.log("=====================");
      }
    } else {
      document.getElementById(id).classList.remove("btn_upload_file");
      document.getElementById(id).classList.add("btn_upload_not_file");

      if (item.Tipo === "A") {
        dataRowEditRequisitos[item.Index] = "";
      }
    }
  };

  return isFileType ? (
    <input
      accept="image/*"
      key={`btn_${item.Index}`}
      id={`btn_${item.Index}`}
      // accept={filtersFiles}
      type="file"
      onChange={e => buscarArchivo(e, item)}
      style={{ display: "none" }}
    />
  ) : null;
};

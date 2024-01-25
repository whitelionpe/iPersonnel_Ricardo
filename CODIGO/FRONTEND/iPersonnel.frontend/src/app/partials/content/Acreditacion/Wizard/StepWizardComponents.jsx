import React, { Fragment, useState } from "react";
import {
  DivObservation,
  DivEstadoGeneral,
  DivTitleEstadoBar,
  DivTitleNewRecord,
  SpanStatus,
  DivStepHeader,
  DivStepVisible
} from "./StepWizardUtils";

export const zeroPad = (num, places) => {
  if (num != undefined && num != null && num > 0) {
    let zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }
  return "";
};

export const HeaderTitleAccreditation = ({
  isNewRecord = true,
  TitleRecord = "",
  IdSolicitud = 0,
  company = "",
  division = "",
  Observation = "",
  StatusCode = "",
  StatusDescription = "",
  IndiciplineRejectionFlag = "",
  RejectionDescripcion = ""
}) => {
  return isNewRecord ? (
    <Fragment>
      <DivTitleNewRecord>{TitleRecord}</DivTitleNewRecord>
      <CompanyDescription company={company} division={division} />
    </Fragment>
  ) : (
    <Fragment>
      <div className="title-bloque" style={{ display: "flex" }}>
        <div className="title-bloque-a">
          <DivEstadoGeneral>
            <DivTitleEstadoBar>
              {TitleRecord}
              <b>{zeroPad(IdSolicitud, 8)} </b>
            </DivTitleEstadoBar>
            <AccreditationStatus
              StatusCode={StatusCode}
              StatusDescription={StatusDescription}
              IndiciplineRejectionFlag={IndiciplineRejectionFlag}
              RejectionDescripcion={RejectionDescripcion}
            />
          </DivEstadoGeneral>
          <CompanyDescription company={company} division={division} />
        </div>
        <div className="title-bloque-a">
          <ObservedRequestDescription
            StatusCode={StatusCode}
            Observation={Observation}
          />
        </div>
      </div>
    </Fragment>
  );
};

export const AccreditationStatus = ({
  StatusCode = "",
  StatusDescription = "",
  IndiciplineRejectionFlag = "",
  RejectionDescripcion = ""
}) => {
  return StatusCode === "R" && IndiciplineRejectionFlag === "S" ? (
    <div>
      <SpanStatus Estado={StatusCode}>{StatusDescription}</SpanStatus>
      <span style={{ marginLeft: "10px", color: "red" }}>
        {RejectionDescripcion}
      </span>
    </div>
  ) : (
    <SpanStatus Estado={StatusCode}>{StatusDescription}</SpanStatus>
  );
};

export const CompanyDescription = ({ company = "", division = "" }) => {
  return (
    <div
      style={{
        textTransform: "uppercase",
        fontWeight: "bold",
        marginTop: "10px"
      }}
    >
      {company} - {division}
    </div>
  );
};

export const ObservedRequestDescription = ({
  StatusCode = "",
  Observation = ""
}) => {
  let visible =
    StatusCode === "A" && Observation !== null && Observation !== "";

  return visible ? (
    <DivObservation>
      <i className="dx-icon-warning"></i>
      <span>{Observation}</span>
    </DivObservation>
  ) : null;
};

export const StepBody = ({ currentStep = 0, children = [] }) => {
  return (
    <div className="row">
      <div className="col-12">
        {children.map((x, Index) => (
          <DivStepVisible
            key={`step_body${Index}`}
            id={`step_body${Index}`}
            visible={currentStep === Index}
          >
            {x}
          </DivStepVisible>
        ))}
      </div>
    </div>
  );
};

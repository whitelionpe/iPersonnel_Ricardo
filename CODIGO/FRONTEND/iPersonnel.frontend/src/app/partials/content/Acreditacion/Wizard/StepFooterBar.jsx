import React from "react";
import { Button, ButtonGroup } from "devextreme-react";
import { DivStepFooter } from "./StepWizardUtils";
import { colsSpanDefault } from "../../../../../_metronic";

const StepFooterBar = ({
  currentStep = 0,
  handleBackEvent = () => {
    console.log("StepFooterBar handleBackEvent");
  },
  handleNextEvent = () => {
    console.log("StepFooterBar handleNextEvent");
  },
  backButtonText = "",
  nextButtonText = "",
  hiddenNext = false,
  hiddenBack = false,
  lastStep = -1
}) => {
  return (
    <div className="row">
      <DivStepFooter
        className={`${colsSpanDefault(6)}`}
        style={{ display: "inline-flex" }}
      >
        <Button
          id="btn-step-back"
          icon="back"
          type="default"
          hint={backButtonText}
          text={backButtonText}
          onClick={handleBackEvent}
          disabled={currentStep === 0}
          className="classCerrarSesion"
          // style={{ textTransform: "uppercase", width: "120px" }}
        />
        <div
          style={{
            width: "25px",
            display: "inline-block"
          }}
        >
          &nbsp;
        </div>
        <Button
          id="btn-step-next"
          icon={currentStep === lastStep ? null : "chevronnext"}
          type="default"
          hint={nextButtonText}
          onClick={handleNextEvent}
          text={nextButtonText}
          className="classCerrarSesion link-btn-padding"
          // style={{ textTransform: "uppercase", width: "120px" }}
        />
      </DivStepFooter>
      <DivStepFooter className={`${colsSpanDefault(6)}`}></DivStepFooter>
    </div>
  );
};

export default StepFooterBar;

import React, { Fragment } from "react";
import StepHeader from "./StepHeader";

const StepHeaderBar = ({
  isNewRecord = true,
  steps = [],
  currentStep = 0,
  eventSelectTab = () => {
    console.log("eventSelectTab in StepHeaderBar");
  }
}) => {
  return (
    <div className="row">
      <div className="col-12">
        <div className="MuiPaper-root MuiStepper-root MuiStepper-horizontal MuiPaper-elevation0">
          {steps.map((x, i) => {
            return (
              <StepHeader
                key={`sh_${i}`}
                index={i}
                currentStep={currentStep}
                title={x.title}
                eventSelectTab={() => {
                  eventSelectTab(i);
                }}
                enable={!isNewRecord || (isNewRecord && i <= currentStep)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepHeaderBar;

import React, { useEffect, useState, Fragment } from 'react';
import './StepWizard.css';


import StepHeaderBar from "./StepHeaderBar";
import { StepBody } from './StepWizardComponents';
import StepFooterBar from './StepFooterBar';

const StepWizard = ({
    children = [],
    steps = [],
    currentStep = 0,
    isNewRecord = false,

    eventSelectTab = () => {
        console.log("StepWizard eventSelectTab");
    },
    handleBackEvent = () => {
        console.log("StepFooterBar handleBackEvent");
    },
    handleNextEvent = () => {
        console.log("StepFooterBar handleNextEvent");
    },
    backButtonText = "",
    nextButtonText = ""
}) => {

    return (
        <div >
            <StepHeaderBar
                steps={steps}
                currentStep={currentStep}
                isNewRecord={isNewRecord}
                eventSelectTab={eventSelectTab}
            />

            <StepBody currentStep={currentStep}  >
                {children}
            </StepBody>

            <StepFooterBar
                currentStep={currentStep}
                handleBackEvent={handleBackEvent}
                handleNextEvent={handleNextEvent}
                backButtonText={backButtonText}
                nextButtonText={nextButtonText}
            />
        </div>
    );
};

export default StepWizard;

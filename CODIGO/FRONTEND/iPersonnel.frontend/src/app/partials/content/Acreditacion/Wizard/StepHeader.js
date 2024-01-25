import React, { Fragment } from 'react';
import PropTypes from "prop-types"
import { DivStepHeader } from './StepWizardUtils';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';

const StepHeader = ({
    index = 0,
    styles = "",
    currentStep = 0,
    title = "",
    enable = false,
    eventSelectTab = () => { console.log("Configure eventSelectTab"); },
}) => {

    return (
        <Fragment key={`swf_key_${index}`}>
            {index == 0 ? null : (
                <div style={styles} className="MuiStepConnector-root MuiStepConnector-horizontal Mui-disabled" key={`line${index}`} >
                    <span className="MuiStepConnector-line MuiStepConnector-lineHorizontal"></span>
                </div>
            )}
            <DivStepHeader className="MuiStep-root MuiStep-horizontal"
                key={`step_${index}`}
                onClick={() => {
                    if (enable)
                        eventSelectTab();
                }}
                ENABLEHEADER={enable}
            >
                <span className="MuiStepLabel-root MuiStepLabel-horizontal">
                    <span className="MuiStepLabel-iconContainer">
                        <svg
                            id={`step_icon${index}`}
                            className={`    MuiSvgIcon-root MuiStepIcon-root 
                                                                    ${index <= currentStep ? "MuiStepIcon-active" : ""} 
                                                                    ${currentStep == index ? "step_icon_selected" : ""}
                                                               `}
                            focusable="false"
                            viewBox="0 0 24 24"
                            aria-hidden="true">
                            <circle cx="12" cy="12" r="12"></circle>
                            <text className="MuiStepIcon-text" x="12" y="16" textAnchor="middle">{index + 1}</text>
                        </svg>
                    </span>
                    <span className="MuiStepLabel-labelContainer">
                        <span id={`step_text${index}`}
                            className={`${currentStep == index ? "step_icon_selected" : ""}
                                        MuiTypography-root MuiStepLabel-label  MuiTypography-body2 MuiTypography-displayBlock`}>
                            {title}
                        </span>
                    </span>
                </span>
            </DivStepHeader>

            <div className="row" style={{ display: "none" }}>
                <div className="col-12">
                    <Stepper>
                        <Step key={"a"}  >
                            <StepLabel>{"a"}</StepLabel>
                        </Step>
                        <Step key={"b"}  >
                            <StepLabel>{"b"}</StepLabel>
                        </Step>
                    </Stepper>
                </div>
            </div>

        </Fragment>
    );
};


StepHeader.prototype = {
    currentStep: PropTypes.object.isRequired,
    index: PropTypes.object.isRequired,
    title: PropTypes.object.isRequired,
    styles: PropTypes.object
}

StepHeader.defaultProps = {
    currentStep: 0,
    index: 0,
    title: "",
    styles: {}
}

export default StepHeader;
import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../Portlet";

import { HeaderTitleAccreditation } from "../Wizard/StepWizardComponents";
import StepWizard from "../Wizard/StepWizard";

import { getStatusDescription } from "../Wizard/StepWizardUtils";
import { Button, Switch } from "devextreme-react";
import notify from "devextreme/ui/notify";
//import { isNotEmpty } from "../../../../../_metronic";

const RequestStructurePopup = ({
  intl,
  children = [],

  steps = [],
  dataRowEditNew = {},
  CompanyName = "",
  DivisionName = "",
  isEditMode = false,
  stepEnableButton = 0,

  viewAdd = false,
  viewSave = true,
  activeButtonAdd = -1,
  eventSaveProgress = () => {
    console.log("RequestStructurePopup eventSaveProgress");
  },
  eventCancelEdit = () => {
    console.log("RequestStructurePopup eventCancelEdit");
  },
  eventAdd = () => {
    console.log("RequestStructurePopup eventAdd");
  },
  validateFormDataByStepNumber = () => {
    console.log("RequestStructurePopup validateFormDataByStepNumber");
  },
  eventReturnHome = () => {
    console.log("RequestStructurePopup eventReturnHome");
  },
  setLoading = () => {
    console.log("setLoading not configured");
  },
  nextStepClickEvent = () => {
    console.log("nextStepClickEvent not configured");
  },
  additionalButtons = [],
  additionalSwitchs = [],
  hiddenNext = false,
  hiddenBack = false
}) => {
  console.log("RequestStructurePopup", { children });
  const totalStep = children.filter(x => typeof x === "object").length;
  console.log("totalStep", { totalStep });

  //const penultimateStep = totalStep === 0 ? 0 : totalStep > 1 ? totalStep - 2 : totalStep - 1;
  const lastStep = totalStep === 0 ? 0 : totalStep - 1;
  const [enableSave, setEnableSave] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [nextButtonText, setNextButtonText] = useState(
    intl.formatMessage({ id: "COMMON.NEXT" })
  );

  /************************************************** */

  /* ***  USEEFFECT  *********************************** */
  useEffect(() => {
    if (currentStep === lastStep) {
      if (isEditMode) {
        setNextButtonText(intl.formatMessage({ id: "COMMON.FINALIZE" }));
      } else {
        setNextButtonText(
          intl.formatMessage({ id: "ACCREDITATION.MESSAGE.RETURN" })
        );
      }
    } else {
      setNextButtonText(intl.formatMessage({ id: "COMMON.NEXT" }));
    }
  }, [currentStep]);

  useEffect(() => {
    if (!dataRowEditNew.esNuevoRegistro) {
      setEnableSave(true);
    }
  }, []);

  /************************************************** */

  /* *** FUNCTIONS ***********************************/

  const handleBackEvent = () => {
    eventSetStep(currentStep - 1, currentStep);
  };

  const eventNextStep = () => {
    eventSetStep(currentStep + 1, currentStep);
  };

  const handleNextEvent = () => {
    let { isValidate, message } = validateFormDataByStepNumber(currentStep);

    //console.log("handleNextEvent", isValidate, message);
    if (isValidate) {
      if (currentStep + 1 === totalStep) {
        if (isEditMode) {
          eventSaveProgress(true);
        } else {
          setEnableSave(currentStep + 1 >= stepEnableButton);
          setLoading(false);
          eventReturnHome("");
        }
        return;
      } else {
        //console.log("Ejecuta eventNextStep");
        eventNextStep();
      }
    } else {
      const type = "error";
      const text = message;
      notify(text, type, 3000);
    }
  };

  const eventSelectTab = index => {
    let { esNuevoRegistro } = dataRowEditNew;

    if (esNuevoRegistro) {
      //console.log("Se debe validar el tab actual");
    } else {
      if (currentStep === index) {
        return false;
      }
      eventSetStep(index, currentStep);
    }
  };

  const eventSetStep = (index, oldIndex) => {
    nextStepClickEvent(index, oldIndex);
    let btnback = document.getElementById("btn-step-back");

    //Paso siguiente:
    let id = document.getElementById(`step_body${currentStep}`);
    let newId = document.getElementById(`step_body${index}`);

    id.classList.add("panel-hidden");
    newId.classList.add("panel-visiblen");

    id.classList.remove("panel-visible");
    newId.classList.remove("panel-hidden");

    //Si estamos en la primera pestaña se deshabilita el boton de retroceder:
    if (index === 0) {
      btnback.classList.add("Mui-disabled");
      btnback.disabled = true;
    } else {
      btnback.classList.remove("Mui-disabled");
      btnback.disabled = false;
    }

    if (isEditMode && !dataRowEditNew.esNuevoRegistro) {
      setEnableSave(true);
    } else {
      if (index >= stepEnableButton) {
        setEnableSave(true);
      } else {
        setEnableSave(false);
      }
    }

    setCurrentStep(index);
    updateSelectedStep(index);
  };

  const updateSelectedStep = stepIndex => {
    for (let i = 0; i < steps.length; i++) {
      if (i <= stepIndex) {
        document
          .getElementById(`step_icon${i}`)
          .classList.add("MuiStepIcon-active");
        document
          .getElementById(`step_text${i}`)
          .classList.remove("Mui-disabled");
        document
          .getElementById(`step_text${i}`)
          .classList.add("MuiStepLabel-active");
      } else {
        document
          .getElementById(`step_icon${i}`)
          .classList.remove("MuiStepIcon-active");
        document.getElementById(`step_text${i}`).classList.add("Mui-disabled");
        document
          .getElementById(`step_text${i}`)
          .classList.remove("MuiStepLabel-active");
      }

      //Quitar clase seleccionado:
      document
        .getElementById(`step_icon${i}`)
        .classList.remove("step_icon_selected");
      document
        .getElementById(`step_text${i}`)
        .classList.remove("step_icon_selected");
      if (i === stepIndex) {
        //Agregar clase seleccionado    step_text
        document
          .getElementById(`step_text${i}`)
          .classList.add("step_icon_selected");
        document
          .getElementById(`step_icon${i}`)
          .classList.add("step_icon_selected");
      }
    }
    //setLoading(false);
  };
  /************************************************* */

  return (
    <div className="row" style={{ width: "100%" }}>
      <div className={`col-12`}>

        <PortletBody>
          <div>
            <StepWizard
              steps={steps}
              currentStep={currentStep}
              isNewRecord={dataRowEditNew.esNuevoRegistro}
              eventSelectTab={eventSelectTab}
              handleBackEvent={handleBackEvent}
              handleNextEvent={handleNextEvent}
              backButtonText={intl.formatMessage({
                id: "AUTH.GENERAL.BACK_BUTTON"
              })}
              nextButtonText={nextButtonText}
              hiddenNext={hiddenNext}
              hiddenBack={hiddenBack}
            >
              {children}
            </StepWizard>
          </div>
        </PortletBody>
      </div>
    </div>
  );
};

export default injectIntl(RequestStructurePopup);
